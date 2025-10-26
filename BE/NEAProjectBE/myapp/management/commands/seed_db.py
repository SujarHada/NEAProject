from django.core.management.base import BaseCommand
from myapp.models import (
    Office, Branch, Employee, Letter, LetterItem, Dashboard,
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
                name='System Administrator',
                password='admin123',
                role=UserRole.ADMIN
            )
            self.stdout.write(self.style.SUCCESS('Created admin user (email: admin@example.com, name: System Administrator, password: admin123)'))
            
            # Create viewer user
            viewer_user = User.objects.create_user(
                email='viewer@example.com',
                name='Sample Viewer',
                password='viewer123',
                role=UserRole.VIEWER
            )
            self.stdout.write(self.style.SUCCESS('Created viewer user (email: viewer@example.com, name: Sample Viewer, password: viewer123)'))
        
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
        valid_roles = [role[0] for role in EmployeeRole.choices]
        
        for branch in branches:
            for _ in range(2):  # Create 2 employees per branch
                employee = Employee.objects.create(
                    branch=branch,
                    first_name=fake.first_name(),
                    middle_name=fake.first_name() if random.random() > 0.5 else '',
                    last_name=fake.last_name(),
                    email=fake.unique.email(),
                    role=random.choice(valid_roles),
                    status=EmployeeStatus.ACTIVE,
                )
                employees.append(employee)
        self.stdout.write(self.style.SUCCESS(f'Created {len(employees)} employees'))

        # Create letters with new field structure
        letters = []
        id_card_types = ["unknown", "national_id", "citizenship", "voter_id", "passport", "drivers_license", "pan_card"]
        nepali_numerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
        
        for i in range(15):
            # Generate Nepali numeral for letter count
            letter_count_nepali = ''.join(random.choice(nepali_numerals) for _ in range(2))
            
            letter = Letter.objects.create(
                # Main letter fields
                letter_count=letter_count_nepali,
                chalani_no=fake.random_number(digits=8),
                voucher_no=fake.random_number(digits=5),
                date="२०८२-०७-१५",
                receiver_office_name=fake.company(),  # Main receiver office
                receiver_address=fake.address(),
                subject=fake.sentence(nb_words=6),
                request_chalani_number=''.join(random.choice(nepali_numerals) for _ in range(8)),
                request_letter_count=''.join(random.choice(nepali_numerals) for _ in range(1)),
                request_date="२०८२-०६-३०",
                gatepass_no=fake.random_number(digits=6),
                
                # Receiver information (individual receiver)
                receiver_name=fake.name(),
                receiver_post=fake.job(),
                receiver_id_card_number=fake.unique.uuid4()[:15],
                receiver_id_card_type=random.choice(id_card_types),
                # Note: receiver_office_name is already used above, using different name for individual
                receiver_office_address=fake.address(),
                receiver_phone_number=''.join(random.choice(nepali_numerals) for _ in range(10)),
                receiver_vehicle_number=f"बा {random.randint(1,9)} पा {random.randint(1000,9999)}",
                
                # Status
                status=random.choice([LetterStatus.DRAFT, LetterStatus.SENT])
            )
            letters.append(letter)
            
            # Create letter items for each letter
            items_count = random.randint(1, 4)
            for j in range(items_count):
                LetterItem.objects.create(
                    letter=letter,
                    name=fake.word().title() + " " + fake.word().title(),
                    company=fake.company(),
                    serial_number=fake.random_number(digits=9),
                    unit_of_measurement=random.choice(["वटा", "प्याक", "किलो", "लीटर", "मिटर"]),
                    quantity=fake.random_number(digits=2),
                    remarks=fake.sentence() if random.random() > 0.3 else ""
                )
            
        self.stdout.write(self.style.SUCCESS(f'Created {len(letters)} letters with items'))

        # Create dashboard statistics
        try:
            dashboard = Dashboard.get_current_stats()
            self.stdout.write(self.style.SUCCESS('Created/Updated dashboard statistics'))
        except:
            self.stdout.write(self.style.WARNING('Dashboard statistics update skipped'))

        # Display sample information
        if employees:
            sample_employee = employees[0]
            self.stdout.write(self.style.SUCCESS('\nSample Employee Data:'))
            self.stdout.write(self.style.SUCCESS(f'  - Name: {sample_employee.first_name} {sample_employee.last_name}'))
            self.stdout.write(self.style.SUCCESS(f'  - Email: {sample_employee.email}'))
            self.stdout.write(self.style.SUCCESS(f'  - Role: {sample_employee.get_role_display()}'))
            self.stdout.write(self.style.SUCCESS(f'  - Branch: {sample_employee.branch.name}'))

        if letters:
            sample_letter = letters[0]
            self.stdout.write(self.style.SUCCESS('\nSample Letter Data:'))
            self.stdout.write(self.style.SUCCESS(f'  - Letter Count: {sample_letter.letter_count}'))
            self.stdout.write(self.style.SUCCESS(f'  - Subject: {sample_letter.subject}'))
            self.stdout.write(self.style.SUCCESS(f'  - Receiver Office: {sample_letter.receiver_office_name}'))
            self.stdout.write(self.style.SUCCESS(f'  - Receiver Name: {sample_letter.receiver_name}'))
            self.stdout.write(self.style.SUCCESS(f'  - Status: {sample_letter.get_status_display()}'))
            self.stdout.write(self.style.SUCCESS(f'  - Items Count: {sample_letter.items.count()}'))

        # Display sample user information
        self.stdout.write(self.style.SUCCESS('\nSample User Accounts:'))
        self.stdout.write(self.style.SUCCESS(f'  - Admin: admin@example.com (System Administrator) - Role: Admin'))
        self.stdout.write(self.style.SUCCESS(f'  - Viewer: viewer@example.com (Sample Viewer) - Role: Viewer'))

        self.stdout.write(self.style.SUCCESS('\nDatabase seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS(f'Summary:'))
        self.stdout.write(self.style.SUCCESS(f'  - Offices: {len(offices)}'))
        self.stdout.write(self.style.SUCCESS(f'  - Branches: {len(branches)}'))
        self.stdout.write(self.style.SUCCESS(f'  - Employees: {len(employees)}'))
        self.stdout.write(self.style.SUCCESS(f'  - Letters: {len(letters)}'))
        self.stdout.write(self.style.SUCCESS(f'  - Letter Items: {LetterItem.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'  - Users: 2 (admin@example.com, viewer@example.com)'))