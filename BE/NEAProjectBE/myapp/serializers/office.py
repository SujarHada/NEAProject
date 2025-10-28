from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from myapp.models import Office

class OfficeSerializer(serializers.ModelSerializer):
    serial_number = serializers.SerializerMethodField()
    
    class Meta:
        model = Office
        fields = [
            "serial_number",
            "id",
            "name",
            "address",
            "email",
            "phone_number",
            "status",
        ]

    @extend_schema_field(serializers.IntegerField())
    def get_serial_number(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'office_index_map'):
            return request.office_index_map.get(obj.id, 0) + 1
        return 0