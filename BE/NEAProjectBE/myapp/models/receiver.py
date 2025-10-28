from django.db import models
from .base import TimeStampedModel

class Receiver(TimeStampedModel):
    class IDCardType(models.TextChoices):
        NATIONAL_ID = "national_id", "National Identity Card"
        CITIZENSHIP = "citizenship", "Citizenship Certificate"
        VOTER_ID = "voter_id", "Voter ID Card"
        PASSPORT = "passport", "Passport / E-Passport"
        DRIVERS_LICENSE = "drivers_license", "Driver's License"
        PAN_CARD = "pan_card", "PAN Card"
        UNKNOWN = "unknown", "UNKNOWN"

    name = models.CharField(max_length=255)
    post = models.CharField(max_length=255, default="UNKNOWN")
    id_card_number = models.CharField(max_length=50, default="UNKNOWN")
    id_card_type = models.CharField(
        max_length=20, 
        choices=IDCardType.choices,
        default=IDCardType.UNKNOWN
    )
    office_name = models.CharField(max_length=255, default="UNKNOWN")
    office_address = models.TextField(default="UNKNOWN")
    phone_number = models.CharField(max_length=20, default="UNKNOWN")
    vehicle_number = models.CharField(max_length=50, default="UNKNOWN")

    def __str__(self):
        return self.name

    class Meta:
        app_label = 'myapp'