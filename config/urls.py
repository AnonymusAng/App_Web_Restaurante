from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from platos.views import PlatoViewSet
from mesas.views import MesaViewSet
from pedidos.views import PedidoViewSet

router = DefaultRouter()
router.register("platos", PlatoViewSet, basename="plato")
router.register("mesas", MesaViewSet, basename="mesa")
router.register("pedidos", PedidoViewSet, basename="pedido")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("", TemplateView.as_view(template_name="index.html"), name="inicio"),
]
