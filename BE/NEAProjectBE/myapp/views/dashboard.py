from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from datetime import datetime
import csv

from ..models import Dashboard
from ..serializers import DashboardSerializer
from ..permissions import IsViewerOrAdmin

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsViewerOrAdmin]

    def list(self, request):
        dashboard = Dashboard.get_current_stats()
        serializer = DashboardSerializer(dashboard)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
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