from rest_framework import viewsets, status
from rest_framework.response import Response
from myapp.models import User
from myapp.serializers import UserSerializer
from myapp.permissions import CanCreateUser

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