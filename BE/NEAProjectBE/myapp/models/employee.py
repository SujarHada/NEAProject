from django.db import models
from django.core.exceptions import ValidationError
from .base import TimeStampedModel
from .branch import Branch
from django.contrib.auth.hashers import make_password, check_password

class EmployeeRole(models.TextChoices):
    ADMIN = "admin", "Admin"
    VIEWER = "viewer", "Viewer"

class EmployeeStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    BIN = "bin", "Bin"

class Employee(TimeStampedModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="employees", null=True, blank=True)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, blank=True, default="")
    role = models.CharField(
        max_length=20,
        choices=EmployeeRole.choices,
        default=EmployeeRole.VIEWER,
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

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        if not self.password:
            return False
        return check_password(raw_password, self.password)

    def clean(self):
        """Ensure role is one of the defined choices"""
        valid_values = [c[0] for c in EmployeeRole.choices]
        if self.role and self.role not in valid_values:
            raise ValidationError({'role': 'Role must be either admin or viewer'})

    class Meta:
        app_label = 'myapp'
        verbose_name = "Employee"
        verbose_name_plural = "Employees"