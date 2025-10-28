from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from myapp.models import Employee, Branch

class EmployeeSerializer(serializers.ModelSerializer):
    serial_number = serializers.SerializerMethodField()
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    organization_id = serializers.IntegerField(source="branch.organization_id", required=False)
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