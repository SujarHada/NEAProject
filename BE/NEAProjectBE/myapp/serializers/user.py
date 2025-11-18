from rest_framework import serializers
from myapp.models import User, UserRole
from myapp.models import Employee, EmailVerification
from django.utils import timezone
import secrets

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'password_confirm', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'name': {'required': True},
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

class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role']
        read_only_fields = ['id', 'email', 'role']

class EmployeeSignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.VIEWER)

    def validate_email(self, value):
        if not Employee.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is not registered as an employee")
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
        role = validated_data.pop('role', UserRole.VIEWER)
        user = User.objects.create_user(**validated_data, role=role, is_active=False)
        user.set_password(password)
        user.save()

        token = EmailVerification.generate_token()
        EmailVerification.objects.create(
            user=user,
            email=user.email,
            token=token,
            expires_at=EmailVerification.default_expiry(),
        )
        return user, token
