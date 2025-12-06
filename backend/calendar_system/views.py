from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MaintenanceSchedule
from .serializers import MaintenanceScheduleSerializer
from maintenance.models import MaintenanceRequest


class SetScheduleView(APIView):
    """Create or update a schedule for a maintenance request"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Get the maintenance request
        try:
            maintenance_request = MaintenanceRequest.objects.get(id=pk)
        except MaintenanceRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)

        # Extract data
        schedule_date = request.data.get("schedule_date")
        estimated_duration = request.data.get("estimated_duration", "")
        assigned_staff_id = request.data.get("assigned_staff")

        if not schedule_date:
            return Response({"error": "schedule_date is required"}, status=400)

        # Check if schedule already exists
        schedule, created = MaintenanceSchedule.objects.update_or_create(
            request=maintenance_request,
            defaults={
                "schedule_date": schedule_date,
                "estimated_duration": estimated_duration,
                "assigned_staff_id": assigned_staff_id if assigned_staff_id else None,
            }
        )

        serializer = MaintenanceScheduleSerializer(schedule)
        return Response(
            {
                **serializer.data,
                "created": created,
                "message": "Schedule created successfully" if created else "Schedule updated successfully",
            },
            status=201 if created else 200,
        )


class CalendarMonthView(APIView):
    """Get all schedules for a specific month"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        year = request.query_params.get("year")
        month = request.query_params.get("month")

        if not year or not month:
            return Response({"error": "year and month required"}, status=400)

        # Fetch schedules with related data
        schedules = MaintenanceSchedule.objects.filter(
            schedule_date__year=year, 
            schedule_date__month=month
        ).select_related("request", "assigned_staff", "request__building")

        serializer = MaintenanceScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

