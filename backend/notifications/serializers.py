from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    request_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 
            'message', 
            'maintenance_request', 
            'request_details', 
            'is_read', 
            'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_request_details(self, obj):
        """Return maintenance request details if available - FIX THE ROOM SERIALIZATION"""
        if obj.maintenance_request:
            request = obj.maintenance_request
            
            # Safely get room - convert to string or get the room number/name
            room_value = None
            if request.room:
                # If room is a ForeignKey to Room model, get its name/number
                if hasattr(request.room, 'name'):
                    room_value = request.room.name
                elif hasattr(request.room, 'room_number'):
                    room_value = request.room.room_number
                else:
                    # If it's just a CharField, use it directly
                    room_value = str(request.room)
            
            return {
                'id': request.id,
                'request_type': request.description[:50] if request.description else 'N/A',
                'status': request.status,
                'building': request.building.name if request.building else None,
                'room': room_value,  # Now properly serialized as string
            }
        return None
    

class NotificationSerializerAlternative(serializers.ModelSerializer):
    request_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 
            'message', 
            'maintenance_request', 
            'request_details', 
            'is_read', 
            'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_request_details(self, obj):
        """Return maintenance request details - SAFER APPROACH"""
        if not obj.maintenance_request:
            return None
        
        request = obj.maintenance_request
        
        try:
            # Build response safely
            details = {
                'id': request.id,
                'request_type': request.description[:50] if request.description else 'N/A',
                'status': request.status,
            }
            
            # Safely add building
            if request.building:
                details['building'] = request.building.name
            else:
                details['building'] = None
            
            # Safely add room - handle both ForeignKey and CharField
            if request.room:
                try:
                    # Try to get room as object
                    details['room'] = str(request.room)
                except Exception:
                    details['room'] = None
            else:
                details['room'] = None
            
            return details
            
        except Exception as e:
            # If anything fails, return minimal info
            print(f"Error serializing notification request details: {e}")
            return {
                'id': request.id,
                'request_type': 'Error loading details',
                'status': request.status,
            }