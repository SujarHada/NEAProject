# myapp/models/organization.py
from django.db import models
from django.core.exceptions import ValidationError
from .base import TimeStampedModel

# Office Model
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

# Branch Model
class BranchStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    BIN = "bin", "Bin"

class Branch(TimeStampedModel):
    organization_id = models.PositiveSmallIntegerField(unique=True, null=True, blank=True, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True)
    address = models.CharField(max_length=512, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
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

    class Meta:
        app_label = 'myapp'

# Employee Model
class EmployeeRole(models.TextChoices):
    LEVEL_1 = "1", "Level 1"
    LEVEL_2 = "2", "Level 2"
    LEVEL_3 = "3", "Level 3"
    LEVEL_4 = "4", "Level 4"
    LEVEL_5 = "5", "Level 5"
    LEVEL_6 = "6", "Level 6"
    LEVEL_7 = "7", "Level 7"
    LEVEL_8 = "8", "Level 8"
    LEVEL_9 = "9", "Level 9"

class EmployeeStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    BIN = "bin", "Bin"

class Employee(TimeStampedModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="employees", null=True, blank=True)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=1,
        choices=EmployeeRole.choices,
        default=EmployeeRole.LEVEL_1,
    )
    status = models.CharField(
        max_length=10,
        choices=EmployeeStatus.choices,
        default=EmployeeStatus.ACTIVE
    )
    
    def __str__(self):
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"

    def clean(self):
        if self.role and not self.role.isdigit():
            raise ValidationError({'role': 'Role must be a digit between 1 and 9'})
        
        if self.role and (int(self.role) < 1 or int(self.role) > 9):
            raise ValidationError({'role': 'Role must be between 1 and 9'})

    class Meta:
        app_label = 'myapp'
        verbose_name = "Employee"
        verbose_name_plural = "Employees"

# Receiver Model
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