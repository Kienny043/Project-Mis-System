from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MaintenanceRequest
from .serializers import (
    MaintenanceRequestSerializer,
    ClaimRequestSerializer,
    CompleteRequestSerializer,
)


# Anyone can submit
class CreateRequestView(generics.CreateAPIView):
    queryset = MaintenanceRequest.objects.all()
    serializer_class = MaintenanceRequestSerializer


# Staff + admin can see all
class ListRequestsView(generics.ListAPIView):
    queryset = MaintenanceRequest.objects.all().order_by("-created_at")
    serializer_class = MaintenanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]


# Staff claims a request
class ClaimRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        maintenance = MaintenanceRequest.objects.get(id=pk)
        if maintenance.assigned_to is not None:
            return Response({"error": "Already taken"}, status=400)

        maintenance.assigned_to = request.user
        maintenance.status = "in_progress"
        maintenance.save()
        return Response({"message": "Request claimed successfully"})


# Staff completes the task
class CompleteRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        maintenance = MaintenanceRequest.objects.get(id=pk)
        serializer = CompleteRequestSerializer(
            maintenance, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save(status="completed")
            return Response({"message": "Request completed"})
        return Response(serializer.errors, status=400)
