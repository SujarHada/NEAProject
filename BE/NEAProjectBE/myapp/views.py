from rest_framework import viewsets, permissions, status, filters
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

    def get_queryset(self):
        """By default, return only active products, unless overridden."""
        queryset = super().get_queryset()
        
        # Allow restore action to access bin products
        if self.action == 'restore':
            return queryset.filter(status=ProductStatus.BIN)
        
        status_param = self.request.query_params.get("status")

        if status_param:
            return queryset.filter(status=status_param)

        # Default: only ACTIVE
        return queryset.filter(status=ProductStatus.ACTIVE)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Create a mapping of product IDs to their index in the queryset
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
        
        # Return a informative response
        return Response(
            {
                "status": "success",
                "message": f"Product '{product_name}' has been moved to bin",
                "id": instance.id
            },
            status=status.HTTP_200_OK
        )


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
