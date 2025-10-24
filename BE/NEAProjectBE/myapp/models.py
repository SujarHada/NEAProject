import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class UserRole(models.TextChoices):
    ADMIN = "admin", "Admin"
    VIEWER = "viewer", "Viewer"

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.ADMIN)
        extra_fields.setdefault('is_active', True)
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=10,
        choices=UserRole.choices,
        default=UserRole.VIEWER
    )
    
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN

    @property
    def is_viewer(self):
        return self.role == UserRole.VIEWER

    class Meta:
        app_label = 'myapp'
        verbose_name = "User"
        verbose_name_plural = "Users"

# Office Model
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

    class Meta:
        app_label = 'myapp'

# Employee Model (Regular model, no auth)
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
        max_length=1,  # Changed to 1 since we only need single digits
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
        """Additional validation to ensure role is between 1-9"""
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

class LetterStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SENT = "sent", "Sent"
    BIN = "bin", "Bin"


class Letter(TimeStampedModel):
    title = models.CharField(max_length=255)
    content = models.TextField()
    receiver = models.ForeignKey(Receiver, on_delete=models.SET_NULL, null=True, blank=True, related_name="letters")
    status = models.CharField(max_length=10, choices=LetterStatus.choices, default=LetterStatus.DRAFT)

    def __str__(self):
        return self.title

    class Meta:
        app_label = 'myapp'


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

    def __str__(self):
        return self.name

    class Meta:
        app_label = 'myapp'

class Dashboard(models.Model):
    total_active_products = models.IntegerField(default=0)
    total_active_branches = models.IntegerField(default=0)
    total_active_offices = models.IntegerField(default=0)
    total_active_employees = models.IntegerField(default=0)
    total_receivers = models.IntegerField(default=0)
    total_letters = models.IntegerField(default=0)
    total_draft_letters = models.IntegerField(default=0)
    total_sent_letters = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'myapp'
        verbose_name = "Dashboard Statistics"
        verbose_name_plural = "Dashboard Statistics"

    def __str__(self):
        return f"Dashboard Stats - {self.last_updated.strftime('%Y-%m-%d %H:%M')}"

    @classmethod
    def get_current_stats(cls):
        total_active_products = Product.objects.filter(status=ProductStatus.ACTIVE).count()
        total_active_branches = Branch.objects.filter(status=BranchStatus.ACTIVE).count()
        total_active_offices = Office.objects.filter(status=OfficeStatus.ACTIVE).count()
        total_active_employees = Employee.objects.filter(status=EmployeeStatus.ACTIVE).count()
        total_receivers = Receiver.objects.count()
        total_letters = Letter.objects.count()
        total_draft_letters = Letter.objects.filter(status=LetterStatus.DRAFT).count()
        total_sent_letters = Letter.objects.filter(status=LetterStatus.SENT).count()
        
        dashboard, created = cls.objects.get_or_create(
            id=1,
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