from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StaffProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StaffProfile
        fields = [
            "id",
            "user",
            "role",
            "contact_number",
            "specialization",
        ]
