from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from datetime import datetime
from django.db import transaction
import csv

from ..models import Letter, LetterStatus
from ..serializers import LetterSerializer
from ..permissions import IsViewerOrAdminWithCreateForLetters

class LetterViewSet(viewsets.ModelViewSet):
    queryset = Letter.objects.all().order_by("-created_at")
    serializer_class = LetterSerializer
    permission_classes = [IsViewerOrAdminWithCreateForLetters]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status"]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Prefetch related items for better performance
        return queryset.prefetch_related('items')
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create a new letter with items"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        letter = serializer.save()
        
        return Response({
            "status": "success",
            "message": "Letter created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        """Get list of letters with proper response"""
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "status": "success",
                "message": "Letters retrieved successfully",
                "data": serializer.data
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "message": "Letters retrieved successfully",
            "data": serializer.data
        })

    def retrieve(self, request, *args, **kwargs):
        """Get single letter details"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "status": "success",
            "message": "Letter retrieved successfully",
            "data": serializer.data
        })

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Update a letter with items"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        letter = serializer.save()

        return Response({
            "status": "success",
            "message": "Letter updated successfully",
            "data": serializer.data
        })

    def partial_update(self, request, *args, **kwargs):
        """Partially update a letter"""
        return self.update(request, *args, partial=True, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Move letter to bin (soft delete)"""
        instance = self.get_object()
        letter_subject = instance.subject or f"Letter {instance.id}"
        instance.status = LetterStatus.BIN
        instance.save(update_fields=["status", "updated_at"])
        
        return Response({
            "status": "success",
            "message": f"Letter '{letter_subject}' has been moved to bin",
            "id": instance.id
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export letters to CSV"""
        queryset = self.filter_queryset(self.get_queryset())
        
        if not queryset.exists():
            return Response({
                "status": "error",
                "message": "No letters found to export"
            }, status=status.HTTP_404_NOT_FOUND)

        # Change this line to use utf-8-sig encoding
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
        response['Content-Disposition'] = f'attachment; filename="letters_export_{timestamp}.csv"'
        
        writer = csv.writer(response)
        
        # Write headers
        writer.writerow([
            'S.N.', 'ID', 'Letter Count', 'Chalani No', 'Voucher No', 'Date', 
            'Subject', 'Receiver Office', 'Receiver Address', 'Status', 
            'Created At', 'Updated At'
        ])
        
        for index, letter in enumerate(queryset, start=1):
            writer.writerow([
                index, 
                letter.id, 
                letter.letter_count,
                letter.chalani_no or 'N/A',
                letter.voucher_no or 'N/A',
                letter.date,
                letter.subject,
                letter.receiver_office_name,
                letter.receiver_address,
                letter.get_status_display(),
                letter.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                letter.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        """Mark letter as sent"""
        instance = self.get_object()
        
        if instance.status == LetterStatus.SENT:
            letter_subject = instance.subject or f"Letter {instance.id}"
            return Response({
                "status": "error",
                "message": f"Letter '{letter_subject}' is already sent"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = LetterStatus.SENT
        instance.save(update_fields=["status", "updated_at"])
        
        letter_subject = instance.subject or f"Letter {instance.id}"
        return Response({
            "status": "success",
            "message": f"Letter '{letter_subject}' has been marked as sent",
            "data": LetterSerializer(instance).data
        })

    @action(detail=True, methods=['post'])
    def draft(self, request, pk=None):
        """Mark letter as draft"""
        instance = self.get_object()
        
        if instance.status == LetterStatus.DRAFT:
            letter_subject = instance.subject or f"Letter {instance.id}"
            return Response({
                "status": "error",
                "message": f"Letter '{letter_subject}' is already in draft"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = LetterStatus.DRAFT
        instance.save(update_fields=["status", "updated_at"])
        
        letter_subject = instance.subject or f"Letter {instance.id}"
        return Response({
            "status": "success",
            "message": f"Letter '{letter_subject}' has been marked as draft",
            "data": LetterSerializer(instance).data
        })

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore letter from bin"""
        instance = self.get_object()
        
        if instance.status != LetterStatus.BIN:
            letter_subject = instance.subject or f"Letter {instance.id}"
            return Response({
                "status": "error",
                "message": f"Letter '{letter_subject}' is not in bin"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.status = LetterStatus.DRAFT
        instance.save(update_fields=["status", "updated_at"])
        
        letter_subject = instance.subject or f"Letter {instance.id}"
        return Response({
            "status": "success",
            "message": f"Letter '{letter_subject}' has been restored from bin",
            "data": LetterSerializer(instance).data
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get letter statistics"""
        total_letters = Letter.objects.count()
        draft_letters = Letter.objects.filter(status=LetterStatus.DRAFT).count()
        sent_letters = Letter.objects.filter(status=LetterStatus.SENT).count()
        bin_letters = Letter.objects.filter(status=LetterStatus.BIN).count()
        
        return Response({
            "status": "success",
            "message": "Letter statistics retrieved successfully",
            "data": {
                "total_letters": total_letters,
                "draft_letters": draft_letters,
                "sent_letters": sent_letters,
                "bin_letters": bin_letters
            }
        })