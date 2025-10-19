from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from datetime import datetime
from django.db.models import Count
from django.http import HttpResponse
import csv
from io import StringIO
from datetime import datetime 

from .models import EmployeeStatus, Office, Branch, Employee, Receiver, Letter, Product, ProductStatus, LetterStatus, BranchStatus, OfficeStatus, Dashboard
from .serializers import (
    OfficeSerializer,
    BranchSerializer,
    EmployeeSerializer,
    ReceiverSerializer,
    LetterSerializer,
    ProductSerializer,
    DashboardSerializer,
)


class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.all().order_by("-created_at")
    serializer_class = OfficeSerializer
    permission_classes = []  # No authentication required
    filterset_fields = ["status"]

    def get_queryset(self):
        """By default, return only active offices, unless overridden."""
        queryset = super().get_queryset()
        
        # Allow restore action to access bin offices
        if self.action == 'restore':
            return queryset.filter(status=OfficeStatus.BIN)
        
        status_param = self.request.query_params.get("status")
        if status_param:
            return queryset.filter(status=status_param)

        # Default: only ACTIVE
        return queryset.filter(status=OfficeStatus.ACTIVE)
    #Serial Number for Office
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        office_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.office_index_map = office_index_map

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Instead of deleting, mark office as BIN."""
        instance = self.get_object()
        office_name = instance.name
        instance.status = OfficeStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        
        return Response(
            {
                "status": "success",
                "message": f"Office '{office_name}' has been moved to bin",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export offices to CSV file.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="offices_export_{timestamp}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'S.N.', 'ID', 'Name', 'Address', 'Email', 'Phone Number', 
            'Status', 'Created At', 'Updated At'
        ])
        
        for index, office in enumerate(queryset, start=1):
            writer.writerow([
                index,
                office.id,
                office.name,
                office.address,
                office.email or '',
                office.phone_number,
                office.get_status_display(),
                office.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                office.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all().order_by("-created_at")
    serializer_class = BranchSerializer
    permission_classes = []  # No authentication required
    filterset_fields = ["status"]

    def get_queryset(self):
        """By default, return only active branches, unless overridden."""
        queryset = super().get_queryset()

        # Allow restore action to access bin branches
        if self.action == 'restore':
            return queryset.filter(status=BranchStatus.BIN)

        status_param = self.request.query_params.get("status")
        if status_param:
            return queryset.filter(status=status_param)

        # Default: only ACTIVE
        return queryset.filter(status=BranchStatus.ACTIVE)
    #Serial Number for Branch
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        branch_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.branch_index_map = branch_index_map

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Instead of deleting, mark branch as BIN."""
        instance = self.get_object()
        branch_name = instance.name
        instance.status = BranchStatus.BIN
        instance.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "status": "success",
                "message": f"Branch '{branch_name}' has been moved to bin",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        """Restore a branch from BIN to ACTIVE."""
        instance = self.get_object()
        if instance.status == BranchStatus.ACTIVE:
            return Response(
                {"message": f"Branch '{instance.name}' is already active."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.status = BranchStatus.ACTIVE
        instance.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "status": "success",
                "message": f"Branch '{instance.name}' has been restored.",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export branches to CSV file.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="branches_export_{timestamp}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'S.N.', 'Organization ID', 'Name', 'Email', 'Address', 
            'Phone Number', 'Status', 'Created At', 'Updated At'
        ])
        
        for index, branch in enumerate(queryset, start=1):
            writer.writerow([
                index,
                branch.organization_id,
                branch.name,
                branch.email or '',
                branch.address,
                branch.phone_number,
                branch.get_status_display(),
                branch.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                branch.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by("-created_at")
    serializer_class = EmployeeSerializer
    permission_classes = []
    filterset_fields = ["status"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'restore':
            return queryset.filter(status=EmployeeStatus.BIN)
        status_param = self.request.query_params.get("status")
        if status_param:
            return queryset.filter(status=status_param)
        return queryset.filter(status=EmployeeStatus.ACTIVE)

    # Serial Number for employee
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        employee_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.employee_index_map = employee_index_map

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """
        Ensure the provided organization_id belongs to an existing Branch.
        """
        organization_id = request.data.get("organization_id")

        if not organization_id:
            return Response(
                {"error": "organization_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            branch = Branch.objects.get(organization_id=organization_id)
        except Branch.DoesNotExist:
            return Response(
                {"error": "Branch ID is not correct."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Replace organization_id with actual branch foreign key
        data = request.data.copy()
        data["branch"] = branch.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Handle update with organization_id validation.
        """
        instance = self.get_object()
        organization_id = request.data.get("organization_id")

        if organization_id:
            try:
                branch = Branch.objects.get(organization_id=organization_id)
                # Replace organization_id with actual branch foreign key
                data = request.data.copy()
                data["branch"] = branch.id
                serializer = self.get_serializer(instance, data=data, partial=kwargs.get('partial', False))
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)
            except Branch.DoesNotExist:
                return Response(
                    {"error": "Branch ID is not correct."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        return super().update(request, *args, **kwargs)

    @action(
        detail=False,
        methods=["get"],
        url_path=r"by-organization-id/(?P<organization_id>[^/.]+)"
    )
    def get_by_organization(self, request, organization_id=None):
        branch = Branch.objects.filter(organization_id=organization_id).first()
        if not branch:
            return Response(
                {"detail": "Branch not found for the given organization."},
                status=status.HTTP_404_NOT_FOUND
            )

        employees = Employee.objects.filter(branch=branch).order_by("-created_at")
        
        # Apply status filter if provided
        status_param = request.query_params.get("status")
        if status_param:
            employees = employees.filter(status=status_param)
        else:
            # Default: only active employees
            employees = employees.filter(status=EmployeeStatus.ACTIVE)

        # Create serial number mapping for this specific queryset
        employee_index_map = {obj.id: idx for idx, obj in enumerate(employees)}
        request.employee_index_map = employee_index_map

        # Paginate the results
        page = self.paginate_queryset(employees)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        employee_name = f"{instance.first_name} {instance.last_name}"
        instance.status = EmployeeStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Employee '{employee_name}' has been moved to bin",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        instance = self.get_object()
        if instance.status == EmployeeStatus.ACTIVE:
            return Response(
                {"message": f"Employee '{instance.first_name} {instance.last_name}' is already active."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.status = EmployeeStatus.ACTIVE
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Employee '{instance.first_name} {instance.last_name}' has been restored.",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export employees to CSV file.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="employees_export_{timestamp}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'S.N.', 'ID', 'First Name', 'Middle Name', 'Last Name', 'Email',
            'Role', 'Branch Name', 'Organization ID', 'Status', 
            'Created At', 'Updated At'
        ])
        
        for index, employee in enumerate(queryset, start=1):
            writer.writerow([
                index,
                employee.id,
                employee.first_name,
                employee.middle_name or '',
                employee.last_name,
                employee.email,
                employee.get_role_display(),
                employee.branch.name,
                employee.branch.organization_id,
                employee.get_status_display(),
                employee.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                employee.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response

    @action(detail=False, methods=['get'])
    def export_csv_simple(self, request):
        """
        Export simplified employees CSV with only essential fields.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="employees_simple_export_{timestamp}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'S.N.', 'First Name', 'Last Name', 'Email', 'Role', 
            'Branch Name', 'Organization ID', 'Status'
        ])
        
        for index, employee in enumerate(queryset, start=1):
            writer.writerow([
                index,
                employee.first_name,
                employee.last_name,
                employee.email,
                employee.get_role_display(),
                employee.branch.name,
                employee.branch.organization_id,
                employee.get_status_display()
            ])
        
        return response

    @action(detail=False, methods=['get'], url_path=r"export-by-organization/(?P<organization_id>[^/.]+)")
    def export_by_organization(self, request, organization_id=None):
        """
        Export employees by organization to CSV.
        """
        branch = Branch.objects.filter(organization_id=organization_id).first()
        if not branch:
            return Response(
                {"detail": "Branch not found for the given organization."},
                status=status.HTTP_404_NOT_FOUND
            )

        employees = Employee.objects.filter(branch=branch).order_by("-created_at")
        
        # Apply status filter if provided
        status_param = request.query_params.get("status")
        if status_param:
            employees = employees.filter(status=status_param)
        else:
            employees = employees.filter(status=EmployeeStatus.ACTIVE)

        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="employees_org_{organization_id}_export_{timestamp}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'S.N.', 'ID', 'First Name', 'Middle Name', 'Last Name', 'Email',
            'Role', 'Status', 'Created At', 'Updated At'
        ])
        
        for index, employee in enumerate(employees, start=1):
            writer.writerow([
                index,
                employee.id,
                employee.first_name,
                employee.middle_name or '',
                employee.last_name,
                employee.email,
                employee.get_role_display(),
                employee.get_status_display(),
                employee.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                employee.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response

    @action(detail=False, methods=['get'])
    def active_count(self, request):
        """
        Get count of active employees.
        """
        active_count = Employee.objects.filter(status=EmployeeStatus.ACTIVE).count()
        return Response({'active_count': active_count})

    @action(detail=False, methods=['get'])
    def bin_count(self, request):
        """
        Get count of employees in bin.
        """
        bin_count = Employee.objects.filter(status=EmployeeStatus.BIN).count()
        return Response({'bin_count': bin_count})

    @action(detail=False, methods=['get'])
    def role_stats(self, request):
        """
        Get employee statistics by role.
        """
        from django.db.models import Count
        
        role_stats = Employee.objects.filter(status=EmployeeStatus.ACTIVE).values(
            'role'
        ).annotate(
            employee_count=Count('id')
        ).order_by('-employee_count')
        
        # Convert role values to display names
        for stat in role_stats:
            stat['role_display'] = EmployeeRole(stat['role']).label
        
        return Response(role_stats)

    @action(detail=False, methods=['get'])
    def branch_stats(self, request):
        """
        Get employee statistics by branch.
        """
        from django.db.models import Count
        
        branch_stats = Employee.objects.filter(status=EmployeeStatus.ACTIVE).values(
            'branch__name', 'branch__organization_id'
        ).annotate(
            employee_count=Count('id')
        ).order_by('-employee_count')
        
        return Response(branch_stats)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search employees by name or email.
        """
        search_query = request.query_params.get('q', '')
        
        if not search_query:
            return Response(
                {"error": "Search query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employees = Employee.objects.filter(
            status=EmployeeStatus.ACTIVE
        ).filter(
            models.Q(first_name__icontains=search_query) |
            models.Q(last_name__icontains=search_query) |
            models.Q(email__icontains=search_query) |
            models.Q(middle_name__icontains=search_query)
        ).order_by("-created_at")
        
        # Create serial number mapping
        employee_index_map = {obj.id: idx for idx, obj in enumerate(employees)}
        request.employee_index_map = employee_index_map

        page = self.paginate_queryset(employees)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)
    
class ReceiverViewSet(viewsets.ModelViewSet):
    queryset = Receiver.objects.all().order_by("-created_at")
    serializer_class = ReceiverSerializer
    permission_classes = []  # No authentication required

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export letters to CSV file.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="letters_export_{timestamp}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'S.N.', 'ID', 'Title', 'Content Preview', 'Receiver Name', 
            'Receiver Post', 'Status', 'Created At', 'Updated At'
        ])
        
        for index, letter in enumerate(queryset, start=1):
            # Create content preview (first 100 characters)
            content_preview = letter.content[:100] + "..." if len(letter.content) > 100 else letter.content
            
            writer.writerow([
                index,
                letter.id,
                letter.title,
                content_preview,
                letter.receiver.name if letter.receiver else 'N/A',
                letter.receiver.post if letter.receiver else 'N/A',
                letter.get_status_display(),
                letter.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                letter.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response

class LetterViewSet(viewsets.ModelViewSet):
    queryset = Letter.objects.all().order_by("-created_at")
    serializer_class = LetterSerializer
    permission_classes = []  # No authentication required
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status"]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = LetterStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)  # Fixed drf_status to status
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export letters to CSV file.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="letters_export_{timestamp}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'S.N.', 'ID', 'Title', 'Content Preview', 'Receiver Name', 
            'Receiver Post', 'Status', 'Created At', 'Updated At'
        ])
        
        for index, letter in enumerate(queryset, start=1):
            # Create content preview (first 100 characters)
            content_preview = letter.content[:100] + "..." if len(letter.content) > 100 else letter.content
            
            writer.writerow([
                index,
                letter.id,
                letter.title,
                content_preview,
                letter.receiver.name if letter.receiver else 'N/A',
                letter.receiver.post if letter.receiver else 'N/A',
                letter.get_status_display(),
                letter.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                letter.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = []  # No authentication required
    filterset_fields = ["status"]

    def get_queryset(self):
        """By default, return only active products, unless overridden."""
        queryset = super().get_queryset()
        
        # Allow restore action to access bin products
        if self.action == 'restore':
            return queryset.filter(status=ProductStatus.BIN)
        
        status_param = self.request.query_params.get("status")

        if status_param:
            return queryset.filter(status=status_param)

        # Default: only ACTIVE
        return queryset.filter(status=ProductStatus.ACTIVE)

    def create(self, request, *args, **kwargs):
        """
        Override create to handle duplicate product validation.
        """
        # Check for duplicate before creating
        name = request.data.get('name')
        company = request.data.get('company', '')
        
        if name and company:
            # Check if active product with same name and company already exists
            existing_product = Product.objects.filter(
                name=name, 
                company=company, 
                status=ProductStatus.ACTIVE
            ).first()
            
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

        # Create a mapping of product IDs to their index in the queryset
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
        
        # Return a informative response
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
        """Restore a product from BIN to ACTIVE."""
        instance = self.get_object()

        if instance.status == ProductStatus.ACTIVE:
            return Response(
                {"message": f"Product '{instance.name}' is already active."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if restoring would create a duplicate
        existing_active = Product.objects.filter(
            name=instance.name,
            company=instance.company,
            status=ProductStatus.ACTIVE
        ).exclude(id=instance.id).first()
        
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
        """
        Export products to CSV file.
        Supports filtering by status via query parameters.
        """
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="products_export_{timestamp}.csv"'
        
        # Create CSV writer
        writer = csv.writer(response)
        
        # Write headers
        writer.writerow([
            'S.N.',
            'ID',
            'Name', 
            'Company',
            'SKU',
            'Remarks',
            'Unit of Measurement',
            'Status',
            'Created At',
            'Updated At'
        ])
        
        # Write data rows
        for index, product in enumerate(queryset, start=1):
            writer.writerow([
                index,
                product.id,
                product.name,
                product.company,
                product.sku,
                product.remarks,
                product.get_unit_of_measurement_display(),
                product.get_status_display(),
                product.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                product.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response

    @action(detail=False, methods=['get'])
    def export_csv_simple(self, request):
        """
        Export simplified products CSV with only essential fields.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="products_simple_export_{timestamp}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'Name', 'Company', 'SKU', 'Remarks', 'Unit', 'Status'])
        
        for index, product in enumerate(queryset, start=1):
            writer.writerow([
                index,
                product.name,
                product.company,
                product.sku,
                product.remarks,
                product.get_unit_of_measurement_display(),
                product.get_status_display()
            ])
        
        return response

    @action(detail=False, methods=['get'])
    def active_count(self, request):
        """
        Get count of active products.
        """
        active_count = Product.objects.filter(status=ProductStatus.ACTIVE).count()
        return Response({'active_count': active_count})

    @action(detail=False, methods=['get'])
    def bin_count(self, request):
        """
        Get count of products in bin.
        """
        bin_count = Product.objects.filter(status=ProductStatus.BIN).count()
        return Response({'bin_count': bin_count})

    @action(detail=False, methods=['get'])
    def company_stats(self, request):
        """
        Get product statistics by company.
        """
        
        company_stats = Product.objects.filter(status=ProductStatus.ACTIVE).values(
            'company'
        ).annotate(
            product_count=Count('id')
        ).order_by('-product_count')
        
        return Response(company_stats)

class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for Dashboard statistics.
    """
    permission_classes = []  # No authentication required

    def list(self, request):
        """
        Get current dashboard statistics.
        """
        dashboard = Dashboard.get_current_stats()
        serializer = DashboardSerializer(dashboard)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export dashboard statistics to CSV.
        """
        dashboard = Dashboard.get_current_stats()
        
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="dashboard_statistics_{timestamp}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Statistics', 'Count'])
        writer.writerow(['Active Products', dashboard.total_active_products])
        writer.writerow(['Active Branches', dashboard.total_active_branches])
        writer.writerow(['Active Offices', dashboard.total_active_offices])
        writer.writerow(['Active Employees', dashboard.total_active_employees])
        writer.writerow(['Total Receivers', dashboard.total_receivers])
        writer.writerow(['Total Letters', dashboard.total_letters])
        writer.writerow(['Draft Letters', dashboard.total_draft_letters])
        writer.writerow(['Sent Letters', dashboard.total_sent_letters])
        writer.writerow(['Last Updated', dashboard.last_updated.strftime('%Y-%m-%d %H:%M:%S')])
        
        return response

class SeedDatabaseView(APIView):
    """
    API endpoint to seed the database with sample data.
    No authentication required.
    """
    permission_classes = []  # No authentication required
    
    def post(self, request, *args, **kwargs):
        from .utils import seed_database
        
        result = seed_database()
        
        if result['success']:
            return Response(
                {
                    "status": "success",
                    "message": "Database seeded successfully",
                    "output": result['output']
                },
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {
                    "status": "error",
                    "message": "Failed to seed database",
                    "error": result['error']
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
