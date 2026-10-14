from rest_framework import serializers
from .models import Plato

class PlatoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plato
        fields = ["id", "nombre", "descripcion", "precio", "disponible", "creado_en"]
        read_only_fields = ["id", "creado_en"]
