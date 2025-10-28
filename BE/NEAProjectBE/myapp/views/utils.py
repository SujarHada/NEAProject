from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response

class SeedDatabaseView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        from .utils import seed_database
        result = seed_database()
        if result['success']:
            return Response({"status": "success", "message": "Database seeded successfully", "output": result['output']}, status=status.HTTP_201_CREATED)
        else:
            return Response({"status": "error", "message": "Failed to seed database", "error": result['error']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)