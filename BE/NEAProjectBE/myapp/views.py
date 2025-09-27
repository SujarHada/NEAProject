from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status as drf_status
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
    permission_classes = [permissions.IsAuthenticated]


class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all().order_by("-created_at")
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated]


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by("-created_at")
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]


class ReceiverViewSet(viewsets.ModelViewSet):
    queryset = Receiver.objects.all().order_by("-created_at")
    serializer_class = ReceiverSerializer
    permission_classes = [permissions.IsAuthenticated]


class LetterViewSet(viewsets.ModelViewSet):
    queryset = Letter.objects.all().order_by("-created_at")
    serializer_class = LetterSerializer
    permission_classes = [permissions.IsAuthenticated]
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
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status"]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = ProductStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        return Response(status=drf_status.HTTP_204_NO_CONTENT)
