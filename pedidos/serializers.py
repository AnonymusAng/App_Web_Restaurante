from rest_framework import serializers
from .models import Pedido

class PedidoSerializer(serializers.ModelSerializer):
    mesa_numero = serializers.IntegerField(source="mesa.numero", read_only=True)
    plato_nombre = serializers.CharField(source="plato.nombre", read_only=True)
    precio_unitario = serializers.DecimalField(source="plato.precio", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Pedido
        fields = ["id", "mesa", "mesa_numero", "plato", "plato_nombre", "precio_unitario", "cantidad", "estado", "notas", "creado_en"]
        read_only_fields = ["id", "creado_en"]
