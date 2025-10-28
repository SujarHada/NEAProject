from rest_framework import serializers
from myapp.models import Receiver

class ReceiverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receiver
        fields = "__all__"