from rest_framework import serializers
from .models import Office, ProductStatus, Branch, Employee, Receiver, Letter, Product, Dashboard
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
    organization_id = serializers.IntegerField(source="branch.organization_id")

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

    def validate(self, data):
        """
        Validate that the same product name cannot be inserted for the same company.
        """
        instance = self.instance  # Existing instance for update
        name = data.get('name')
        company = data.get('company')
        
        # If this is an update, get the current instance values for fields not being updated
        if instance:
            name = name if name is not None else instance.name
            company = company if company is not None else instance.company
        
        # Check for duplicate product name within the same company
        if name and company:
            queryset = Product.objects.filter(name=name, company=company, status=ProductStatus.ACTIVE)
            
            # If updating, exclude the current instance from the duplicate check
            if instance:
                queryset = queryset.exclude(id=instance.id)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    "name": f"A product with name '{name}' already exists for company '{company}'."
                })
        
        return data

    @extend_schema_field(serializers.IntegerField())
    def get_serial_number(self, obj):
        # Get the position of this object in the queryset
        # This will be used as S.N. in the frontend
        request = self.context.get('request')
        if request and hasattr(request, 'product_index_map'):
            return request.product_index_map.get(obj.id, 0) + 1
        return 0


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