from django.core.management import call_command
from io import StringIO
from contextlib import redirect_stdout
import sys

def seed_database():
    """Helper function to call the seed_db management command"""
    out = StringIO()
    err = StringIO()
    
    # Redirect stdout and stderr to capture the output
    with redirect_stdout(out):
        old_stderr = sys.stderr
        sys.stderr = err
        try:
            call_command('seed_db')
            success = True
        except Exception as e:
            success = False
            err.write(str(e))
        finally:
            sys.stderr = old_stderr
    
    return {
        'success': success,
        'output': out.getvalue(),
        'error': err.getvalue()
    }
