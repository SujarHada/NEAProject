from rest_framework import serializers
from .models import Office, Branch, Employee, Receiver, Letter, Product
from drf_spectacular.utils import extend_schema_field


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


class EmployeeSerializer(serializers.ModelSerializer):
    serial_number = serializers.SerializerMethodField()
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    # Use organization_id for both input and output
    organization_id = serializers.UUIDField(source="branch.organization_id")

    class Meta:
        model = Employee
        fields = [
            "id",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "role",
            "organization_id",  # both input & output
            "branch_name",
            "serial_number",
            "status",
        ]

    @extend_schema_field(serializers.IntegerField())
    def get_serial_number(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'employee_index_map'):
            return request.employee_index_map.get(obj.id, 0) + 1
        return 0

    def create(self, validated_data):
        org_id = validated_data.pop("branch")["organization_id"]
        branch = Branch.objects.get(organization_id=org_id)
        validated_data["branch"] = branch
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "branch" in validated_data and "organization_id" in validated_data["branch"]:
            org_id = validated_data.pop("branch")["organization_id"]
            branch = Branch.objects.get(organization_id=org_id)
            validated_data["branch"] = branch
        return super().update(instance, validated_data)



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