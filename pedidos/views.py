from rest_framework.viewsets import ModelViewSet
from .models import Pedido
from .serializers import PedidoSerializer

class PedidoViewSet(ModelViewSet):
    queryset = Pedido.objects.select_related("mesa", "plato").all()
    serializer_class = PedidoSerializer
