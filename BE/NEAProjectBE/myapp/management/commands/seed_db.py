from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from myapp.models import (
    Office, Branch, Employee, Receiver, Letter, Product, Dashboard,
    LetterStatus, ProductStatus, BranchStatus, OfficeStatus,
    UnitOfMeasurement, EmployeeRole, EmployeeStatus
)
from faker import Faker
import random

class Command(BaseCommand):
    help = 'Seeds the database with sample data'

    def handle(self, *args, **options):
        fake = Faker()
        
        # Create superuser if not exists
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created admin user (username: admin, password: admin123)'))
        
        # Create offices
        offices = []
        for _ in range(3):
            office = Office.objects.create(
                name=f"{fake.company()} Office",
                address=fake.address(),
                email=fake.company_email(),
                phone_number=fake.phone_number(),
                status=OfficeStatus.ACTIVE
            )
            offices.append(office)
        self.stdout.write(self.style.SUCCESS(f'Created {len(offices)} offices'))
        
        # Create branches
        branches = []
        for _ in range(6):
            branch = Branch.objects.create(
                name=f"{fake.company()} Branch",
                email=fake.unique.company_email(),
                address=fake.address(),
                phone_number=fake.phone_number(),
                status=BranchStatus.ACTIVE
            )
            branches.append(branch)
        self.stdout.write(self.style.SUCCESS(f'Created {len(branches)} branches'))

        # Create Employees
        employees = []
        for branch in branches:
            for _ in range(3):
                employee = Employee.objects.create(
                    branch=branch,
                    first_name=fake.first_name(),
                    middle_name=fake.first_name() if random.random() > 0.5 else None,
                    last_name=fake.last_name(),
                    email=fake.unique.email(),
                    role=random.choice([EmployeeRole.ADMIN, EmployeeRole.VIEWER]),
                    status=random.choice([EmployeeStatus.ACTIVE, EmployeeStatus.BIN]),
                )
                employees.append(employee)
        self.stdout.write(self.style.SUCCESS(f'Created {len(employees)} employees'))

        # Create Products
        products = []
        companies = [fake.company() for _ in range(5)]  # Use limited companies to test duplicate prevention
        for i in range(10):
            product = Product.objects.create(
                name=f"Product {i+1} - {fake.word().capitalize()}",
                company=random.choice(companies),
                status=random.choice([ProductStatus.ACTIVE, ProductStatus.BIN]),
                remarks=fake.sentence(),
                unit_of_measurement=random.choice([u.value for u in UnitOfMeasurement]),
            )
            products.append(product)
        self.stdout.write(self.style.SUCCESS(f'Created {len(products)} products'))

        # Create Receivers
        id_card_types = [
            Receiver.IDCardType.NATIONAL_ID,
            Receiver.IDCardType.CITIZENSHIP,
            Receiver.IDCardType.VOTER_ID,
            Receiver.IDCardType.PASSPORT,
            Receiver.IDCardType.DRIVERS_LICENSE,
            Receiver.IDCardType.PAN_CARD
        ]
        
        receivers = []
        for _ in range(5):
            receiver = Receiver.objects.create(
                name=fake.name(),
                post=fake.job(),
                id_card_number=f"{random.randint(100000, 999999)}",
                id_card_type=random.choice(id_card_types),
                office_name=fake.company(),
                office_address=fake.address(),
                phone_number=fake.phone_number(),
                vehicle_number=f"BA-{random.randint(1, 9)}-{random.randint(1000, 9999)}"
            )
            receivers.append(receiver)
        self.stdout.write(self.style.SUCCESS(f'Created {len(receivers)} receivers'))

        # Create letters
        for _ in range(15):
            Letter.objects.create(
                title=f"Letter: {fake.sentence()}",
                content='\n\n'.join(fake.paragraphs(nb=3)),
                status=random.choice([LetterStatus.DRAFT, LetterStatus.SENT, LetterStatus.BIN]),
                receiver=random.choice(receivers) if random.random() > 0.3 else None
            )
        self.stdout.write(self.style.SUCCESS('Created 15 letters'))

        # Create Dashboard statistics
        dashboard = Dashboard.get_current_stats()
        self.stdout.write(self.style.SUCCESS('Created dashboard statistics'))

        self.stdout.write(self.style.SUCCESS('\nSuccessfully seeded the database!'))
        self.stdout.write(self.style.SUCCESS('\nDashboard Statistics:'))
        self.stdout.write(self.style.SUCCESS(f'  - Active Products: {dashboard.total_active_products}'))
        self.stdout.write(self.style.SUCCESS(f'  - Active Branches: {dashboard.total_active_branches}'))
        self.stdout.write(self.style.SUCCESS(f'  - Active Offices: {dashboard.total_active_offices}'))
        self.stdout.write(self.style.SUCCESS(f'  - Active Employees: {dashboard.total_active_employees}'))
        self.stdout.write(self.style.SUCCESS(f'  - Total Receivers: {dashboard.total_receivers}'))
        self.stdout.write(self.style.SUCCESS(f'  - Total Letters: {dashboard.total_letters}'))
        self.stdout.write(self.style.SUCCESS(f'  - Draft Letters: {dashboard.total_draft_letters}'))
        self.stdout.write(self.style.SUCCESS(f'  - Sent Letters: {dashboard.total_sent_letters}'))