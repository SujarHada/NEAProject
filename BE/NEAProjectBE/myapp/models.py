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
    organization_id = models.PositiveSmallIntegerField(unique=True, null=True, blank=True, editable=False)
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
    def save(self, *args, **kwargs):
        if not self.organization_id:
            last_id = Branch.objects.aggregate(models.Max('organization_id'))['organization_id__max'] or 0
            if last_id >= 9999:
                raise ValueError("Maximum organization_id limit (9999) reached.")
            self.organization_id = last_id + 1
        super().save(*args, **kwargs)

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
    # ID Card Type Choices
    class IDCardType(models.TextChoices):
        NATIONAL_ID = "national_id", "National Identity Card"
        CITIZENSHIP = "citizenship", "Citizenship Certificate"
        VOTER_ID = "voter_id", "Voter ID Card"
        PASSPORT = "passport", "Passport / E-Passport"
        DRIVERS_LICENSE = "drivers_license", "Driver’s License"
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

    def __str__(self) -> str:
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
    remarks = models.TextField(blank=True, default="")
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


class Dashboard(models.Model):
    """
    Model to store dashboard statistics.
    This model doesn't need timestamps as it will be dynamically calculated.
    """
    # Total counts
    total_active_products = models.IntegerField(default=0)
    total_active_branches = models.IntegerField(default=0)
    total_active_offices = models.IntegerField(default=0)
    total_active_employees = models.IntegerField(default=0)
    total_receivers = models.IntegerField(default=0)
    total_letters = models.IntegerField(default=0)
    
    # Additional statistics
    total_draft_letters = models.IntegerField(default=0)
    total_sent_letters = models.IntegerField(default=0)
    
    # Timestamp for when the statistics were last updated
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Dashboard Statistics"
        verbose_name_plural = "Dashboard Statistics"

    def __str__(self):
        return f"Dashboard Stats - {self.last_updated.strftime('%Y-%m-%d %H:%M')}"

    @classmethod
    def get_current_stats(cls):
        """
        Get or create the current dashboard statistics with real-time counts.
        """
        # Calculate real-time counts
        total_active_products = Product.objects.filter(status=ProductStatus.ACTIVE).count()
        total_active_branches = Branch.objects.filter(status=BranchStatus.ACTIVE).count()
        total_active_offices = Office.objects.filter(status=OfficeStatus.ACTIVE).count()
        total_active_employees = Employee.objects.filter(status=EmployeeStatus.ACTIVE).count()
        total_receivers = Receiver.objects.count()
        total_letters = Letter.objects.count()
        total_draft_letters = Letter.objects.filter(status=LetterStatus.DRAFT).count()
        total_sent_letters = Letter.objects.filter(status=LetterStatus.SENT).count()
        
        # Get or create dashboard instance
        dashboard, created = cls.objects.get_or_create(
            id=1,  # Single instance for dashboard
            defaults={
                'total_active_products': total_active_products,
                'total_active_branches': total_active_branches,
                'total_active_offices': total_active_offices,
                'total_active_employees': total_active_employees,
                'total_receivers': total_receivers,
                'total_letters': total_letters,
                'total_draft_letters': total_draft_letters,
                'total_sent_letters': total_sent_letters,
            }
        )
        
        # Update if not created
        if not created:
            dashboard.total_active_products = total_active_products
            dashboard.total_active_branches = total_active_branches
            dashboard.total_active_offices = total_active_offices
            dashboard.total_active_employees = total_active_employees
            dashboard.total_receivers = total_receivers
            dashboard.total_letters = total_letters
            dashboard.total_draft_letters = total_draft_letters
            dashboard.total_sent_letters = total_sent_letters
            dashboard.save()
        
        return dashboard