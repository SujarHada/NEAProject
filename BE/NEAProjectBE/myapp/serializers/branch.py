from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from myapp.models import Branch

class BranchSerializer(serializers.ModelSerializer):
    serial_number = serializers.SerializerMethodField()
    
    class Meta:
        model = Branch
        fields = [
            "serial_number",
            "id",
            "organization_id",
            "name",
            "email",
            "address",
            "phone_number",
            "status",
        ]

    @extend_schema_field(serializers.IntegerField())
    def get_serial_number(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'branch_index_map'):
            return request.branch_index_map.get(obj.id, 0) + 1
        return 0