from rest_framework import viewsets
from .models import Request
from .serializers import RequestSerializer
from rest_framework.permissions import IsAuthenticated


class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)
