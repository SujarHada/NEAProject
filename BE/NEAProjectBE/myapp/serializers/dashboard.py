from rest_framework import serializers
from myapp.models import Dashboard

class DashboardSerializer(serializers.ModelSerializer):
    """
    Serializer for Dashboard statistics.
    """
    class Meta:
        model = Dashboard
        fields = [
            "total_active_products",
            "total_active_branches",
            "total_active_offices",
            "total_active_employees",
            "total_receivers",
            "total_letters",
            "total_draft_letters",
            "total_sent_letters",
            "last_updated",
        ]
        read_only_fields = fields