from rest_framework import serializers
from .models import Office, Branch, Employee, Receiver, Letter, Product


class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = "__all__"


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = "__all__"


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = "__all__"


class ReceiverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receiver
        fields = "__all__"


class LetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Letter
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
