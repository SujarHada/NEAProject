from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Office, Branch, Employee, Receiver, Letter, Product, ProductStatus, LetterStatus
from .serializers import (
    OfficeSerializer,
    BranchSerializer,
    EmployeeSerializer,
    ReceiverSerializer,
    LetterSerializer,
    ProductSerializer,
)


class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.all().order_by("-created_at")
    serializer_class = OfficeSerializer
    permission_classes = []  # No authentication required


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all().order_by("-created_at")
    serializer_class = BranchSerializer
    permission_classes = []  # No authentication required


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by("-created_at")
    serializer_class = EmployeeSerializer
    permission_classes = []  # No authentication required


class ReceiverViewSet(viewsets.ModelViewSet):
    queryset = Receiver.objects.all().order_by("-created_at")
    serializer_class = ReceiverSerializer
    permission_classes = []  # No authentication required


class LetterViewSet(viewsets.ModelViewSet):
    queryset = Letter.objects.all().order_by("-created_at")
    serializer_class = LetterSerializer
    permission_classes = []  # No authentication required
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status"]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = LetterStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        return Response(status=drf_status.HTTP_204_NO_CONTENT)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = []  # No authentication required
    filterset_fields = ["status"]

    def destroy(self, request, *args, **kwargs):
        instance.status = ProductStatus.BIN
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SeedDatabaseView(APIView):
    """
    API endpoint to seed the database with sample data.
    No authentication required.
    """
    permission_classes = []  # No authentication required
    
    def post(self, request, *args, **kwargs):
        from .utils import seed_database
        
        result = seed_database()
        
        if result['success']:
            return Response(
                {
                    "status": "success",
                    "message": "Database seeded successfully",
                    "output": result['output']
                },
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {
                    "status": "error",
                    "message": "Failed to seed database",
                    "error": result['error']
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
