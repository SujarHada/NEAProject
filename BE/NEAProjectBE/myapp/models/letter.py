from django.db import models
from .base import TimeStampedModel

class LetterStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SENT = "sent", "Sent"
    BIN = "bin", "Bin"

class Letter(TimeStampedModel):
    letter_count = models.CharField(max_length=100, blank=True, default="")
    chalani_no = models.CharField(max_length=100, null=True, blank=True)
    voucher_no = models.CharField(max_length=100, null=True, blank=True)
    date = models.CharField(max_length=50, blank=True, default="")
    receiver_office_name = models.CharField(max_length=200, blank=True, default="")
    receiver_address = models.CharField(max_length=500, blank=True, default="")
    subject = models.CharField(max_length=500, blank=True, default="")
    request_chalani_number = models.CharField(max_length=100, blank=True, default="")
    request_letter_count = models.CharField(max_length=100, blank=True, default="")
    request_date = models.CharField(max_length=50, blank=True, default="")
    gatepass_no = models.CharField(max_length=100, null=True, blank=True)
    office_name = models.CharField(max_length=200, blank=True, default="")
    sub_office_name = models.CharField(max_length=200, blank=True, default="")
    
    # Receiver information
    receiver_name = models.CharField(max_length=200, blank=True, default="")
    receiver_post = models.CharField(max_length=100, blank=True, default="")
    receiver_id_card_number = models.CharField(max_length=100, blank=True, default="")
    receiver_id_card_type = models.CharField(
        max_length=20, 
        blank=True, 
        default="unknown",
        choices=[
            ("unknown", "Unknown"),
            ("national_id", "National ID"),
            ("citizenship", "Citizenship"),
            ("voter_id", "Voter ID"),
            ("passport", "Passport"),
            ("drivers_license", "Driver's License"),
            ("pan_card", "PAN Card")
        ]
    )
    receiver_office_name = models.CharField(max_length=200, blank=True, default="")
    receiver_office_address = models.CharField(max_length=500, blank=True, default="")
    receiver_phone_number = models.CharField(max_length=50, blank=True, default="")
    receiver_vehicle_number = models.CharField(max_length=50, blank=True, default="")
    
    # Status field
    status = models.CharField(
        max_length=10, 
        choices=LetterStatus.choices, 
        default=LetterStatus.DRAFT
    )

    def __str__(self):
        return self.subject or f"Letter {self.id}"

    class Meta:
        app_label = 'myapp'

class LetterItem(TimeStampedModel):
    letter = models.ForeignKey(Letter, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=500)
    company = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=100)
    unit_of_measurement = models.CharField(max_length=50, blank=True, default="")
    quantity = models.CharField(max_length=100)
    remarks = models.CharField(max_length=500, blank=True, default="")

    class Meta:
        ordering = ['serial_number']
        unique_together = ['letter', 'serial_number']
        app_label = 'myapp'

    def __str__(self):
        return f"{self.serial_number}. {self.name}"