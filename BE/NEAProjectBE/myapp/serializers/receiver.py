from rest_framework import serializers
from myapp.models import Receiver

class ReceiverSerializer(serializers.ModelSerializer):
    id_card_type_display = serializers.CharField(
        source="get_id_card_type_display",
        read_only=True
    )

    class Meta:
        model = Receiver
        fields = "__all__"