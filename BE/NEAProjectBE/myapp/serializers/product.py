from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from myapp.models import Product

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