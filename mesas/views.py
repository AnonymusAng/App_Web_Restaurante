from django.db.models.deletion import ProtectedError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import Mesa
from .serializers import MesaSerializer

class MesaViewSet(ModelViewSet):
    queryset = Mesa.objects.all()
    serializer_class = MesaSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar porque existen pedidos relacionados."},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
