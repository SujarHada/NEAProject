from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from myapp.models import Office, Branch, Employee, Receiver, Letter, Product, LetterStatus, ProductStatus, BranchStatus, OfficeStatus, UnitOfMeasurement
from faker import Faker
import random
import uuid

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
                organization_id=uuid.uuid4(),
                name=f"{fake.company()} Branch",
                email=fake.unique.company_email(),
                address=fake.address(),
                phone_number=fake.phone_number(),
                status=BranchStatus.ACTIVE
            )
            branches.append(branch)
        self.stdout.write(self.style.SUCCESS(f'Created {len(branches)} branches'))
        
        # Create employees
        employees = []
        for branch in branches:
            for _ in range(3):
                employee = Employee.objects.create(
                    first_name=fake.first_name(),
                    middle_name=fake.first_name() if random.random() > 0.5 else None,
                    last_name=fake.last_name(),
                    email=fake.unique.email(),
                    position=fake.job(),
                    branch=branch
                )
                employees.append(employee)
        self.stdout.write(self.style.SUCCESS(f'Created {len(employees)} employees'))
        
        # Create products
        products = []
        for _ in range(10):
            product = Product.objects.create(
                name=fake.catch_phrase(),
                company=fake.company(),
                status=random.choice([ProductStatus.ACTIVE, ProductStatus.BIN]),
                stock_quantity=random.randint(1, 100),
                unit_of_measurement=random.choice([u.value for u in UnitOfMeasurement]),
            )
            products.append(product)
        self.stdout.write(self.style.SUCCESS(f'Created {len(products)} products'))
        
        # Create receivers
        id_card_types = ["National ID", "Driver’s License", "Passport", "Voter ID"]
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
        
        self.stdout.write(self.style.SUCCESS('\nSuccessfully seeded the database!'))
