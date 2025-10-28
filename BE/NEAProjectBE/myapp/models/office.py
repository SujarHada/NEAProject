from django.db import models
from .base import TimeStampedModel

class OfficeStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    BIN = "bin", "Bin"

class Office(TimeStampedModel):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=512, blank=True)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    status = models.CharField(
        max_length=10,
        choices=OfficeStatus.choices,
        default=OfficeStatus.ACTIVE
    )

    def __str__(self):
        return self.name

    class Meta:
        app_label = 'myapp'