import random
from django.db import models
from .base import TimeStampedModel

class ProductStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    BIN = "bin", "Bin"

class UnitOfMeasurement(models.TextChoices):
    NOS = "nos", "Nos."
    SET = "set", "Set"
    KG = "kg", "KG"
    LTR = "ltr", "Ltr"
    PCS = "pcs", "Pcs"

class Product(TimeStampedModel):
    name = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=10, choices=ProductStatus.choices, default=ProductStatus.ACTIVE)
    remarks = models.TextField(blank=True, default="")
    unit_of_measurement = models.CharField(
        max_length=10, 
        choices=UnitOfMeasurement.choices, 
        default=UnitOfMeasurement.NOS
    )
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if not self.sku or self.sku.strip() == '':
            random_digits = ''.join([str(random.randint(0, 9)) for _ in range(13)])
            self.sku = random_digits
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        app_label = 'myapp'