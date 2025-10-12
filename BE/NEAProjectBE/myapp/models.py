import uuid
from django.db import models

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class OfficeStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    BIN = "bin", "Bin"
class Office(TimeStampedModel):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=512, blank=True)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    # Add status field
    status = models.CharField(
        max_length=10,
        choices=OfficeStatus.choices,
        default=OfficeStatus.ACTIVE
    )

    def __str__(self) -> str:  # pragma: no cover
        return self.name

class BranchStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    BIN = "bin", "Bin"

class Branch(TimeStampedModel):
    organization_id = models.UUIDField(default=uuid.uuid4, null=True, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True)
    address = models.CharField(max_length=512, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)

    # Soft delete field
    status = models.CharField(
        max_length=10,
        choices=BranchStatus.choices,
        default=BranchStatus.ACTIVE
    )

    def __str__(self):
        return self.name

class EmployeeRole(models.TextChoices):
    ADMIN = "admin", "Admin"
    VIEWER = "viewer", "Viewer"
class EmployeeStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    BIN = "bin", "Bin"
class Employee(TimeStampedModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="employees")
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=10,
        choices=EmployeeRole.choices,
        default=EmployeeRole.VIEWER
    )
    status = models.CharField(
        max_length=10,
        choices=EmployeeStatus.choices,
        default=EmployeeStatus.ACTIVE
    )
    def __str__(self) -> str:  # pragma: no cover
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"


class Receiver(TimeStampedModel):
    name = models.CharField(max_length=255)
    post = models.CharField(max_length=255, default="UNKNOWN")
    id_card_number = models.CharField(max_length=50, default="UNKNOWN")
    id_card_type = models.CharField(max_length=50, default="UNKNOWN")
    office_name = models.CharField(max_length=255, default="UNKNOWN")
    office_address = models.TextField(default="UNKNOWN")
    phone_number = models.CharField(max_length=20, default="UNKNOWN")
    vehicle_number = models.CharField(max_length=50, default="UNKNOWN")

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class LetterStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SENT = "sent", "Sent"
    BIN = "bin", "Bin"


class Letter(TimeStampedModel):
    title = models.CharField(max_length=255)
    content = models.TextField()
    receiver = models.ForeignKey(Receiver, on_delete=models.SET_NULL, null=True, blank=True, related_name="letters")
    status = models.CharField(max_length=10, choices=LetterStatus.choices, default=LetterStatus.DRAFT)

    def __str__(self) -> str:  # pragma: no cover
        return self.title


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
    
    # Stock information
    stock_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_of_measurement = models.CharField(
        max_length=10, 
        choices=UnitOfMeasurement.choices, 
        default=UnitOfMeasurement.NOS
    )
    
    # Unique identifier
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Auto-generate SKU if not provided or empty string
        if not self.sku or self.sku.strip() == '':
            # Generate a 13-digit unique number
            import random
            random_digits = ''.join([str(random.randint(0, 9)) for _ in range(13)])
            self.sku = random_digits
        super().save(*args, **kwargs)

    def __str__(self) -> str:  # pragma: no cover
        return self.name
