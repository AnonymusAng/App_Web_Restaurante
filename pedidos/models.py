from django.core.validators import MinValueValidator
from django.db import models
from mesas.models import Mesa
from platos.models import Plato

class Pedido(models.Model):
    class Estado(models.TextChoices):
        RECIBIDO = "recibido", "Recibido"
        PREPARACION = "preparacion", "En preparación"
        LISTO = "listo", "Listo"
        ENTREGADO = "entregado", "Entregado"
        CANCELADO = "cancelado", "Cancelado"

    mesa = models.ForeignKey(Mesa, on_delete=models.PROTECT, related_name="pedidos")
    plato = models.ForeignKey(Plato, on_delete=models.PROTECT, related_name="pedidos")
    cantidad = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.RECIBIDO)
    notas = models.CharField(max_length=250, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-creado_en"]

    def __str__(self):
        return f"Pedido #{self.pk} - Mesa {self.mesa.numero}"
