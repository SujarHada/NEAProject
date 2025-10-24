from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action, api_view, permission_classes
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from datetime import datetime
from django.db.models import Count, Q
from django.http import HttpResponse
import csv
from datetime import datetime 
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, update_session_auth_hash
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import (
    EmployeeStatus, Office, Branch, Employee, Receiver, Letter, Product, 
    ProductStatus, LetterStatus, BranchStatus, OfficeStatus, Dashboard, 
    UnitOfMeasurement, EmployeeRole, User, UserRole
)
from .serializers import (
    OfficeSerializer,
    BranchSerializer,
    EmployeeSerializer,
    ReceiverSerializer,
    LetterSerializer,
    ProductSerializer,
    DashboardSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserSignupSerializer,
)
from .permissions import CanCreateUser, IsAdmin, IsAdminOrReadOnly, IsViewerOrAdmin, IsViewerOrAdminWithCreateForLetters, StrictViewerOrAdmin

from .models import Employee, EmployeeStatus

def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['email'] = user.email
    refresh['role'] = user.role
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@extend_schema(
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'email': {'type': 'string', 'format': 'email', 'example': 'user@example.com'},
                'password': {'type': 'string', 'example': 'password123'},
                'password_confirm': {'type': 'string', 'example': 'password123'},
                'role': {'type': 'string', 'enum': ['admin', 'viewer'], 'example': 'viewer'}
            },
            'required': ['email', 'password', 'password_confirm', 'role']
        }
    },
    responses={
        201: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='User created successfully',
            examples=[
                OpenApiExample(
                    'Success Response',
                    value={
                        'access': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                        'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                        'user': {
                            'id': 'uuid-string',
                            'email': 'user@example.com',
                            'role': 'viewer',
                            'is_active': True,
                            'created_at': '2024-01-01T00:00:00Z'
                        },
                        'message': 'User created successfully'
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Validation error'
        ),
        403: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Permission denied',
            examples=[
                OpenApiExample(
                    'Error Response',
                    value={
                        'error': 'Only administrators can create new users.'
                    }
                )
            ]
        )
    },
    description='Create a new user account (Admin only)',
    summary='User Registration (Admin Only)'
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Changed from AllowAny to IsAuthenticated
def signup_view(request):
    """User registration/signup endpoint - Admin only"""
    # Check if the authenticated user is an admin
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only administrators can create new users.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = UserSignupSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate tokens for the new user
        tokens = get_tokens_for_user(user)
        
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'email': {'type': 'string', 'format': 'email', 'example': 'user@example.com'},
                'password': {'type': 'string', 'example': 'password123'}
            },
            'required': ['email', 'password']
        }
    },
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Login successful',
            examples=[
                OpenApiExample(
                    'Success Response',
                    value={
                        'access': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                        'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                        'user': {
                            'id': 'uuid-string',
                            'email': 'user@example.com',
                            'role': 'viewer',
                            'is_active': True,
                            'created_at': '2024-01-01T00:00:00Z'
                        }
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Validation error',
            examples=[
                OpenApiExample(
                    'Error Response',
                    value={
                        'email': ['This field is required.'],
                        'password': ['This field is required.']
                    }
                )
            ]
        ),
        401: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Authentication failed',
            examples=[
                OpenApiExample(
                    'Error Response',
                    value={
                        'error': 'Invalid credentials'
                    }
                )
            ]
        )
    },
    description='Authenticate user and return JWT tokens',
    summary='User Login'
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Authenticate user
        user = authenticate(request=request, username=email, password=password)
        
        if not user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user is active
        if not user.is_active:
            return Response(
                {'error': 'Account is not active. Please contact administrator.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate JWT tokens
        tokens = get_tokens_for_user(user)
        
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'refresh': {'type': 'string', 'example': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'}
            }
        }
    },
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Logout successful',
            examples=[
                OpenApiExample(
                    'Success Response',
                    value={
                        'message': 'Successfully logged out'
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Invalid token',
            examples=[
                OpenApiExample(
                    'Error Response',
                    value={
                        'error': 'Token is invalid or expired'
                    }
                )
            ]
        )
    },
    description='Logout user and blacklist refresh token',
    summary='User Logout'
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout endpoint - blacklist the refresh token
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response(
            {'message': 'Successfully logged out'}, 
            status=status.HTTP_200_OK
        )
        
    except TokenError as e:
        return Response(
            {'error': f'Token is invalid or expired: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'An error occurred during logout: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

@extend_schema(
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'old_password': {'type': 'string', 'example': 'oldpassword123'},
                'new_password': {'type': 'string', 'example': 'newpassword123'}
            },
            'required': ['old_password', 'new_password']
        }
    },
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Password changed successfully',
            examples=[
                OpenApiExample(
                    'Success Response',
                    value={
                        'message': 'Password changed successfully',
                        'access': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                        'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Validation error',
            examples=[
                OpenApiExample(
                    'Error Response',
                    value={
                        'error': 'Both old password and new password are required'
                    }
                )
            ]
        )
    },
    description='Change user password and return new JWT tokens',
    summary='Change Password'
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change password and return new JWT tokens"""
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'error': 'Both old password and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not request.user.check_password(old_password):
        return Response(
            {'error': 'Old password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'error': 'New password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update password
    request.user.set_password(new_password)
    request.user.save()
    
    # Generate new tokens
    tokens = get_tokens_for_user(request.user)
    
    return Response({
        'message': 'Password changed successfully',
        'access': tokens['access'],
        'refresh': tokens['refresh']
    })

@extend_schema(
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'email': {'type': 'string', 'format': 'email', 'example': 'user@example.com'}
            },
            'required': ['email']
        }
    },
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Password reset email sent',
            examples=[
                OpenApiExample(
                    'Success Response',
                    value={
                        'message': 'If an account with this email exists, a password reset link has been sent.'
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Validation error',
            examples=[
                OpenApiExample(
                    'Error Response',
                    value={
                        'error': 'Email is required'
                    }
                )
            ]
        )
    },
    description='Request password reset email',
    summary='Reset Password Request'
)
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_request(request):
    """Request password reset - placeholder for email sending logic"""
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Always return success message for security
    return Response({
        'message': 'If an account with this email exists, a password reset link has been sent.'
    })
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [CanCreateUser]  # Only admins can create users
    
    def create(self, request, *args, **kwargs):
        """Only admins can create users"""
        if request.user.role != 'admin':
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can create new users."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Only admins can update users"""
        if request.user.role != 'admin':
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can update users."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Only admins can delete users"""
        if request.user.role != 'admin':
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can delete users."
                },
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
# ViewSets
class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.all().order_by("-created_at")
    serializer_class = OfficeSerializer
    permission_classes = [StrictViewerOrAdmin]
    filterset_fields = ["status"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'restore':
            return queryset.filter(status=OfficeStatus.BIN)
        status_param = self.request.query_params.get("status")
        if status_param:
            return queryset.filter(status=status_param)
        return queryset.filter(status=OfficeStatus.ACTIVE)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        office_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.office_index_map = office_index_map

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        office_name = instance.name
        instance.status = OfficeStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Office '{office_name}' has been moved to bin",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        instance = self.get_object()
        if instance.status == OfficeStatus.ACTIVE:
            return Response(
                {"message": f"Office '{instance.name}' is already active."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.status = OfficeStatus.ACTIVE
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Office '{instance.name}' has been restored.",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="offices_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'ID', 'Name', 'Address', 'Email', 'Phone Number', 'Status', 'Created At', 'Updated At'])
        for index, office in enumerate(queryset, start=1):
            writer.writerow([
                index, office.id, office.name, office.address, office.email or '',
                office.phone_number, office.get_status_display(),
                office.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                office.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all().order_by("-created_at")
    serializer_class = BranchSerializer
    permission_classes = [StrictViewerOrAdmin]
    filterset_fields = ["status"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'restore':
            return queryset.filter(status=BranchStatus.BIN)
        status_param = self.request.query_params.get("status")
        if status_param:
            return queryset.filter(status=status_param)
        return queryset.filter(status=BranchStatus.ACTIVE)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        branch_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.branch_index_map = branch_index_map

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        branch_name = instance.name
        instance.status = BranchStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Branch '{branch_name}' has been moved to bin",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        instance = self.get_object()
        if instance.status == BranchStatus.ACTIVE:
            return Response(
                {"message": f"Branch '{instance.name}' is already active."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.status = BranchStatus.ACTIVE
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Branch '{instance.name}' has been restored.",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="branches_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'Organization ID', 'Name', 'Email', 'Address', 'Phone Number', 'Status', 'Created At', 'Updated At'])
        for index, branch in enumerate(queryset, start=1):
            writer.writerow([
                index, branch.organization_id, branch.name, branch.email or '',
                branch.address, branch.phone_number, branch.get_status_display(),
                branch.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                branch.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by("-created_at")
    serializer_class = EmployeeSerializer
    permission_classes = [StrictViewerOrAdmin]
    filterset_fields = ["status"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'restore':
            return queryset.filter(status=EmployeeStatus.BIN)
        status_param = self.request.query_params.get("status")
        if status_param:
            return queryset.filter(status=status_param)
        return queryset.filter(status=EmployeeStatus.ACTIVE)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        employee_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.employee_index_map = employee_index_map

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Only admins can create employees"""
        if request.user.role != 'admin':  # Check UserRole, not EmployeeRole
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can create employees."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        organization_id = request.data.get("organization_id")
        if not organization_id:
            return Response(
                {"error": "organization_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            branch = Branch.objects.get(organization_id=organization_id)
        except Branch.DoesNotExist:
            return Response(
                {"error": "Branch ID is not correct."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = request.data.get('email')
        if Employee.objects.filter(email=email).exists():
            return Response(
                {"error": "Employee with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.copy()
        data["branch"] = branch.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # REMOVED PASSWORD CODE - Employees don't have passwords anymore
        employee = serializer.save()
        
        response_data = serializer.data
        # REMOVED initial_password - Employees don't have passwords
        
        return Response(response_data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Only admins can update employees"""
        if request.user.role != 'admin':
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can update employees."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()
        organization_id = request.data.get("organization_id")

        if organization_id:
            try:
                branch = Branch.objects.get(organization_id=organization_id)
                data = request.data.copy()
                data["branch"] = branch.id
                serializer = self.get_serializer(instance, data=data, partial=kwargs.get('partial', False))
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)
            except Branch.DoesNotExist:
                return Response(
                    {"error": "Branch ID is not correct."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path=r"by-organization-id/(?P<organization_id>[^/.]+)")
    def get_by_organization(self, request, organization_id=None):
        branch = Branch.objects.filter(organization_id=organization_id).first()
        if not branch:
            return Response(
                {"detail": "Branch not found for the given organization."},
                status=status.HTTP_404_NOT_FOUND
            )

        employees = Employee.objects.filter(branch=branch).order_by("-created_at")
        status_param = request.query_params.get("status")
        if status_param:
            employees = employees.filter(status=status_param)
        else:
            employees = employees.filter(status=EmployeeStatus.ACTIVE)

        employee_index_map = {obj.id: idx for idx, obj in enumerate(employees)}
        request.employee_index_map = employee_index_map

        page = self.paginate_queryset(employees)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """Only admins can delete employees"""
        if request.user.role != 'admin':
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can delete employees."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()
        employee_name = f"{instance.first_name} {instance.last_name}"
        instance.status = EmployeeStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Employee '{employee_name}' has been moved to bin",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        """Only admins can restore employees"""
        if request.user.role != 'admin':
            return Response(
                {
                    "status": "error", 
                    "message": "Only administrators can restore employees."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()
        if instance.status == EmployeeStatus.ACTIVE:
            return Response(
                {"message": f"Employee '{instance.first_name} {instance.last_name}' is already active."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.status = EmployeeStatus.ACTIVE
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Employee '{instance.first_name} {instance.last_name}' has been restored.",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="employees_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'ID', 'First Name', 'Middle Name', 'Last Name', 'Email', 'Role', 'Branch Name', 'Organization ID', 'Status', 'Created At', 'Updated At'])
        for index, employee in enumerate(queryset, start=1):
            writer.writerow([
                index, employee.id, employee.first_name, employee.middle_name or '',
                employee.last_name, employee.email, employee.get_role_display(),
                employee.branch.name, employee.branch.organization_id,
                employee.get_status_display(),
                employee.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                employee.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response

    @action(detail=False, methods=['get'])
    def export_csv_simple(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="employees_simple_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'First Name', 'Last Name', 'Email', 'Role', 'Branch Name', 'Organization ID', 'Status'])
        for index, employee in enumerate(queryset, start=1):
            writer.writerow([
                index, employee.first_name, employee.last_name, employee.email,
                employee.get_role_display(), employee.branch.name,
                employee.branch.organization_id, employee.get_status_display()
            ])
        return response

    @action(detail=False, methods=['get'], url_path=r"export-by-organization/(?P<organization_id>[^/.]+)")
    def export_by_organization(self, request, organization_id=None):
        branch = Branch.objects.filter(organization_id=organization_id).first()
        if not branch:
            return Response(
                {"detail": "Branch not found for the given organization."},
                status=status.HTTP_404_NOT_FOUND
            )

        employees = Employee.objects.filter(branch=branch).order_by("-created_at")
        status_param = request.query_params.get("status")
        if status_param:
            employees = employees.filter(status=status_param)
        else:
            employees = employees.filter(status=EmployeeStatus.ACTIVE)

        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="employees_org_{organization_id}_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'ID', 'First Name', 'Middle Name', 'Last Name', 'Email', 'Role', 'Status', 'Created At', 'Updated At'])
        for index, employee in enumerate(employees, start=1):
            writer.writerow([
                index, employee.id, employee.first_name, employee.middle_name or '',
                employee.last_name, employee.email, employee.get_role_display(),
                employee.get_status_display(),
                employee.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                employee.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response

    @action(detail=False, methods=['get'])
    def active_count(self, request):
        active_count = Employee.objects.filter(status=EmployeeStatus.ACTIVE).count()
        return Response({'active_count': active_count})

    @action(detail=False, methods=['get'])
    def bin_count(self, request):
        bin_count = Employee.objects.filter(status=EmployeeStatus.BIN).count()
        return Response({'bin_count': bin_count})

    @action(detail=False, methods=['get'])
    def role_stats(self, request):
        role_stats = Employee.objects.filter(status=EmployeeStatus.ACTIVE).values('role').annotate(employee_count=Count('id')).order_by('-employee_count')
        for stat in role_stats:
            stat['role_display'] = EmployeeRole(stat['role']).label
        return Response(role_stats)

    @action(detail=False, methods=['get'])
    def branch_stats(self, request):
        branch_stats = Employee.objects.filter(status=EmployeeStatus.ACTIVE).values('branch__name', 'branch__organization_id').annotate(employee_count=Count('id')).order_by('-employee_count')
        return Response(branch_stats)

    @action(detail=False, methods=['get'])
    def search(self, request):
        search_query = request.query_params.get('q', '')
        if not search_query:
            return Response(
                {"error": "Search query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employees = Employee.objects.filter(status=EmployeeStatus.ACTIVE).filter(
            Q(first_name__icontains=search_query) | Q(last_name__icontains=search_query) | Q(email__icontains=search_query) | Q(middle_name__icontains=search_query)
        ).order_by("-created_at")
        
        employee_index_map = {obj.id: idx for idx, obj in enumerate(employees)}
        request.employee_index_map = employee_index_map

        page = self.paginate_queryset(employees)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)

class ReceiverViewSet(viewsets.ModelViewSet):
    queryset = Receiver.objects.all().order_by("-created_at")
    serializer_class = ReceiverSerializer
    permission_classes = [StrictViewerOrAdmin]

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="receivers_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'ID', 'Name', 'Post', 'ID Card Type', 'ID Card Number', 'Office Name', 'Office Address', 'Phone Number', 'Vehicle Number', 'Created At', 'Updated At'])
        for index, receiver in enumerate(queryset, start=1):
            writer.writerow([
                index, receiver.id, receiver.name, receiver.post,
                receiver.get_id_card_type_display(), receiver.id_card_number,
                receiver.office_name, receiver.office_address, receiver.phone_number,
                receiver.vehicle_number, receiver.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                receiver.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response

class LetterViewSet(viewsets.ModelViewSet):
    queryset = Letter.objects.all().order_by("-created_at")
    serializer_class = LetterSerializer
    permission_classes = [IsViewerOrAdminWithCreateForLetters]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status"]

    def create(self, request, *args, **kwargs):
        """Create a new letter with proper response"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        letter = serializer.save()
        
        return Response({
            "status": "success",
            "message": "Letter created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        """Get list of letters with proper response"""
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "status": "success",
                "message": "Letters retrieved successfully",
                "data": serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "message": "Letters retrieved successfully",
            "data": serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        """Get single letter details"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "status": "success",
            "message": "Letter retrieved successfully",
            "data": serializer.data
        })

    def update(self, request, *args, **kwargs):
        """Update a letter"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        letter = serializer.save()

        return Response({
            "status": "success",
            "message": "Letter updated successfully",
            "data": serializer.data
        })

    def partial_update(self, request, *args, **kwargs):
        """Partially update a letter"""
        return self.update(request, *args, partial=True, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Move letter to bin (soft delete)"""
        instance = self.get_object()
        letter_title = instance.title
        instance.status = LetterStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        
        return Response({
            "status": "success",
            "message": f"Letter '{letter_title}' has been moved to bin",
            "id": instance.id
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export letters to CSV"""
        queryset = self.filter_queryset(self.get_queryset())
        
        if not queryset.exists():
            return Response({
                "status": "error",
                "message": "No letters found to export"
            }, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="letters_export_{timestamp}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'ID', 'Title', 'Content Preview', 'Receiver Name', 'Receiver Post', 'Status', 'Created At', 'Updated At'])
        
        for index, letter in enumerate(queryset, start=1):
            content_preview = letter.content[:100] + "..." if len(letter.content) > 100 else letter.content
            writer.writerow([
                index, 
                letter.id, 
                letter.title, 
                content_preview,
                letter.receiver.name if letter.receiver else 'N/A',
                letter.receiver.post if letter.receiver else 'N/A',
                letter.get_status_display(),
                letter.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                letter.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Mark letter as sent"""
        instance = self.get_object()
        
        if instance.status == LetterStatus.SENT:
            return Response({
                "status": "error",
                "message": f"Letter '{instance.title}' is already sent"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = LetterStatus.SENT
        instance.save(update_fields=["status", "updated_at"])
        
        return Response({
            "status": "success",
            "message": f"Letter '{instance.title}' has been marked as sent",
            "data": LetterSerializer(instance).data
        })

    @action(detail=True, methods=['post'])
    def draft(self, request, pk=None):
        """Mark letter as draft"""
        instance = self.get_object()
        
        if instance.status == LetterStatus.DRAFT:
            return Response({
                "status": "error",
                "message": f"Letter '{instance.title}' is already in draft"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = LetterStatus.DRAFT
        instance.save(update_fields=["status", "updated_at"])
        
        return Response({
            "status": "success",
            "message": f"Letter '{instance.title}' has been marked as draft",
            "data": LetterSerializer(instance).data
        })

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore letter from bin"""
        instance = self.get_object()
        
        if instance.status != LetterStatus.BIN:
            return Response({
                "status": "error",
                "message": f"Letter '{instance.title}' is not in bin"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = LetterStatus.DRAFT
        instance.save(update_fields=["status", "updated_at"])
        
        return Response({
            "status": "success",
            "message": f"Letter '{instance.title}' has been restored from bin",
            "data": LetterSerializer(instance).data
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get letter statistics"""
        total_letters = Letter.objects.count()
        draft_letters = Letter.objects.filter(status=LetterStatus.DRAFT).count()
        sent_letters = Letter.objects.filter(status=LetterStatus.SENT).count()
        bin_letters = Letter.objects.filter(status=LetterStatus.BIN).count()
        
        return Response({
            "status": "success",
            "message": "Letter statistics retrieved successfully",
            "data": {
                "total_letters": total_letters,
                "draft_letters": draft_letters,
                "sent_letters": sent_letters,
                "bin_letters": bin_letters
            }
        })

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search letters by title or content"""
        search_query = request.query_params.get('q', '')
        
        if not search_query:
            return Response({
                "status": "error",
                "message": "Search query parameter 'q' is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = Letter.objects.filter(
            Q(title__icontains=search_query) | 
            Q(content__icontains=search_query)
        ).order_by("-created_at")
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "status": "success",
                "message": f"Search results for '{search_query}'",
                "data": serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "message": f"Search results for '{search_query}'",
            "data": serializer.data
        })

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [StrictViewerOrAdmin]
    filterset_fields = ["status"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'restore':
            return queryset.filter(status=ProductStatus.BIN)
        status_param = self.request.query_params.get("status")
        if status_param:
            return queryset.filter(status=status_param)
        return queryset.filter(status=ProductStatus.ACTIVE)

    def create(self, request, *args, **kwargs):
        name = request.data.get('name')
        company = request.data.get('company', '')
        
        if name and company:
            existing_product = Product.objects.filter(name=name, company=company, status=ProductStatus.ACTIVE).first()
            if existing_product:
                return Response(
                    {
                        "status": "error",
                        "message": f"A product with name '{name}' already exists for company '{company}'."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        return super().create(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        product_index_map = {obj.id: idx for idx, obj in enumerate(queryset)}
        request.product_index_map = product_index_map

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        product_name = instance.name
        instance.status = ProductStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Product '{product_name}' has been moved to bin",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        instance = self.get_object()
        if instance.status == ProductStatus.ACTIVE:
            return Response(
                {"message": f"Product '{instance.name}' is already active."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        existing_active = Product.objects.filter(name=instance.name, company=instance.company, status=ProductStatus.ACTIVE).exclude(id=instance.id).first()
        if existing_active:
            return Response(
                {
                    "status": "error",
                    "message": f"Cannot restore product. An active product with name '{instance.name}' already exists for company '{instance.company}'."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.status = ProductStatus.ACTIVE
        instance.save(update_fields=["status", "updated_at"])
        return Response(
            {
                "status": "success",
                "message": f"Product '{instance.name}' has been restored.",
                "id": instance.id,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="products_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'ID', 'Name', 'Company', 'SKU', 'Remarks', 'Unit of Measurement', 'Status', 'Created At', 'Updated At'])
        for index, product in enumerate(queryset, start=1):
            writer.writerow([
                index, product.id, product.name, product.company, product.sku,
                product.remarks, product.get_unit_of_measurement_display(),
                product.get_status_display(), product.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                product.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response

    @action(detail=False, methods=['get'])
    def export_csv_simple(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="products_simple_export_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['S.N.', 'Name', 'Company', 'SKU', 'Remarks', 'Unit', 'Status'])
        for index, product in enumerate(queryset, start=1):
            writer.writerow([
                index, product.name, product.company, product.sku, product.remarks,
                product.get_unit_of_measurement_display(), product.get_status_display()
            ])
        return response

    @action(detail=False, methods=['get'])
    def active_count(self, request):
        active_count = Product.objects.filter(status=ProductStatus.ACTIVE).count()
        return Response({'active_count': active_count})

    @action(detail=False, methods=['get'])
    def bin_count(self, request):
        bin_count = Product.objects.filter(status=ProductStatus.BIN).count()
        return Response({'bin_count': bin_count})

    @action(detail=False, methods=['get'])
    def company_stats(self, request):
        company_stats = Product.objects.filter(status=ProductStatus.ACTIVE).values('company').annotate(product_count=Count('id')).order_by('-product_count')
        return Response(company_stats)

    @action(detail=False, methods=['post'])
    def import_csv(self, request):
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({"status": "error", "message": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not csv_file.name.endswith('.csv'):
            return Response({"status": "error", "message": "Invalid file format."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            decoded_file = csv_file.read().decode('utf-8')
            csv_data = csv.reader(decoded_file.splitlines(), delimiter=',')
            headers = next(csv_data)
            headers_lower = [h.strip().lower() for h in headers]
            required_headers = ['name', 'company']
            missing_headers = [header for header in required_headers if header not in headers_lower]
            if missing_headers:
                return Response({"status": "error", "message": f"Missing required headers: {', '.join(missing_headers)}", "required_headers": required_headers, "found_headers": headers}, status=status.HTTP_400_BAD_REQUEST)
            
            results = {'total_rows': 0, 'successful': 0, 'failed': 0, 'errors': [], 'duplicates_skipped': 0}
            
            for row_num, row in enumerate(csv_data, start=2):
                if not any(row):
                    continue
                results['total_rows'] += 1
                try:
                    row_data = {}
                    for i, header in enumerate(headers):
                        if i < len(row):
                            row_data[header.strip().lower()] = row[i].strip()
                    name = row_data.get('name', '')
                    company = row_data.get('company', '')
                    if not name:
                        results['failed'] += 1
                        results['errors'].append(f"Row {row_num}: Product name is required")
                        continue
                    if not company:
                        results['failed'] += 1
                        results['errors'].append(f"Row {row_num}: Company name is required")
                        continue
                    existing_product = Product.objects.filter(name=name, company=company, status=ProductStatus.ACTIVE).first()
                    if existing_product:
                        results['duplicates_skipped'] += 1
                        results['errors'].append(f"Row {row_num}: Product '{name}' for company '{company}' already exists")
                        continue
                    product_data = {'name': name, 'company': company, 'remarks': row_data.get('remarks', ''), 'status': ProductStatus.ACTIVE}
                    unit_input = row_data.get('unit_of_measurement', '').lower()
                    if unit_input:
                        unit_mapping = {'nos': UnitOfMeasurement.NOS, 'set': UnitOfMeasurement.SET, 'kg': UnitOfMeasurement.KG, 'ltr': UnitOfMeasurement.LTR, 'pcs': UnitOfMeasurement.PCS, 'number': UnitOfMeasurement.NOS, 'numbers': UnitOfMeasurement.NOS, 'piece': UnitOfMeasurement.PCS, 'pieces': UnitOfMeasurement.PCS, 'kilogram': UnitOfMeasurement.KG, 'kilograms': UnitOfMeasurement.KG, 'liter': UnitOfMeasurement.LTR, 'liters': UnitOfMeasurement.LTR}
                        product_data['unit_of_measurement'] = unit_mapping.get(unit_input, UnitOfMeasurement.NOS)
                    else:
                        product_data['unit_of_measurement'] = UnitOfMeasurement.NOS
                    status_input = row_data.get('status', '').lower()
                    if status_input:
                        status_mapping = {'active': ProductStatus.ACTIVE, 'bin': ProductStatus.BIN, 'deleted': ProductStatus.BIN, 'inactive': ProductStatus.BIN}
                        product_data['status'] = status_mapping.get(status_input, ProductStatus.ACTIVE)
                    sku = row_data.get('sku', '')
                    if sku:
                        if Product.objects.filter(sku=sku).exists():
                            results['failed'] += 1
                            results['errors'].append(f"Row {row_num}: SKU '{sku}' already exists")
                            continue
                        product_data['sku'] = sku
                    product = Product.objects.create(**product_data)
                    results['successful'] += 1
                except Exception as e:
                    results['failed'] += 1
                    results['errors'].append(f"Row {row_num}: {str(e)}")
                    continue
            
            response_data = {"status": "success", "message": f"CSV import completed. Successful: {results['successful']}, Failed: {results['failed']}, Duplicates Skipped: {results['duplicates_skipped']}", "results": results}
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"status": "error", "message": f"Error processing CSV file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def import_template(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="product_import_template.csv"'
        writer = csv.writer(response)
        writer.writerow(['# Required Fields: name, company'])
        writer.writerow(['# Optional Fields: remarks, unit_of_measurement, status, sku'])
        writer.writerow(['# Unit of Measurement options: nos, set, kg, ltr, pcs (or common names like: number, piece, kilogram, liter)'])
        writer.writerow(['# Status options: active, bin (default: active)'])
        writer.writerow(['# SKU: Leave empty to auto-generate'])
        writer.writerow([])
        writer.writerow(['name', 'company', 'remarks', 'unit_of_measurement', 'status', 'sku'])
        writer.writerow(['Laptop', 'Dell Inc', 'High performance laptop', 'nos', 'active', ''])
        writer.writerow(['Wireless Mouse', 'Logitech', 'Wireless mouse with USB receiver', 'pcs', 'active', 'LOG-MOUSE-001'])
        writer.writerow(['Mechanical Keyboard', 'Microsoft', 'Ergonomic mechanical keyboard', 'nos', 'active', 'MS-KB-2024'])
        writer.writerow(['Monitor', 'Samsung', '27 inch 4K monitor', 'nos', 'active', ''])
        writer.writerow(['Webcam', 'Logitech', 'HD webcam for video calls', 'pcs', 'active', 'LOG-WEBCAM-001'])
        return response

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        product_ids = request.data.get('product_ids', [])
        if not product_ids:
            return Response({"status": "error", "message": "product_ids array is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            products = Product.objects.filter(id__in=product_ids, status=ProductStatus.ACTIVE)
            count = products.count()
            products.update(status=ProductStatus.BIN)
            return Response({"status": "success", "message": f"Successfully moved {count} products to bin", "count": count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": f"Error during bulk delete: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsViewerOrAdmin]

    def list(self, request):
        dashboard = Dashboard.get_current_stats()
        serializer = DashboardSerializer(dashboard)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        dashboard = Dashboard.get_current_stats()
        response = HttpResponse(content_type='text/csv')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="dashboard_statistics_{timestamp}.csv"'
        writer = csv.writer(response)
        writer.writerow(['Statistics', 'Count'])
        writer.writerow(['Active Products', dashboard.total_active_products])
        writer.writerow(['Active Branches', dashboard.total_active_branches])
        writer.writerow(['Active Offices', dashboard.total_active_offices])
        writer.writerow(['Active Employees', dashboard.total_active_employees])
        writer.writerow(['Total Receivers', dashboard.total_receivers])
        writer.writerow(['Total Letters', dashboard.total_letters])
        writer.writerow(['Draft Letters', dashboard.total_draft_letters])
        writer.writerow(['Sent Letters', dashboard.total_sent_letters])
        writer.writerow(['Last Updated', dashboard.last_updated.strftime('%Y-%m-%d %H:%M:%S')])
        return response

class SeedDatabaseView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        from .utils import seed_database
        result = seed_database()
        if result['success']:
            return Response({"status": "success", "message": "Database seeded successfully", "output": result['output']}, status=status.HTTP_201_CREATED)
        else:
            return Response({"status": "error", "message": "Failed to seed database", "error": result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)