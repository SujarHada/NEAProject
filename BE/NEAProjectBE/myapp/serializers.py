from rest_framework import serializers
from .models import Office, Branch, Employee, Receiver, Letter, Product
from drf_spectacular.utils import extend_schema_field


class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = "__all__"


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = "__all__"


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = "__all__"


class ReceiverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receiver
        fields = "__all__"


class LetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Letter
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    serial_number = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = "__all__"

    @extend_schema_field(serializers.IntegerField())
    def get_serial_number(self, obj):
        # Get the position of this object in the queryset
        # This will be used as S.N. in the frontend
        request = self.context.get('request')
        if request and hasattr(request, 'product_index_map'):
            return request.product_index_map.get(obj.id, 0) + 1
        return 0