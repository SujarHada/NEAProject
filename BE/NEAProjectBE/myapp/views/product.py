from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from datetime import datetime
from django.db.models import Count
import csv

from ..models import Product, ProductStatus, UnitOfMeasurement
from ..serializers import ProductSerializer
from ..permissions import StrictViewerOrAdmin

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [StrictViewerOrAdmin]
    filterset_fields = ["status"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'restore':
            return queryset.filter(status=ProductStatus.BIN)
        status_param = self.request.query_params.get("status")
        if status_param:
            return queryset.filter(status=status_param)
        return queryset.filter(status=ProductStatus.ACTIVE)

    def create(self, request, *args, **kwargs):
        name = request.data.get('name')
        company = request.data.get('company', '')
        
        if name and company:
            existing_product = Product.objects.filter(name=name, company=company, status=ProductStatus.ACTIVE).first()
            if existing_product:
                return Response(
                    {
                        "status": "error",
                        "message": f"A product with name '{name}' already exists for company '{company}'."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        return super().create(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        product_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.product_index_map = product_index_map

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        product_name = instance.name
        instance.status = ProductStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Product '{product_name}' has been moved to bin",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        instance = self.get_object()
        if instance.status == ProductStatus.ACTIVE:
            return Response(
                {"message": f"Product '{instance.name}' is already active."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        existing_active = Product.objects.filter(name=instance.name, company=instance.company, status=ProductStatus.ACTIVE).exclude(id=instance.id).first()
        if existing_active:
            return Response(
                {
                    "status": "error",
                    "message": f"Cannot restore product. An active product with name '{instance.name}' already exists for company '{instance.company}'."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.status = ProductStatus.ACTIVE
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Product '{instance.name}' has been restored.",
                "id": instance.id,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="products_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'ID', 'Name', 'Company', 'SKU', 'Remarks', 'Unit of Measurement', 'Status', 'Created At', 'Updated At'])
        for index, product in enumerate(queryset, start=1):
            writer.writerow([
                index, product.id, product.name, product.company, product.sku,
                product.remarks, product.get_unit_of_measurement_display(),
                product.get_status_display(), product.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                product.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response

    @action(detail=False, methods=['get'])
    def export_csv_simple(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="products_simple_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'Name', 'Company', 'SKU', 'Remarks', 'Unit', 'Status'])
        for index, product in enumerate(queryset, start=1):
            writer.writerow([
                index, product.name, product.company, product.sku, product.remarks,
                product.get_unit_of_measurement_display(), product.get_status_display()
            ])
        return response

    @action(detail=False, methods=['get'])
    def active_count(self, request):
        active_count = Product.objects.filter(status=ProductStatus.ACTIVE).count()
        return Response({'active_count': active_count})

    @action(detail=False, methods=['get'])
    def bin_count(self, request):
        bin_count = Product.objects.filter(status=ProductStatus.BIN).count()
        return Response({'bin_count': bin_count})

    @action(detail=False, methods=['get'])
    def company_stats(self, request):
        company_stats = Product.objects.filter(status=ProductStatus.ACTIVE).values('company').annotate(product_count=Count('id')).order_by('-product_count')
        return Response(company_stats)

    @action(detail=False, methods=['post'])
    def import_csv(self, request):
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({"status": "error", "message": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not csv_file.name.endswith('.csv'):
            return Response({"status": "error", "message": "Invalid file format."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            decoded_file = csv_file.read().decode('utf-8')
            csv_data = csv.reader(decoded_file.splitlines(), delimiter=',')
            headers = next(csv_data)
            headers_lower = [h.strip().lower() for h in headers]
            required_headers = ['name', 'company']
            missing_headers = [header for header in required_headers if header not in headers_lower]
            if missing_headers:
                return Response({"status": "error", "message": f"Missing required headers: {', '.join(missing_headers)}", "required_headers": required_headers, "found_headers": headers}, status=status.HTTP_400_BAD_REQUEST)
            
            results = {'total_rows': 0, 'successful': 0, 'failed': 0, 'errors': [], 'duplicates_skipped': 0}
            
            for row_num, row in enumerate(csv_data, start=2):
                if not any(row):
                    continue
                results['total_rows'] += 1
                try:
                    row_data = {}
                    for i, header in enumerate(headers):
                        if i < len(row):
                            row_data[header.strip().lower()] = row[i].strip()
                    name = row_data.get('name', '')
                    company = row_data.get('company', '')
                    if not name:
                        results['failed'] += 1
                        results['errors'].append(f"Row {row_num}: Product name is required")
                        continue
                    if not company:
                        results['failed'] += 1
                        results['errors'].append(f"Row {row_num}: Company name is required")
                        continue
                    existing_product = Product.objects.filter(name=name, company=company, status=ProductStatus.ACTIVE).first()
                    if existing_product:
                        results['duplicates_skipped'] += 1
                        results['errors'].append(f"Row {row_num}: Product '{name}' for company '{company}' already exists")
                        continue
                    product_data = {'name': name, 'company': company, 'remarks': row_data.get('remarks', ''), 'status': ProductStatus.ACTIVE}
                    unit_input = row_data.get('unit_of_measurement', '').lower()
                    if unit_input:
                        unit_mapping = {'nos': UnitOfMeasurement.NOS, 'set': UnitOfMeasurement.SET, 'kg': UnitOfMeasurement.KG, 'ltr': UnitOfMeasurement.LTR, 'pcs': UnitOfMeasurement.PCS, 'number': UnitOfMeasurement.NOS, 'numbers': UnitOfMeasurement.NOS, 'piece': UnitOfMeasurement.PCS, 'pieces': UnitOfMeasurement.PCS, 'kilogram': UnitOfMeasurement.KG, 'kilograms': UnitOfMeasurement.KG, 'liter': UnitOfMeasurement.LTR, 'liters': UnitOfMeasurement.LTR}
                        product_data['unit_of_measurement'] = unit_mapping.get(unit_input, UnitOfMeasurement.NOS)
                    else:
                        product_data['unit_of_measurement'] = UnitOfMeasurement.NOS
                    status_input = row_data.get('status', '').lower()
                    if status_input:
                        status_mapping = {'active': ProductStatus.ACTIVE, 'bin': ProductStatus.BIN, 'deleted': ProductStatus.BIN, 'inactive': ProductStatus.BIN}
                        product_data['status'] = status_mapping.get(status_input, ProductStatus.ACTIVE)
                    sku = row_data.get('sku', '')
                    if sku:
                        if Product.objects.filter(sku=sku).exists():
                            results['failed'] += 1
                            results['errors'].append(f"Row {row_num}: SKU '{sku}' already exists")
                            continue
                        product_data['sku'] = sku
                    product = Product.objects.create(**product_data)
                    results['successful'] += 1
                except Exception as e:
                    results['failed'] += 1
                    results['errors'].append(f"Row {row_num}: {str(e)}")
                    continue
            
            response_data = {"status": "success", "message": f"CSV import completed. Successful: {results['successful']}, Failed: {results['failed']}, Duplicates Skipped: {results['duplicates_skipped']}", "results": results}
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"status": "error", "message": f"Error processing CSV file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def import_template(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="product_import_template.csv"'
        writer = csv.writer(response)
        writer.writerow(['# Required Fields: name, company'])
        writer.writerow(['# Optional Fields: remarks, unit_of_measurement, status, sku'])
        writer.writerow(['# Unit of Measurement options: nos, set, kg, ltr, pcs (or common names like: number, piece, kilogram, liter)'])
        writer.writerow(['# Status options: active, bin (default: active)'])
        writer.writerow(['# SKU: Leave empty to auto-generate'])
        writer.writerow([])
        writer.writerow(['name', 'company', 'remarks', 'unit_of_measurement', 'status', 'sku'])
        writer.writerow(['Laptop', 'Dell Inc', 'High performance laptop', 'nos', 'active', ''])
        writer.writerow(['Wireless Mouse', 'Logitech', 'Wireless mouse with USB receiver', 'pcs', 'active', 'LOG-MOUSE-001'])
        writer.writerow(['Mechanical Keyboard', 'Microsoft', 'Ergonomic mechanical keyboard', 'nos', 'active', 'MS-KB-2024'])
        writer.writerow(['Monitor', 'Samsung', '27 inch 4K monitor', 'nos', 'active', ''])
        writer.writerow(['Webcam', 'Logitech', 'HD webcam for video calls', 'pcs', 'active', 'LOG-WEBCAM-001'])
        return response

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        product_ids = request.data.get('product_ids', [])
        if not product_ids:
            return Response({"status": "error", "message": "product_ids array is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            products = Product.objects.filter(id__in=product_ids, status=ProductStatus.ACTIVE)
            count = products.count()
            products.update(status=ProductStatus.BIN)
            return Response({"status": "success", "message": f"Successfully moved {count} products to bin", "count": count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": f"Error during bulk delete: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='all-active')
    def all_active(self, request):
        """Get all active products without pagination"""
        queryset = Product.objects.filter(status=ProductStatus.ACTIVE).order_by("-created_at")
        
        # Create index map for serial numbers
        product_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.product_index_map = product_index_map
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "message": "Active products retrieved successfully",
            "count": queryset.count(),
            "data": serializer.data
        })