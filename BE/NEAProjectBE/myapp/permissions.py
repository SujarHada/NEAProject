from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admins to access.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit, but allow authenticated users to read.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return request.user.role == 'admin'


class IsViewerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow both admins and viewers.
    - Admins: full access
    - Viewers: read-only access only (no creation except letters)
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Both admin and viewer can access
        if request.user.role in ['admin', 'viewer']:
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Admins have full object access
        if request.user.role == 'admin':
            return True
        
        # Viewers can only read objects
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Viewers cannot modify or delete any objects
        return False


class IsViewerOrAdminWithCreateForLetters(permissions.BasePermission):
    """
    Custom permission for letters:
    - Admins: full access
    - Viewers: can read all and create new, but cannot update/delete
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Both admin and viewer can access
        if request.user.role in ['admin', 'viewer']:
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Admins have full access
        if request.user.role == 'admin':
            return True
        
        # Viewers can read anything
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Viewers cannot modify or delete existing letters
        return False


class CanCreateUser(permissions.BasePermission):
    """
    Custom permission to only allow admins to create users.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Only admins can create users
        if request.method == 'POST':
            return request.user.role == 'admin'
        
        # Both admins and viewers can list/retrieve users (GET requests)
        return request.user.role in ['admin', 'viewer']
    
    def has_object_permission(self, request, view, obj):
        # Only admins can update/delete users
        if request.user.role == 'admin':
            return True
        
        # Viewers can only read user details
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return False


class StrictViewerOrAdmin(permissions.BasePermission):
    """
    Strict permission for resources where viewers should have NO CREATE access.
    - Admins: full access (GET, POST, PUT, PATCH, DELETE)
    - Viewers: read-only only (GET only, no POST)
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admins have full access to all methods
        if request.user.role == 'admin':
            return True
        
        # Viewers can only use safe methods (GET, HEAD, OPTIONS)
        if request.user.role == 'viewer':
            return request.method in permissions.SAFE_METHODS
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Admins have full object access
        if request.user.role == 'admin':
            return True
        
        # Viewers can only read objects
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Viewers cannot modify or delete any objects
        return False