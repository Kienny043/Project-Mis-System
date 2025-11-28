from rest_framework import generics
from .serializers import RegisterSerializer, UserSerializer
from .models import User


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
