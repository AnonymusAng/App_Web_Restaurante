from django.test import TestCase
from rest_framework.test import APIClient
from platos.models import Plato
from mesas.models import Mesa
from pedidos.models import Pedido

class RestauranteAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.plato = Plato.objects.create(nombre="Trucha", precio="25000.00")
        self.mesa = Mesa.objects.create(numero=1, capacidad=4)

    def test_router_y_pagina_del_frontend_responden(self):
        self.assertEqual(self.client.get("/api/").status_code, 200)
        self.assertEqual(self.client.get("/").status_code, 200)

    def test_get_y_post_en_los_tres_recursos(self):
        for url in ("/api/platos/", "/api/mesas/", "/api/pedidos/"):
            self.assertEqual(self.client.get(url).status_code, 200)

        plato_response = self.client.post("/api/platos/", {"nombre":"Sopa", "descripcion":"Del día", "precio":"12000.00", "disponible":True}, format="json")
        self.assertEqual(plato_response.status_code, 201, plato_response.data)
        mesa_response = self.client.post("/api/mesas/", {"numero":2, "capacidad":2, "ubicacion":"Terraza", "estado":"disponible"}, format="json")
        self.assertEqual(mesa_response.status_code, 201, mesa_response.data)
        pedido_response = self.client.post("/api/pedidos/", {"mesa":mesa_response.data["id"], "plato":plato_response.data["id"], "cantidad":2, "estado":"recibido", "notas":"Sin cebolla"}, format="json")
        self.assertEqual(pedido_response.status_code, 201, pedido_response.data)
        self.assertEqual(pedido_response.data["mesa_numero"], 2)
        self.assertEqual(pedido_response.data["plato_nombre"], "Sopa")

    def test_put_y_delete_de_pedido(self):
        pedido = Pedido.objects.create(mesa=self.mesa, plato=self.plato)
        update = self.client.put(f"/api/pedidos/{pedido.id}/", {"mesa":self.mesa.id, "plato":self.plato.id, "cantidad":3, "estado":"listo", "notas":""}, format="json")
        self.assertEqual(update.status_code, 200, update.data)
        self.assertEqual(update.data["estado"], "listo")
        self.assertEqual(self.client.delete(f"/api/pedidos/{pedido.id}/").status_code, 204)
        self.assertFalse(Pedido.objects.filter(pk=pedido.id).exists())

    def test_protege_borrado_de_registros_referenciados(self):
        Pedido.objects.create(mesa=self.mesa, plato=self.plato)
        response = self.client.delete(f"/api/platos/{self.plato.id}/")
        self.assertEqual(response.status_code, 409, response.data)
        self.assertTrue(Plato.objects.filter(pk=self.plato.id).exists())
