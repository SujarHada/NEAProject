from rest_framework import viewsets
from rest_framework.decorators import action
from django.http import HttpResponse
from datetime import datetime
import csv

from ..models import Receiver
from ..serializers import ReceiverSerializer
from ..permissions import StrictViewerOrAdmin

class ReceiverViewSet(viewsets.ModelViewSet):
    queryset = Receiver.objects.all().order_by("-created_at")
    serializer_class = ReceiverSerializer
    permission_classes = [StrictViewerOrAdmin]

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="receivers_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'ID', 'Name', 'Post', 'ID Card Type', 'ID Card Number', 'Office Name', 'Office Address', 'Phone Number', 'Vehicle Number', 'Created At', 'Updated At'])
        for index, receiver in enumerate(queryset, start=1):
            writer.writerow([
                index, receiver.id, receiver.name, receiver.post,
                receiver.get_id_card_type_display(), receiver.id_card_number,
                receiver.office_name, receiver.office_address, receiver.phone_number,
                receiver.vehicle_number, receiver.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                receiver.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response

    @action(detail=False, methods=['get'], url_path='all-active')
    def all_active(self, request):
        """Get all receivers without pagination (receivers don't have status field)"""
        queryset = Receiver.objects.all().order_by("-created_at")
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "message": "All receivers retrieved successfully",
            "count": queryset.count(),
            "data": serializer.data
        })