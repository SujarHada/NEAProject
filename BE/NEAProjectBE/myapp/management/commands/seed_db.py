from django.core.management.base import BaseCommand
from myapp.models import (
    Office, Branch, Employee, Receiver, Letter, Product, Dashboard,
    LetterStatus, ProductStatus, BranchStatus, OfficeStatus,
    UnitOfMeasurement, EmployeeRole, EmployeeStatus, User, UserRole
)
from faker import Faker
import random

class Command(BaseCommand):
    help = 'Seeds the database with sample data'

    def handle(self, *args, **options):
        fake = Faker()
        
        # Create users for authentication (separate from employees)
        if not User.objects.filter(email='admin@example.com').exists():
            # Create admin user
            admin_user = User.objects.create_user(
                email='admin@example.com',
                password='admin123',
                role=UserRole.ADMIN
            )
            self.stdout.write(self.style.SUCCESS('Created admin user (email: admin@example.com, password: admin123)'))
            
            # Create viewer user
            viewer_user = User.objects.create_user(
                email='viewer@example.com',
                password='viewer123',
                role=UserRole.VIEWER
            )
            self.stdout.write(self.style.SUCCESS('Created viewer user (email: viewer@example.com, password: viewer123)'))
        
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
        valid_roles = [role[0] for role in EmployeeRole.choices]  # ['1', '2', '3', '4', '5', '6', '7', '8', '9']
        
        for branch in branches:
            for _ in range(2):  # Create 2 employees per branch
                employee = Employee.objects.create(
                    branch=branch,
                    first_name=fake.first_name(),
                    middle_name=fake.first_name() if random.random() > 0.5 else '',
                    last_name=fake.last_name(),
                    email=fake.unique.email(),
                    role=random.choice(valid_roles),  # Random role from 1-9
                    status=EmployeeStatus.ACTIVE,
                )
                employees.append(employee)
        self.stdout.write(self.style.SUCCESS(f'Created {len(employees)} employees'))

        # Create receivers
        receivers = []
        id_card_types = [card_type[0] for card_type in Receiver.IDCardType.choices]
        
        for _ in range(10):
            receiver = Receiver.objects.create(
                name=fake.name(),
                post=fake.job(),
                id_card_number=fake.unique.uuid4()[:20],
                id_card_type=random.choice(id_card_types),
                office_name=fake.company(),
                office_address=fake.address(),
                phone_number=fake.phone_number(),
                vehicle_number=fake.license_plate()
            )
            receivers.append(receiver)
        self.stdout.write(self.style.SUCCESS(f'Created {len(receivers)} receivers'))

        # Create letters
        letters = []
        for _ in range(15):
            letter = Letter.objects.create(
                title=fake.sentence(nb_words=6),
                content=fake.paragraph(nb_sentences=5),
                receiver=random.choice(receivers) if receivers else None,
                status=random.choice([LetterStatus.DRAFT, LetterStatus.SENT])
            )
            letters.append(letter)
        self.stdout.write(self.style.SUCCESS(f'Created {len(letters)} letters'))

        # Create products
        products = []
        measurement_units = [unit[0] for unit in UnitOfMeasurement.choices]
        
        for _ in range(20):
            product = Product.objects.create(
                name=fake.word().title() + " " + fake.word().title(),
                company=fake.company(),
                status=ProductStatus.ACTIVE,
                remarks=fake.sentence(),
                unit_of_measurement=random.choice(measurement_units)
            )
            products.append(product)
        self.stdout.write(self.style.SUCCESS(f'Created {len(products)} products'))

        # Create dashboard statistics
        dashboard = Dashboard.get_current_stats()
        self.stdout.write(self.style.SUCCESS('Created/Updated dashboard statistics'))

        # Display sample information
        if employees:
            sample_employee = employees[0]
            self.stdout.write(self.style.SUCCESS('\nSample Employee Data:'))
            self.stdout.write(self.style.SUCCESS(f'  - Name: {sample_employee.first_name} {sample_employee.last_name}'))
            self.stdout.write(self.style.SUCCESS(f'  - Email: {sample_employee.email}'))
            self.stdout.write(self.style.SUCCESS(f'  - Role: {sample_employee.get_role_display()}'))
            self.stdout.write(self.style.SUCCESS(f'  - Branch: {sample_employee.branch.name}'))

        if products:
            sample_product = products[0]
            self.stdout.write(self.style.SUCCESS('\nSample Product Data:'))
            self.stdout.write(self.style.SUCCESS(f'  - Name: {sample_product.name}'))
            self.stdout.write(self.style.SUCCESS(f'  - Company: {sample_product.company}'))
            self.stdout.write(self.style.SUCCESS(f'  - SKU: {sample_product.sku}'))
            self.stdout.write(self.style.SUCCESS(f'  - Unit: {sample_product.get_unit_of_measurement_display()}'))

        self.stdout.write(self.style.SUCCESS('\nDatabase seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS(f'Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  - Offices: {len(offices)}'))
        self.stdout.write(self.style.SUCCESS(f'  - Branches: {len(branches)}'))
        self.stdout.write(self.style.SUCCESS(f'  - Employees: {len(employees)}'))
        self.stdout.write(self.style.SUCCESS(f'  - Receivers: {len(receivers)}'))
        self.stdout.write(self.style.SUCCESS(f'  - Letters: {len(letters)}'))
        self.stdout.write(self.style.SUCCESS(f'  - Products: {len(products)}'))