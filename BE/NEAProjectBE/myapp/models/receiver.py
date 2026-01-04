from django.db import models
from .base import TimeStampedModel


class Receiver(TimeStampedModel):
    class IDCardType(models.TextChoices):
        NATIONAL_ID = "national_id", "राष्ट्रिय परिचयपत्र"
        CITIZENSHIP = "citizenship", "नागरिकता प्रमाणपत्र"
        VOTER_ID = "voter_id", "मतदाता परिचयपत्र"
        PASSPORT = "passport", "राहदानी / ई–राहदानी"
        DRIVERS_LICENSE = "drivers_license", "सवारी चालक अनुमति पत्र"
        PAN_CARD = "pan_card", "स्थायी लेखा नम्बर (प्यान)"
        UNKNOWN = "unknown", "अज्ञात"
        EMPLOYEE_ID = "employee_id", "कर्मचारी परिचयपत्र"

    name = models.CharField(max_length=255)
    post = models.CharField(max_length=255, default="UNKNOWN")
    id_card_number = models.CharField(max_length=50, default="UNKNOWN")
    id_card_type = models.CharField(
        max_length=20, choices=IDCardType.choices, default=IDCardType.UNKNOWN
    )
    office_name = models.CharField(max_length=255, default="UNKNOWN")
    office_address = models.TextField(default="UNKNOWN")
    phone_number = models.CharField(max_length=20, default="UNKNOWN")
    vehicle_number = models.CharField(max_length=50, default="UNKNOWN")

    def __str__(self):
        return self.name

    class Meta:
        app_label = "myapp"

