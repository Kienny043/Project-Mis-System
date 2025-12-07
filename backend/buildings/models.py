# locations/models.py

from django.db import models
from django.core.exceptions import ValidationError


class Building(models.Model):
    """
    Represents a building in the campus
    Examples: Annex Building, New Building, DFA Building, Grounds
    """
    name = models.CharField(max_length=100, unique=True)
    has_floors = models.BooleanField(
        default=True,
        help_text="Whether this building has multiple floors (e.g., Annex/NB) or is ground-level only (e.g., DFA/Grounds)"
    )
    total_floors = models.PositiveIntegerField(
        default=0,
        help_text="Total number of floors in this building"
    )
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Building'
        verbose_name_plural = 'Buildings'


class Floor(models.Model):
    """
    Represents a floor within a building
    Relationship: Building → Floor (One-to-Many)
    A floor cannot exist without a building
    """
    building = models.ForeignKey(
        Building, 
        on_delete=models.CASCADE,  # Delete floor if building is deleted
        related_name="floors",
        help_text="The building this floor belongs to"
    )
    number = models.PositiveIntegerField(
        help_text="Floor number (e.g., 1, 2, 3, 4)"
    )
    label = models.CharField(
        max_length=50,
        help_text="Human-readable label (e.g., 'Ground Floor', '2nd Floor', 'Rooftop')"
    )
    
    def __str__(self):
        return f"{self.building.name} – {self.label}"
    
    class Meta:
        ordering = ['building', 'number']
        unique_together = ['building', 'number']  # Prevent duplicate floor numbers in same building
        verbose_name = 'Floor'
        verbose_name_plural = 'Floors'
    
    def clean(self):
        """Validate that the building has floors enabled"""
        if not self.building.has_floors:
            raise ValidationError(
                f"Cannot create floor for '{self.building.name}' - this building doesn't have floors enabled"
            )


class Room(models.Model):
    """
    Represents a room within a building/floor
    Relationship: Floor → Room (One-to-Many)
    A room belongs to exactly one floor
    """
    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name="rooms",
        help_text="The building this room is located in"
    )
    floor = models.ForeignKey(
        Floor,
        on_delete=models.CASCADE,
        related_name="rooms",
        null=True,
        blank=True,
        help_text="The floor this room is on (optional for ground-level buildings)"
    )
    name = models.CharField(
        max_length=100,
        help_text="Room identifier (e.g., 'Room A4', 'Laboratory 1', 'Office 203')"
    )
    room_type = models.CharField(
        max_length=50,
        choices=[
            ('classroom', 'Classroom'),
            ('laboratory', 'Laboratory'),
            ('office', 'Office'),
            ('restroom', 'Restroom'),
            ('storage', 'Storage'),
            ('utility', 'Utility'),
            ('other', 'Other'),
        ],
        default='other',
        blank=True
    )
    
    def __str__(self):
        if self.floor:
            return f"{self.building.name} – {self.floor.label} – {self.name}"
        return f"{self.building.name} – {self.name}"
    
    class Meta:
        ordering = ['building', 'floor__number', 'name']
        unique_together = ['building', 'floor', 'name']  # Prevent duplicate room names on same floor
        verbose_name = 'Room'
        verbose_name_plural = 'Rooms'
    
    def clean(self):
        """Validate room-floor-building relationships"""
        # If floor is specified, ensure it matches the building
        if self.floor and self.floor.building != self.building:
            raise ValidationError(
                f"Room's building ('{self.building.name}') must match the floor's building ('{self.floor.building.name}')"
            )
        
        # If building requires floors, ensure floor is specified
        if self.building.has_floors and not self.floor:
            raise ValidationError(
                f"'{self.building.name}' requires a floor to be specified for rooms"
            )
        
        # If building doesn't have floors, ensure floor is NOT specified
        if not self.building.has_floors and self.floor:
            raise ValidationError(
                f"'{self.building.name}' doesn't have floors - room should not have a floor assigned"
            )
    
    def save(self, *args, **kwargs):
        # Run validation before saving
        self.clean()
        super().save(*args, **kwargs)