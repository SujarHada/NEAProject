from .office import OfficeSerializer
from .branch import BranchSerializer
from .user import UserSignupSerializer, UserLoginSerializer, UserSerializer, CurrentUserSerializer
from .employee import EmployeeSerializer
from .receiver import ReceiverSerializer
from .letter import LetterItemSerializer, LetterReceiverSerializer, LetterSerializer
from .product import ProductSerializer
from .dashboard import DashboardSerializer

__all__ = [
    'OfficeSerializer',
    'BranchSerializer',
    'UserSignupSerializer',
    'UserLoginSerializer',
    'UserSerializer',
    'CurrentUserSerializer',
    'EmployeeSerializer',
    'ReceiverSerializer',
    'LetterItemSerializer',
    'LetterReceiverSerializer',
    'LetterSerializer',
    'ProductSerializer',
    'DashboardSerializer',
]