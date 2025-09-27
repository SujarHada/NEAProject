from django.db import models

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Office(TimeStampedModel):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=512, blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class Branch(TimeStampedModel):
    office = models.ForeignKey(Office, on_delete=models.CASCADE, related_name="branches")
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=512, blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.name} ({self.office.name})"


class Employee(TimeStampedModel):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="employees")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    position = models.CharField(max_length=100, blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.first_name} {self.last_name}"


class Receiver(TimeStampedModel):
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=512, blank=True)

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


class Product(TimeStampedModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=ProductStatus.choices, default=ProductStatus.ACTIVE)

    def __str__(self) -> str:  # pragma: no cover
        return self.name
