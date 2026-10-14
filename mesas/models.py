from django.core.validators import MinValueValidator
from django.db import models

class Mesa(models.Model):
    class Estado(models.TextChoices):
        DISPONIBLE = "disponible", "Disponible"
        OCUPADA = "ocupada", "Ocupada"
        MANTENIMIENTO = "mantenimiento", "Mantenimiento"

    numero = models.PositiveIntegerField(unique=True, validators=[MinValueValidator(1)])
    capacidad = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    ubicacion = models.CharField(max_length=80, blank=True)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.DISPONIBLE)

    class Meta:
        ordering = ["numero"]

    def __str__(self):
        return f"Mesa {self.numero}"
