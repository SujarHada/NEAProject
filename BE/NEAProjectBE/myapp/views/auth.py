from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample
from drf_spectacular.types import OpenApiTypes

from ..models import User, Employee, EmailVerification
from ..serializers import (
    UserSignupSerializer, 
    UserLoginSerializer, 
    UserSerializer, 
    CurrentUserSerializer,
    EmployeeSignupSerializer
)
import logging
from django.utils import timezone

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
                'name': {'type': 'string', 'example': 'John Doe'},
                'password': {'type': 'string', 'example': 'password123'},
                'password_confirm': {'type': 'string', 'example': 'password123'},
                'role': {'type': 'string', 'enum': ['admin', 'viewer'], 'example': 'viewer'}
            },
            'required': ['email', 'name', 'password', 'password_confirm', 'role']
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
                            'name': 'John Doe',
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
@permission_classes([IsAuthenticated])
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
            logging.getLogger(__name__).warning(f"Failed login attempt for email: {email}")
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user is active
        if not user.is_active:
            logging.getLogger(__name__).warning(f"Inactive account login attempt for email: {email}")
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
                'email': {'type': 'string', 'format': 'email'},
                'name': {'type': 'string'},
                'password': {'type': 'string'},
                'password_confirm': {'type': 'string'},
                'role': {'type': 'string', 'enum': ['admin', 'viewer']}
            },
            'required': ['email', 'name', 'password', 'password_confirm']
        }
    },
    responses={
        201: OpenApiResponse(response=OpenApiTypes.OBJECT, description='Signup initiated; verification email sent'),
        400: OpenApiResponse(response=OpenApiTypes.OBJECT, description='Validation error')
    },
    description='Employee signup requiring email verification',
    summary='Employee Signup'
)
@api_view(['POST'])
@permission_classes([AllowAny])
def employee_signup_view(request):
    logger = logging.getLogger(__name__)
    serializer = EmployeeSignupSerializer(data=request.data)

    if not request.data.get('email'):
        logger.warning('Signup attempt missing email field')
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    if serializer.is_valid():
        try:
            user, token = serializer.save()
            logger.info(f"Signup initiated for employee email: {user.email}")
            # Simulated email sending: token logged; in production, send via email backend
            return Response({
                'message': 'Verification email sent. Please check your inbox to verify your account.',
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error('Error during employee signup', exc_info=e)
            return Response({'error': 'An error occurred during signup'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        if 'email' in serializer.errors:
            logger.warning(f"Signup failed for email: {request.data.get('email')} - {serializer.errors['email']}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'email': {'type': 'string', 'format': 'email'},
                'token': {'type': 'string'}
            },
            'required': ['email', 'token']
        }
    },
    responses={
        200: OpenApiResponse(response=OpenApiTypes.OBJECT, description='Email verified successfully'),
        400: OpenApiResponse(response=OpenApiTypes.OBJECT, description='Invalid or expired token')
    },
    description='Verify email using token to activate account',
    summary='Verify Email'
)
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_view(request):
    logger = logging.getLogger(__name__)
    email = request.data.get('email')
    token = request.data.get('token')

    if not email:
        logger.warning('Verification attempt missing email field')
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not token:
        logger.warning('Verification attempt missing token field')
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        ev = EmailVerification.objects.filter(email=email, token=token).first()
        if not ev:
            logger.warning(f"Email verification failed for {email}: invalid token")
            return Response({'error': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)
        if ev.expires_at < timezone.now():
            logger.warning(f"Email verification failed for {email}: token expired")
            return Response({'error': 'Verification token has expired'}, status=status.HTTP_400_BAD_REQUEST)

        user = ev.user
        user.is_active = True
        user.save(update_fields=['is_active'])
        ev.mark_verified()

        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Email verified successfully',
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data
        })
    except Exception as e:
        logger.error('Error during email verification', exc_info=e)
        return Response({'error': 'An error occurred during verification'}, status=status.HTTP_400_BAD_REQUEST)

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

@extend_schema(
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Current user details',
            examples=[
                OpenApiExample(
                    'Success Response',
                    value={
                        'id': 'uuid-string',
                        'email': 'user@example.com',
                        'name': 'John Doe',
                        'role': 'viewer'
                    }
                )
            ]
        ),
        401: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description='Unauthorized',
            examples=[
                OpenApiExample(
                    'Error Response',
                    value={
                        'detail': 'Authentication credentials were not provided.'
                    }
                )
            ]
        )
    },
    description='Get current logged in user details',
    summary='Get Current User'
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me_view(request):
    """Get current logged in user details"""
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data)
