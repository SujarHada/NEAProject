from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from myapp.models import Office, Branch, Employee, Receiver, Letter, Product, LetterStatus, ProductStatus
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
                address=fake.address()
            )
            offices.append(office)
        self.stdout.write(self.style.SUCCESS(f'Created {len(offices)} offices'))
        
        # Create branches for each office
        branches = []
        for office in offices:
            for _ in range(2):
                branch = Branch.objects.create(
                    name=f"{office.name} - {fake.city()}",
                    address=fake.address(),
                    office=office
                )
                branches.append(branch)
        self.stdout.write(self.style.SUCCESS(f'Created {len(branches)} branches'))
        
        # Create employees
        employees = []
        for branch in branches:
            for _ in range(3):
                employee = Employee.objects.create(
                    first_name=fake.first_name(),
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
                description=fake.text(),
                status=random.choice([ProductStatus.ACTIVE, ProductStatus.BIN])
            )
            products.append(product)
        self.stdout.write(self.style.SUCCESS(f'Created {len(products)} products'))
        
        # Create receivers
        receivers = []
        for _ in range(5):
            receiver = Receiver.objects.create(
                name=fake.company(),
                address=fake.address(),
                email=fake.unique.company_email()
            )
            receivers.append(receiver)
        self.stdout.write(self.style.SUCCESS(f'Created {len(receivers)} receivers'))
        
        # Create letters
        for _ in range(15):
            Letter.objects.create(
                title=f"Letter: {fake.sentence()}",
                content='\n\n'.join(fake.paragraphs(nb=3)),
                status=random.choice([LetterStatus.DRAFT, LetterStatus.SENT, 'bin']),
                receiver=random.choice(receivers) if random.random() > 0.3 else None
            )
        self.stdout.write(self.style.SUCCESS('Created 15 letters'))
        
        self.stdout.write(self.style.SUCCESS('\nSuccessfully seeded the database!'))
