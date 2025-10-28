from django.db import models
from .base import TimeStampedModel

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