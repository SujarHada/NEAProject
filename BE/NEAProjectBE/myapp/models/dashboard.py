from django.db import models
from .product import Product, ProductStatus
from .branch import Branch, BranchStatus
from .office import Office, OfficeStatus
from .employee import Employee, EmployeeStatus
from .receiver import Receiver
from .letter import Letter, LetterStatus

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