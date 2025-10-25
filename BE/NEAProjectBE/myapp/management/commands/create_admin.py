# myapp/management/commands/create_admin.py
from django.core.management.base import BaseCommand
from django.db import IntegrityError
from myapp.models import User, UserRole


class Command(BaseCommand):
    help = 'Creates the master admin user for initial setup (runs only once)'

    def handle(self, *args, **options):
        admin_email = 'masteradmin@gmail.com'
        admin_password = 'masteradmin@12345'
        admin_name = 'Master Admin'  # Added name field

        # Check if master admin already exists
        if User.objects.filter(email=admin_email).exists():
            self.stdout.write(
                self.style.MIGRATE_LABEL('Master admin already exists!')
            )
            return

        try:
            # Create the master admin user
            admin_user = User.objects.create_user(
                email=admin_email,
                name=admin_name,  # Added name parameter
                password=admin_password,
                role=UserRole.ADMIN,
                is_staff=True,
                is_superuser=True
            )

            self.stdout.write(
                self.style.SUCCESS('=' * 60)
            )
            self.stdout.write(
                self.style.SUCCESS('🎉 MASTER ADMIN CREATED SUCCESSFULLY!')
            )
            self.stdout.write(
                self.style.SUCCESS('=' * 60)
            )
            self.stdout.write(
                self.style.SUCCESS(f'📧 Email: {admin_email}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'👤 Name: {admin_name}')  # Added name display
            )
            self.stdout.write(
                self.style.SUCCESS(f'🔑 Password: {admin_password}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'🎯 Role: {UserRole.ADMIN.label}')
            )
            self.stdout.write(
                self.style.SUCCESS('=' * 60)
            )
            self.stdout.write(
                self.style.WARNING('\n⚠️  SECURITY NOTICE:')
            )
            self.stdout.write(
                self.style.WARNING('• Change this password after first login!')
            )
            self.stdout.write(
                self.style.WARNING('• Keep these credentials secure!')
            )
            self.stdout.write(
                self.style.SUCCESS('\n🚀 NEXT STEPS:')
            )
            self.stdout.write(
                self.style.SUCCESS('1. Login at /api/auth/login/')
            )
            self.stdout.write(
                self.style.SUCCESS('2. Use the JWT token to create other users')
            )
            self.stdout.write(
                self.style.SUCCESS('3. Run seed command for sample data (optional)')
            )

        except IntegrityError as e:
            self.stdout.write(
                self.style.ERROR(f'Database error: {str(e)}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Unexpected error: {str(e)}')
            )