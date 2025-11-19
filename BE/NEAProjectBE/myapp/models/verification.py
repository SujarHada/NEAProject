import secrets
from datetime import timedelta
from django.db import models
from django.utils import timezone
from .base import TimeStampedModel
from .user import User

class EmailVerification(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="email_verifications")
    email = models.EmailField()
    token = models.CharField(max_length=128, unique=True)
    expires_at = models.DateTimeField()
    verified_at = models.DateTimeField(null=True, blank=True)

    def mark_verified(self):
        self.verified_at = timezone.now()
        self.save(update_fields=["verified_at", "updated_at"])

    @staticmethod
    def generate_token():
        return secrets.token_urlsafe(32)

    @staticmethod
    def default_expiry():
        return timezone.now() + timedelta(hours=24)

    class Meta:
        app_label = 'myapp'
