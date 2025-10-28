from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from datetime import datetime
from django.db.models import Count, Q
import csv

from ..models import Employee, EmployeeStatus, Branch, EmployeeRole
from ..serializers import EmployeeSerializer
from ..permissions import StrictViewerOrAdmin

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by("-created_at")
    serializer_class = EmployeeSerializer
    permission_classes = [StrictViewerOrAdmin]
    filterset_fields = ["status"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'restore':
            return queryset.filter(status=EmployeeStatus.BIN)
        status_param = self.request.query_params.get("status")
        if status_param:
            return queryset.filter(status=status_param)
        return queryset.filter(status=EmployeeStatus.ACTIVE)

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
        """Only admins can create employees"""
        if request.user.role != 'admin':  # Check UserRole, not EmployeeRole
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can create employees."
                },
                status=status.HTTP_403_FORBIDDEN
            )

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

        email = request.data.get('email')
        if Employee.objects.filter(email=email).exists():
            return Response(
                {"error": "Employee with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.copy()
        data["branch"] = branch.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # REMOVED PASSWORD CODE - Employees don't have passwords anymore
        employee = serializer.save()
        
        response_data = serializer.data
        # REMOVED initial_password - Employees don't have passwords
        
        return Response(response_data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Only admins can update employees"""
        if request.user.role != 'admin':
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can update employees."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()
        organization_id = request.data.get("organization_id")

        if organization_id:
            try:
                branch = Branch.objects.get(organization_id=organization_id)
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

    @action(detail=False, methods=["get"], url_path=r"by-organization-id/(?P<organization_id>[^/.]+)")
    def get_by_organization(self, request, organization_id=None):
        branch = Branch.objects.filter(organization_id=organization_id).first()
        if not branch:
            return Response(
                {"detail": "Branch not found for the given organization."},
                status=status.HTTP_404_NOT_FOUND
            )

        employees = Employee.objects.filter(branch=branch).order_by("-created_at")
        status_param = request.query_params.get("status")
        if status_param:
            employees = employees.filter(status=status_param)
        else:
            employees = employees.filter(status=EmployeeStatus.ACTIVE)

        employee_index_map = {obj.id: idx for idx, obj in enumerate(employees)}
        request.employee_index_map = employee_index_map

        page = self.paginate_queryset(employees)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """Only admins can delete employees"""
        if request.user.role != 'admin':
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can delete employees."
                },
                status=status.HTTP_403_FORBIDDEN
            )

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
        """Only admins can restore employees"""
        if request.user.role != 'admin':
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can restore employees."
                },
                status=status.HTTP_403_FORBIDDEN
            )

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
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="employees_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'ID', 'First Name', 'Middle Name', 'Last Name', 'Email', 'Role', 'Branch Name', 'Organization ID', 'Status', 'Created At', 'Updated At'])
        for index, employee in enumerate(queryset, start=1):
            writer.writerow([
                index, employee.id, employee.first_name, employee.middle_name or '',
                employee.last_name, employee.email, employee.get_role_display(),
                employee.branch.name, employee.branch.organization_id,
                employee.get_status_display(),
                employee.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                employee.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response

    @action(detail=False, methods=['get'])
    def export_csv_simple(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="employees_simple_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'First Name', 'Last Name', 'Email', 'Role', 'Branch Name', 'Organization ID', 'Status'])
        for index, employee in enumerate(queryset, start=1):
            writer.writerow([
                index, employee.first_name, employee.last_name, employee.email,
                employee.get_role_display(), employee.branch.name,
                employee.branch.organization_id, employee.get_status_display()
            ])
        return response

    @action(detail=False, methods=['get'], url_path=r"export-by-organization/(?P<organization_id>[^/.]+)")
    def export_by_organization(self, request, organization_id=None):
        branch = Branch.objects.filter(organization_id=organization_id).first()
        if not branch:
            return Response(
                {"detail": "Branch not found for the given organization."},
                status=status.HTTP_404_NOT_FOUND
            )

        employees = Employee.objects.filter(branch=branch).order_by("-created_at")
        status_param = request.query_params.get("status")
        if status_param:
            employees = employees.filter(status=status_param)
        else:
            employees = employees.filter(status=EmployeeStatus.ACTIVE)

        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="employees_org_{organization_id}_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'ID', 'First Name', 'Middle Name', 'Last Name', 'Email', 'Role', 'Status', 'Created At', 'Updated At'])
        for index, employee in enumerate(employees, start=1):
            writer.writerow([
                index, employee.id, employee.first_name, employee.middle_name or '',
                employee.last_name, employee.email, employee.get_role_display(),
                employee.get_status_display(),
                employee.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                employee.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response

    @action(detail=False, methods=['get'])
    def active_count(self, request):
        active_count = Employee.objects.filter(status=EmployeeStatus.ACTIVE).count()
        return Response({'active_count': active_count})

    @action(detail=False, methods=['get'])
    def bin_count(self, request):
        bin_count = Employee.objects.filter(status=EmployeeStatus.BIN).count()
        return Response({'bin_count': bin_count})

    @action(detail=False, methods=['get'])
    def role_stats(self, request):
        role_stats = Employee.objects.filter(status=EmployeeStatus.ACTIVE).values('role').annotate(employee_count=Count('id')).order_by('-employee_count')
        for stat in role_stats:
            stat['role_display'] = EmployeeRole(stat['role']).label
        return Response(role_stats)

    @action(detail=False, methods=['get'])
    def branch_stats(self, request):
        branch_stats = Employee.objects.filter(status=EmployeeStatus.ACTIVE).values('branch__name', 'branch__organization_id').annotate(employee_count=Count('id')).order_by('-employee_count')
        return Response(branch_stats)

    @action(detail=False, methods=['get'])
    def search(self, request):
        search_query = request.query_params.get('q', '')
        if not search_query:
            return Response(
                {"error": "Search query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employees = Employee.objects.filter(status=EmployeeStatus.ACTIVE).filter(
            Q(first_name__icontains=search_query) | Q(last_name__icontains=search_query) | Q(email__icontains=search_query) | Q(middle_name__icontains=search_query)
        ).order_by("-created_at")
        
        employee_index_map = {obj.id: idx for idx, obj in enumerate(employees)}
        request.employee_index_map = employee_index_map

        page = self.paginate_queryset(employees)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='all-active')
    def all_active(self, request):
        """Get all active employees without pagination"""
        queryset = Employee.objects.filter(status=EmployeeStatus.ACTIVE).order_by("-created_at")
        
        # Create index map for serial numbers
        employee_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.employee_index_map = employee_index_map
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "message": "Active employees retrieved successfully",
            "count": queryset.count(),
            "data": serializer.data
        })