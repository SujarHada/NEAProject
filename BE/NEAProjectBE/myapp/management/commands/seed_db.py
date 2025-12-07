from django.core.management.base import BaseCommand
from django.db import transaction
import logging
from myapp.models import (
    Office, Branch, Employee, Letter, LetterItem, Dashboard,
    LetterStatus, ProductStatus, BranchStatus, OfficeStatus,
    UnitOfMeasurement, EmployeeRole, EmployeeStatus, User, UserRole,
    Receiver, Product
)
from faker import Faker
import random

class Command(BaseCommand):
    help = 'Seeds the database with sample data'

    def handle(self, *args, **options):
        logger = logging.getLogger(__name__)
        fake = Faker()

        try:
            with transaction.atomic():
                # Create users for authentication (separate from employees)
                if not User.objects.filter(email='admin@example.com').exists():
                    admin_user = User.objects.create_user(
                        email='admin@example.com',
                        name='System Administrator',
                        password='admin123',
                        role=UserRole.ADMIN
                    )
                    self.stdout.write(self.style.SUCCESS('Created admin user (email: admin@example.com, name: System Administrator, password: admin123)'))

                    viewer_user = User.objects.create_user(
                        email='viewer@example.com',
                        name='Sample Viewer',
                        password='viewer123',
                        role=UserRole.VIEWER
                    )
                    self.stdout.write(self.style.SUCCESS('Created viewer user (email: viewer@example.com, name: Sample Viewer, password: viewer123)'))

                offices = []
                for _ in range(3):
                    try:
                        office = Office.objects.create(
                            name=f"{fake.company()} कार्यालय",
                            address=fake.address(),
                            email=fake.company_email(),
                            phone_number=fake.phone_number(),
                            status=OfficeStatus.ACTIVE
                        )
                        offices.append(office)
                    except Exception as e:
                        logger.error("Failed to create office", exc_info=e)
                        self.stderr.write(self.style.ERROR(f'Office creation failed: {e}'))
                self.stdout.write(self.style.SUCCESS(f'Created {len(offices)} offices'))

                branches = []
                for _ in range(6):
                    try:
                        branch = Branch.objects.create(
                            name=f"{fake.company()} शाखा",
                            email=fake.unique.company_email(),
                            address=fake.address(),
                            phone_number=fake.phone_number(),
                            status=BranchStatus.ACTIVE
                        )
                        branches.append(branch)
                    except Exception as e:
                        logger.error("Failed to create branch", exc_info=e)
                        self.stderr.write(self.style.ERROR(f'Branch creation failed: {e}'))
                self.stdout.write(self.style.SUCCESS(f'Created {len(branches)} branches'))

                employees = []
                valid_roles = [role[0] for role in EmployeeRole.choices]

                for branch in branches:
                    for _ in range(2):
                        try:
                            employee = Employee.objects.create(
                                branch=branch,
                                first_name=fake.first_name(),
                                middle_name=fake.first_name() if random.random() > 0.5 else '',
                                last_name=fake.last_name(),
                                email=fake.unique.email(),
                                role=random.choice(valid_roles),
                                status=EmployeeStatus.ACTIVE,
                            )
                            employee.set_password('employee123')
                            employee.save(update_fields=['password','updated_at'])
                            employees.append(employee)
                        except Exception as e:
                            logger.error("Failed to create employee", exc_info=e)
                            self.stderr.write(self.style.ERROR(f'Employee creation failed: {e}'))
                self.stdout.write(self.style.SUCCESS(f'Created {len(employees)} employees'))

                letters = []
                id_card_types = ["unknown", "national_id", "citizenship", "voter_id", "passport", "drivers_license", "pan_card"]
                nepali_numerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
                nepali_subjects = ["विद्युत सामग्री खरिद", "मर्मत कार्य अनुरोध", "चालानी विवरण", "भुक्तानी सम्बन्धी पत्र", "भण्डारण सूची अद्यावधिक"]
                nepali_companies = ["नेपाल विद्युत प्राधिकरण", "सगरमाथा ट्रेडर्स", "अरुण कन्स्ट्रक्सन", "बुधनी सप्लायर्स"]
                nepali_products = ["ट्रान्सफर्मर", "तार", "मीटर", "ब्रेककर", "फ्युज", "कन्ट्रोल प्यानल", "क्वायल", "पेन्ट", "क्याबल"]

                for _ in range(15):
                    try:
                        letter_count_nepali = ''.join(random.choice(nepali_numerals) for _ in range(2))
                        letter = Letter.objects.create(
                            letter_count=letter_count_nepali,
                            chalani_no=fake.random_number(digits=8),
                            voucher_no=fake.random_number(digits=5),
                            date="२०८२-०७-१५",
                            office_name=random.choice(["केन्द्रीय भण्डार", "पूर्वाञ्चल कार्यालय", "पश्चिमाञ्चल कार्यालय"]),
                            sub_office_name=random.choice(["उप केन्द्रीय भण्डार", "उप-कार्यालय १", "उप-कार्यालय २"]),
                            receiver_office_name=random.choice([fake.company(), random.choice(nepali_companies)]),
                            receiver_address=fake.address(),
                            subject=random.choice([fake.sentence(nb_words=6), random.choice(nepali_subjects)]),
                            request_chalani_number=''.join(random.choice(nepali_numerals) for _ in range(8)),
                            request_letter_count=''.join(random.choice(nepali_numerals) for _ in range(1)),
                            request_date="२०८२-०६-३०",
                            gatepass_no=fake.random_number(digits=6),
                            receiver_name=fake.name(),
                            receiver_post=fake.job(),
                            receiver_id_card_number=fake.unique.uuid4()[:15],
                            receiver_id_card_type=random.choice(id_card_types),
                            receiver_office_address=fake.address(),
                            receiver_phone_number=''.join(random.choice(nepali_numerals) for _ in range(10)),
                            receiver_vehicle_number=f"बा {random.randint(1,9)} पा {random.randint(1000,9999)}",
                            status=random.choice([LetterStatus.DRAFT, LetterStatus.SENT])
                        )
                        letters.append(letter)

                        items_count = random.randint(1, 4)
                        for _ in range(items_count):
                            try:
                                # Generate product_id in Nepali numerals
                                product_id_nepali = ''.join(random.choice(nepali_numerals) for _ in range(6))
                                
                                LetterItem.objects.create(
                                    letter=letter,
                                    product_id=product_id_nepali,  # Added product_id field
                                    name=f"{random.choice(nepali_products)} {fake.word().title()}",
                                    company=random.choice(nepali_companies),
                                    serial_number=fake.random_number(digits=9),
                                    # Use the updated UnitOfMeasurement choices
                                    unit_of_measurement=random.choice([
                                        UnitOfMeasurement.NOS,
                                        UnitOfMeasurement.SET,
                                        UnitOfMeasurement.Pair,
                                        UnitOfMeasurement.Meter,
                                        UnitOfMeasurement.KG,
                                        UnitOfMeasurement.LTR,
                                        UnitOfMeasurement.RIM,
                                        UnitOfMeasurement.PAD,
                                        UnitOfMeasurement.DOZEN,
                                        UnitOfMeasurement.KMS,
                                        UnitOfMeasurement.CU_METER,
                                        UnitOfMeasurement.PCS,
                                        UnitOfMeasurement.ROLLS,
                                        UnitOfMeasurement.BOTTLES,
                                        UnitOfMeasurement.PACKETS,
                                        UnitOfMeasurement.SQ_FT,
                                        UnitOfMeasurement.FT,
                                        UnitOfMeasurement.COIL
                                    ]),
                                    quantity=fake.random_number(digits=2),
                                    remarks=fake.sentence() if random.random() > 0.3 else ""
                                )
                            except Exception as e:
                                logger.error("Failed to create letter item", exc_info=e)
                                self.stderr.write(self.style.ERROR(f'Letter item creation failed: {e}'))
                    except Exception as e:
                        logger.error("Failed to create letter", exc_info=e)
                        self.stderr.write(self.style.ERROR(f'Letter creation failed: {e}'))

                self.stdout.write(self.style.SUCCESS(f'Created {len(letters)} letters with items'))

                receivers = []
                for _ in range(10):
                    try:
                        receiver = Receiver.objects.create(
                            name=fake.name(),
                            post=fake.job(),
                            id_card_number=fake.unique.uuid4()[:15],
                            id_card_type=random.choice(id_card_types),
                            office_name=random.choice([fake.company(), random.choice(nepali_companies)]),
                            office_address=fake.address(),
                            phone_number=fake.phone_number(),
                            vehicle_number=f"बा {random.randint(1,9)} पा {random.randint(1000,9999)}",
                        )
                        receivers.append(receiver)
                    except Exception as e:
                        logger.error("Failed to create receiver", exc_info=e)
                        self.stderr.write(self.style.ERROR(f'Receiver creation failed: {e}'))
                self.stdout.write(self.style.SUCCESS(f'Created {len(receivers)} receivers'))
                
                products = []
                nepali_remarks = ["उत्तम अवस्था", "नयाँ", "पुरानो", "चाँडै खरिद आवश्यक"]
                
                # Updated product names to better match the new units
                product_units_mapping = {
                    UnitOfMeasurement.NOS: ["ट्रान्सफर्मर", "ब्रेककर", "फ्युज", "कन्ट्रोल प्यानल", "स्विच", "बल्ब"],
                    UnitOfMeasurement.SET: ["टुल्स सेट", "सिक्युरिटी किट", "इन्स्टालेसन किट"],
                    UnitOfMeasurement.Pair: ["ग्लब्स", "सुज", "क्लिप", "प्लायर्स"],
                    UnitOfMeasurement.Meter: ["तार", "क्याबल", "पाइप", "रस्सी"],
                    UnitOfMeasurement.KG: ["सिसा", "थाङ्गा", "पेन्ट", "ग्रिज", "कनक्रीट"],
                    UnitOfMeasurement.LTR: ["पेन्ट", "डिजेल", "तेल", "वार्निश"],
                    UnitOfMeasurement.RIM: ["कागज", "फोटो पेपर"],
                    UnitOfMeasurement.PAD: ["नोटप्याड", "रजिष्टर"],
                    UnitOfMeasurement.DOZEN: ["बल्ब", "फ्युज", "क्लिप", "प्लग"],
                    UnitOfMeasurement.KMS: ["केबल", "तार", "सडक निर्माण"],
                    UnitOfMeasurement.CU_METER: ["रोडा", "बालुवा", "कनक्रीट"],
                    UnitOfMeasurement.PCS: ["किला", "नट", "बोल्ट", "स्क्रु"],
                    UnitOfMeasurement.ROLLS: ["केबल", "तार", "फेन्सिङ वायर"],
                    UnitOfMeasurement.BOTTLES: ["ग्लु", "तेल", "एसिड"],
                    UnitOfMeasurement.PACKETS: ["स्क्रु", "नट-बोल्ट", "क्लिप", "रबर"],
                    UnitOfMeasurement.SQ_FT: ["टाइल", "कार्पेट", "फोम"],
                    UnitOfMeasurement.FT: ["पाइप", "एल्युमिनियम प्रोफाइल", "लकडी"],
                    UnitOfMeasurement.COIL: ["स्टिल क्वायल", "कपर वायर"]
                }
                
                # Create products with appropriate units
                all_units = list(UnitOfMeasurement)
                for unit in all_units:
                    try:
                        # Create 1-2 products for each unit type
                        for i in range(random.randint(1, 2)):
                            if unit in product_units_mapping and product_units_mapping[unit]:
                                product_name = random.choice(product_units_mapping[unit])
                                if i > 0:
                                    product_name = f"{product_name} {fake.word().title()}"
                            else:
                                product_name = f"{random.choice(nepali_products)} {fake.word().title()}"
                            
                            product = Product.objects.create(
                                name=product_name,
                                company=random.choice(nepali_companies),
                                status=ProductStatus.ACTIVE,
                                remarks=random.choice(nepali_remarks),
                                unit_of_measurement=unit,
                            )
                            products.append(product)
                    except Exception as e:
                        logger.error(f"Failed to create product for unit {unit}", exc_info=e)
                        self.stderr.write(self.style.ERROR(f'Product creation failed for unit {unit}: {e}'))
                
                # Create additional random products
                for _ in range(5):
                    try:
                        product = Product.objects.create(
                            name=f"{random.choice(nepali_products)} {fake.word().title()}",
                            company=random.choice(nepali_companies),
                            status=ProductStatus.ACTIVE,
                            remarks=random.choice(nepali_remarks),
                            unit_of_measurement=random.choice([
                                UnitOfMeasurement.NOS,
                                UnitOfMeasurement.SET,
                                UnitOfMeasurement.Pair,
                                UnitOfMeasurement.Meter,
                                UnitOfMeasurement.KG,
                                UnitOfMeasurement.LTR,
                                UnitOfMeasurement.RIM,
                                UnitOfMeasurement.PAD,
                                UnitOfMeasurement.DOZEN,
                                UnitOfMeasurement.KMS,
                                UnitOfMeasurement.CU_METER,
                                UnitOfMeasurement.PCS,
                                UnitOfMeasurement.ROLLS,
                                UnitOfMeasurement.BOTTLES,
                                UnitOfMeasurement.PACKETS,
                                UnitOfMeasurement.SQ_FT,
                                UnitOfMeasurement.FT,
                                UnitOfMeasurement.COIL
                            ]),
                        )
                        products.append(product)
                    except Exception as e:
                        logger.error("Failed to create additional product", exc_info=e)
                        self.stderr.write(self.style.ERROR(f'Additional product creation failed: {e}'))
                
                self.stdout.write(self.style.SUCCESS(f'Created {len(products)} products'))

                try:
                    Dashboard.get_current_stats()
                    self.stdout.write(self.style.SUCCESS('Created/Updated dashboard statistics'))
                except Exception as e:
                    logger.warning("Dashboard statistics update skipped", exc_info=e)
                    self.stdout.write(self.style.WARNING('Dashboard statistics update skipped'))

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
                self.stdout.write(self.style.SUCCESS(f'  - Office Name: {sample_letter.office_name}'))
                self.stdout.write(self.style.SUCCESS(f'  - Sub Office Name: {sample_letter.sub_office_name}'))
                self.stdout.write(self.style.SUCCESS(f'  - Receiver Office: {sample_letter.receiver_office_name}'))
                self.stdout.write(self.style.SUCCESS(f'  - Receiver Name: {sample_letter.receiver_name}'))
                self.stdout.write(self.style.SUCCESS(f'  - Status: {sample_letter.get_status_display()}'))
                self.stdout.write(self.style.SUCCESS(f'  - Items Count: {sample_letter.items.count()}'))
                
                # Show sample letter item with product_id
                if sample_letter.items.exists():
                    sample_item = sample_letter.items.first()
                    self.stdout.write(self.style.SUCCESS('\nSample Letter Item Data:'))
                    self.stdout.write(self.style.SUCCESS(f'  - Product ID: {sample_item.product_id}'))
                    self.stdout.write(self.style.SUCCESS(f'  - Name: {sample_item.name}'))
                    self.stdout.write(self.style.SUCCESS(f'  - Company: {sample_item.company}'))
                    self.stdout.write(self.style.SUCCESS(f'  - Serial Number: {sample_item.serial_number}'))
                    self.stdout.write(self.style.SUCCESS(f'  - Unit of Measurement: {sample_item.get_unit_of_measurement_display()}'))
                    self.stdout.write(self.style.SUCCESS(f'  - Quantity: {sample_item.quantity}'))

            if products:
                # Show sample products with different units
                self.stdout.write(self.style.SUCCESS('\nSample Products with Different Units:'))
                unique_units = {}
                for product in products:
                    if product.unit_of_measurement not in unique_units:
                        unique_units[product.unit_of_measurement] = product
                        if len(unique_units) >= 5:  # Show 5 different units
                            break
                
                for unit, product in unique_units.items():
                    self.stdout.write(self.style.SUCCESS(f'  - {product.name} ({product.get_unit_of_measurement_display()}) - Company: {product.company}'))

            self.stdout.write(self.style.SUCCESS('\nSample User Accounts:'))
            self.stdout.write(self.style.SUCCESS('  - Admin: admin@example.com (System Administrator) - Role: Admin'))
            self.stdout.write(self.style.SUCCESS('  - Viewer: viewer@example.com (Sample Viewer) - Role: Viewer'))

            self.stdout.write(self.style.SUCCESS('\nDatabase seeding completed successfully!'))
            self.stdout.write(self.style.SUCCESS('Summary:'))
            self.stdout.write(self.style.SUCCESS(f'  - Offices: {len(offices)}'))
            self.stdout.write(self.style.SUCCESS(f'  - Branches: {len(branches)}'))
            self.stdout.write(self.style.SUCCESS(f'  - Employees: {len(employees)}'))
            self.stdout.write(self.style.SUCCESS(f'  - Letters: {len(letters)}'))
            self.stdout.write(self.style.SUCCESS(f'  - Letter Items: {LetterItem.objects.count()}'))
            self.stdout.write(self.style.SUCCESS(f'  - Products: {Product.objects.count()}'))
            self.stdout.write(self.style.SUCCESS(f'  - Units Used: {len(set(p.unit_of_measurement for p in products))} different units'))
            self.stdout.write(self.style.SUCCESS('  - Users: 2 (admin@example.com, viewer@example.com)'))

        except Exception as e:
            logger.error("Seeding failed", exc_info=e)
            self.stderr.write(self.style.ERROR(f'Error during seeding: {e}'))