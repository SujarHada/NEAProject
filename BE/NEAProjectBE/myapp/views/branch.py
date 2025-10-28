from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from datetime import datetime
import csv

from ..models import Branch, BranchStatus
from ..serializers import BranchSerializer
from ..permissions import StrictViewerOrAdmin

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all().order_by("-created_at")
    serializer_class = BranchSerializer
    permission_classes = [StrictViewerOrAdmin]
    filterset_fields = ["status"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'restore':
            return queryset.filter(status=BranchStatus.BIN)
        status_param = self.request.query_params.get("status")
        if status_param:
            return queryset.filter(status=status_param)
        return queryset.filter(status=BranchStatus.ACTIVE)

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
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="branches_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'Organization ID', 'Name', 'Email', 'Address', 'Phone Number', 'Status', 'Created At', 'Updated At'])
        for index, branch in enumerate(queryset, start=1):
            writer.writerow([
                index, branch.organization_id, branch.name, branch.email or '',
                branch.address, branch.phone_number, branch.get_status_display(),
                branch.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                branch.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response
 
    @action(detail=False, methods=['get'], url_path='all-active')
    def all_active(self, request):
        """Get all active branches without pagination"""
        queryset = Branch.objects.filter(status=BranchStatus.ACTIVE).order_by("-created_at")
        
        # Create index map for serial numbers
        branch_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.branch_index_map = branch_index_map
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "message": "Active branches retrieved successfully",
            "count": queryset.count(),
            "data": serializer.data
        })