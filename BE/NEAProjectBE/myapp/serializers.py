from rest_framework import serializers
from .models import LetterItem, Office, Branch, Employee, Receiver, Letter, Product, Dashboard, User, UserRole
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
        fields = ['email', 'name', 'password', 'password_confirm', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'name' : {'required': True},
            'role': {'required': True},
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
        fields = ['id', 'email', 'name', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'is_active', 'created_at']

#serializer for the "get me" endpoint
class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role']
        read_only_fields = ['id', 'email', 'role']
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

class LetterItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LetterItem
        fields = ['id', 'name', 'company', 'serial_number', 'unit_of_measurement', 'quantity', 'remarks']

class ReceiverSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    post = serializers.CharField(max_length=100, required=False, allow_blank=True)
    id_card_number = serializers.CharField(max_length=100, required=False, allow_blank=True)
    id_card_type = serializers.ChoiceField(
        choices=[
            ("unknown", "Unknown"),
            ("national_id", "National ID"),
            ("citizenship", "Citizenship"),
            ("voter_id", "Voter ID"),
            ("passport", "Passport"),
            ("drivers_license", "Driver's License"),
            ("pan_card", "PAN Card")
        ],
        required=False,
        default="unknown"
    )
    office_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    office_address = serializers.CharField(max_length=500, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    vehicle_number = serializers.CharField(max_length=50, required=False, allow_blank=True)

class LetterItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = LetterItem
        fields = ['id', 'name', 'company', 'serial_number', 'unit_of_measurement', 'quantity', 'remarks']

class LetterSerializer(serializers.ModelSerializer):
    items = LetterItemSerializer(many=True, required=False)
    receiver = ReceiverSerializer(required=False)
    
    class Meta:
        model = Letter
        fields = [
            'id', 'letter_count', 'chalani_no', 'voucher_no', 'date',
            'receiver_office_name', 'receiver_address', 'subject',
            'request_chalani_number', 'request_letter_count', 'request_date',
            'items', 'gatepass_no', 'receiver', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def _convert_nepali_to_english(self, value):
        """Convert Nepali numerals to English numerals"""
        if isinstance(value, str):
            nepali_to_english = {
                '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
                '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
            }
            converted = ''.join(nepali_to_english.get(char, char) for char in value)
            return converted
        return value
    
    def _convert_english_to_nepali(self, value):
        """Convert English numerals to Nepali numerals"""
        if isinstance(value, (int, float)):
            value = str(value)
        if isinstance(value, str):
            english_to_nepali = {
                '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
                '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
            }
            converted = ''.join(english_to_nepali.get(char, char) for char in value)
            return converted
        return value
    
    def to_internal_value(self, data):
        """Convert Nepali numerals to English before validation"""
        # Convert numeric fields from Nepali to English
        numeric_fields = ['chalani_no', 'voucher_no', 'gatepass_no']
        
        for field in numeric_fields:
            if field in data and data[field]:
                if isinstance(data[field], str):
                    data[field] = self._convert_nepali_to_english(data[field])
        
        # Convert string numeric fields
        string_numeric_fields = ['letter_count', 'request_chalani_number', 'request_letter_count']
        
        for field in string_numeric_fields:
            if field in data and data[field]:
                data[field] = self._convert_nepali_to_english(data[field])
        
        # Handle items array
        if 'items' in data and isinstance(data['items'], list):
            for item in data['items']:
                if 'serial_number' in item and item['serial_number']:
                    if isinstance(item['serial_number'], str):
                        item['serial_number'] = self._convert_nepali_to_english(item['serial_number'])
                if 'quantity' in item and item['quantity']:
                    if isinstance(item['quantity'], str):
                        item['quantity'] = self._convert_nepali_to_english(item['quantity'])
        
        # Handle receiver data
        if 'receiver' in data and isinstance(data['receiver'], dict):
            receiver_fields = ['id_card_number', 'phone_number']
            for field in receiver_fields:
                if field in data['receiver'] and data['receiver'][field]:
                    if isinstance(data['receiver'][field], str):
                        data['receiver'][field] = self._convert_nepali_to_english(data['receiver'][field])
        
        return super().to_internal_value(data)
    
    def to_representation(self, instance):
        """Convert English numerals back to Nepali in response and include receiver data"""
        representation = super().to_representation(instance)
        
        # Convert numeric fields to Nepali
        representation['letter_count'] = self._convert_english_to_nepali(representation['letter_count'])
        representation['chalani_no'] = self._convert_english_to_nepali(representation['chalani_no'])
        representation['voucher_no'] = self._convert_english_to_nepali(representation['voucher_no'])
        representation['gatepass_no'] = self._convert_english_to_nepali(representation['gatepass_no'])
        representation['request_chalani_number'] = self._convert_english_to_nepali(representation['request_chalani_number'])
        representation['request_letter_count'] = self._convert_english_to_nepali(representation['request_letter_count'])
        
        # Convert items
        if 'items' in representation:
            for item in representation['items']:
                item['serial_number'] = self._convert_english_to_nepali(item['serial_number'])
                item['quantity'] = self._convert_english_to_nepali(item['quantity'])
        
        # Add receiver data to representation
        representation['receiver'] = {
            'name': instance.receiver_name,
            'post': instance.receiver_post,
            'id_card_number': instance.receiver_id_card_number,
            'id_card_type': instance.receiver_id_card_type,
            'office_name': instance.receiver_office_name,  # This is the individual receiver's office
            'office_address': instance.receiver_office_address,
            'phone_number': self._convert_english_to_nepali(instance.receiver_phone_number),
            'vehicle_number': instance.receiver_vehicle_number
        }
        
        return representation
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        receiver_data = validated_data.pop('receiver', {})
        
        # Create the letter instance with main fields
        letter = Letter.objects.create(**validated_data)
        
        # Update receiver fields separately
        if receiver_data:
            letter.receiver_name = receiver_data.get('name', '')
            letter.receiver_post = receiver_data.get('post', '')
            letter.receiver_id_card_number = receiver_data.get('id_card_number', '')
            letter.receiver_id_card_type = receiver_data.get('id_card_type', 'unknown')
            # Note: We're not setting receiver_office_name here as it's the main field
            letter.receiver_office_address = receiver_data.get('office_address', '')
            letter.receiver_phone_number = receiver_data.get('phone_number', '')
            letter.receiver_vehicle_number = receiver_data.get('vehicle_number', '')
            letter.save()
        
        # Create letter items
        for item_data in items_data:
            LetterItem.objects.create(letter=letter, **item_data)
            
        return letter
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        receiver_data = validated_data.pop('receiver', {})
        
        # Update letter fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update receiver fields
        instance.receiver_name = receiver_data.get('name', instance.receiver_name)
        instance.receiver_post = receiver_data.get('post', instance.receiver_post)
        instance.receiver_id_card_number = receiver_data.get('id_card_number', instance.receiver_id_card_number)
        instance.receiver_id_card_type = receiver_data.get('id_card_type', instance.receiver_id_card_type)
        # Note: We're not updating receiver_office_name here as it's the main field
        instance.receiver_office_address = receiver_data.get('office_address', instance.receiver_office_address)
        instance.receiver_phone_number = receiver_data.get('phone_number', instance.receiver_phone_number)
        instance.receiver_vehicle_number = receiver_data.get('vehicle_number', instance.receiver_vehicle_number)
        
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                LetterItem.objects.create(letter=instance, **item_data)
        
        return instance

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