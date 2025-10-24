from rest_framework import serializers
from .models import Office, Branch, Employee, Receiver, Letter, Product, Dashboard, User, UserRole
from drf_spectacular.utils import extend_schema_field
from django.core.validators import MinValueValidator, MaxValueValidator
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

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'role': {'required': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'is_active', 'created_at']
class EmployeeSerializer(serializers.ModelSerializer):
    serial_number = serializers.SerializerMethodField()
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    organization_id = serializers.IntegerField(source="branch.organization_id", required=False)
    
    # Add explicit role field with validation
    role = serializers.CharField(max_length=1)

    class Meta:
        model = Employee
        fields = [
            "id",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "role",
            "organization_id",
            "branch_name",
            "serial_number",
            "status",
        ]
        extra_kwargs = {
            'email': {'required': True},
            'role': {
                'required': True,
                'error_messages': {
                    'invalid_choice': 'Role must be a digit between 1 and 9',
                    'blank': 'Role is required',
                    'null': 'Role is required'
                }
            }
        }

    @extend_schema_field(serializers.IntegerField())
    def get_serial_number(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'employee_index_map'):
            return request.employee_index_map.get(obj.id, 0) + 1
        return 0

    def validate_role(self, value):
        """Validate that role is a digit between 1-9"""
        if not value.isdigit():
            raise serializers.ValidationError("Role must be a digit between 1 and 9")
        
        role_num = int(value)
        if role_num < 1 or role_num > 9:
            raise serializers.ValidationError("Role must be between 1 and 9")
        
        return value

    def validate_email(self, value):
        if self.instance and self.instance.email == value:
            return value
        if Employee.objects.filter(email=value).exists():
            raise serializers.ValidationError("An employee with this email already exists.")
        return value

    def create(self, validated_data):
        org_id = validated_data.pop("branch")["organization_id"]
        branch = Branch.objects.get(organization_id=org_id)
        validated_data["branch"] = branch
        employee = Employee.objects.create(**validated_data)
        return employee

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
        instance = self.instance
        name = data.get('name')
        company = data.get('company')
        
        if instance:
            name = name if name is not None else instance.name
            company = company if company is not None else instance.company
        
        if name and company:
            queryset = Product.objects.filter(name=name, company=company, status='active')
            if instance:
                queryset = queryset.exclude(id=instance.id)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    "name": f"A product with name '{name}' already exists for company '{company}'."
                })
        
        return data

    @extend_schema_field(serializers.IntegerField())
    def get_serial_number(self, obj):
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