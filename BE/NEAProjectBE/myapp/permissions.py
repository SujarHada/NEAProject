from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admins to access.
    """
    message = "Only administrators can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit, but allow authenticated users to read.
    """
    message = "Only administrators can modify this data. Viewers and creators have read-only access."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return request.user.role == 'admin'


class IsViewerOrCreatorOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow admins, creators, and viewers.
    - Admins: full access
    - Creators: read-all and can perform certain actions (depending on view)
    - Viewers: read-only access only
    """
    message = "You do not have permission to modify this. 'Viewers' have read-only access."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admin and Creator can access everything (depending on further checks)
        if request.user.role in ['admin', 'creator']:
            return True
        
        # Viewer can only access if it's a safe method
        if request.user.role == 'viewer':
            return request.method in permissions.SAFE_METHODS
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Admins and Creators have full object access
        if request.user.role in ['admin', 'creator']:
            return True
        
        # Viewers can only read objects
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return False


class IsViewerOrCreatorOrAdminWithCreateForLetters(permissions.BasePermission):
    """
    Custom permission for letters:
    - Admins: full access
    - Creators: can read all and create new, but cannot update/delete
    - Viewers: can read all, but cannot create/update/delete
    """
    message = "You do not have permission to perform this action. 'Viewers' cannot create letters."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admin and Creator can always access
        if request.user.role in ['admin', 'creator']:
            return True
        
        # Viewer can only access if it's a safe method
        if request.user.role == 'viewer':
            return request.method in permissions.SAFE_METHODS
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Admins and Creators have full object access
        if request.user.role in ['admin', 'creator']:
            return True
        
        # Viewers can only read anything
        if request.method in permissions.SAFE_METHODS:
            return True
            
        return False


class CanCreateUser(permissions.BasePermission):
    """
    Custom permission to only allow admins to create users.
    """
    message = "Only administrators can manage users."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Only admins can create users
        if request.method == 'POST':
            return request.user.role == 'admin'
        
        # Admins, Creators and Viewers can list/retrieve users (GET requests)
        return request.user.role in ['admin', 'creator', 'viewer']
    
    def has_object_permission(self, request, view, obj):
        # Only admins can update/delete users
        if request.user.role == 'admin':
            return True
        
        # Creators/Viewers can only read user details
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return False


class StrictViewerOrCreatorOrAdmin(permissions.BasePermission):
    """
    Strict permission for resources where viewers/creators should have NO CREATE access.
    - Admins: full access (GET, POST, PUT, PATCH, DELETE)
    - Creators: read-only only (or possibly more if needed, but currently read-only)
    - Viewers: read-only only (GET only, no POST)
    """
    message = "You do not have permission to modify this. Read-only access for your role."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Creators (and Admins) can access all methods
        if request.user.role in ['admin', 'creator']:
            return True
        
        # Viewers can only use safe methods (GET, HEAD, OPTIONS)
        if request.user.role == 'viewer':
            return request.method in permissions.SAFE_METHODS
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Admins and Creators have full object access
        if request.user.role in ['admin', 'creator']:
            return True
        
        # Viewers can only read objects in this strict permission
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return False