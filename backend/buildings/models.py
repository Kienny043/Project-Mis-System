from django.db import models


class Building(models.Model):
    name = models.CharField(max_length=100)
    has_floors = models.BooleanField(
        default=True
    )  # Annex/NB have floors, DFA/Grounds don’t
    total_floors = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


class Floor(models.Model):
    building = models.ForeignKey(
        Building, on_delete=models.CASCADE, related_name="floors"
    )
    number = models.PositiveIntegerField()  # 1,2,3,4 etc.
    label = models.CharField(max_length=50)  # "Ground Floor", "2nd Floor"

    def __str__(self):
        return f"{self.building.name} – {self.label}"


class Room(models.Model):
    floor = models.ForeignKey(
        Floor, on_delete=models.CASCADE, related_name="rooms", null=True, blank=True
    )
    building = models.ForeignKey(
        Building, on_delete=models.CASCADE, related_name="rooms"
    )
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.building.name} – {self.name}"
