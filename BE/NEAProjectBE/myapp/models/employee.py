from django.db import models
from django.core.exceptions import ValidationError
from .base import TimeStampedModel
from .branch import Branch

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
        """Additional validation to ensure role is between 1-9"""
        if self.role and not self.role.isdigit():
            raise ValidationError({'role': 'Role must be a digit between 1 and 9'})
        
        if self.role and (int(self.role) < 1 or int(self.role) > 9):
            raise ValidationError({'role': 'Role must be between 1 and 9'})

    class Meta:
        app_label = 'myapp'
        verbose_name = "Employee"
        verbose_name_plural = "Employees"