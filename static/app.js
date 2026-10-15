const API = { platos: "/api/platos/", mesas: "/api/mesas/", pedidos: "/api/pedidos/" };
const cache = { platos: [], mesas: [], pedidos: [] };
const $ = (selector, root = document) => root.querySelector(selector);
const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, c => { const map = {"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;"}; return map[c]; });
const money = value => new Intl.NumberFormat("es-CO", {style:"currency", currency:"COP", maximumFractionDigits:0}).format(Number(value));
function notify(message, type = "success") { const box = $("#alerta"); box.textContent = message; box.className = `alert show ${type}`; window.setTimeout(() => box.classList.remove("show"), 4200); }
async function request(url, options = {}) {
  const response = await fetch(url, {headers:{"Content-Type":"application/json", ...(options.headers || {})}, ...options});
  if (!response.ok) { let detail = `Error ${response.status}`; try { const data = await response.json(); detail = Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`).join(" · "); } catch {} throw new Error(detail); }
  return response.status === 204 ? null : response.json();
}
function actions(resource, item) { return `<div class="row-actions"><button type="button" data-action="edit" data-resource="${resource}" data-id="${item.id}">Editar</button><button type="button" class="delete" data-action="delete" data-resource="${resource}" data-id="${item.id}">Borrar</button></div>`; }
function renderPlatos(items) {
  $("#tabla-platos").innerHTML = items.length ? items.map(p => `<tr><td><strong>${escapeHTML(p.nombre)}</strong><br><small>${escapeHTML(p.descripcion)}</small></td><td>${money(p.precio)}</td><td><span class="badge ${p.disponible ? "" : "off"}">${p.disponible ? "Disponible" : "Agotado"}</span></td><td>${actions("platos", p)}</td></tr>`).join("") : '<tr><td colspan="4" class="empty">Aún no hay platos registrados.</td></tr>';
}
function renderMesas(items) {
  $("#tabla-mesas").innerHTML = items.length ? items.map(m => `<tr><td><strong>Mesa ${m.numero}</strong></td><td>${m.capacidad}</td><td>${escapeHTML(m.ubicacion || "-")}<br><span class="badge">${escapeHTML(m.estado)}</span></td><td>${actions("mesas", m)}</td></tr>`).join("") : '<tr><td colspan="4" class="empty">Aún no hay mesas registradas.</td></tr>';
}
function renderPedidos(items) {
  $("#tabla-pedidos").innerHTML = items.length ? items.map(p => `<tr><td>#${p.id}</td><td>Mesa ${p.mesa_numero}</td><td><strong>${escapeHTML(p.plato_nombre)}</strong><br><small>${money(p.precio_unitario)} c/u</small></td><td>${p.cantidad}</td><td><span class="badge ${p.estado === "cancelado" ? "cancelado" : p.estado === "preparacion" ? "preparacion" : ""}">${escapeHTML(p.estado)}</span></td><td>${escapeHTML(p.notas || "-")}</td><td>${actions("pedidos", p)}</td></tr>`).join("") : '<tr><td colspan="7" class="empty">Aún no hay pedidos registrados.</td></tr>';
}
function fillSelects() {
  const mesa = $("#form-pedidos [name=mesa]"); const plato = $("#form-pedidos [name=plato]");
  const mesaValue = mesa.value, platoValue = plato.value;
  mesa.innerHTML = '<option value="">Selecciona una mesa</option>' + cache.mesas.map(m => `<option value="${m.id}">Mesa ${m.numero} · ${escapeHTML(m.estado)}</option>`).join("");
  plato.innerHTML = '<option value="">Selecciona un plato</option>' + cache.platos.filter(p => p.disponible).map(p => `<option value="${p.id}">${escapeHTML(p.nombre)} · ${money(p.precio)}</option>`).join("");
  if (mesaValue) mesa.value = mesaValue; if (platoValue) plato.value = platoValue;
}
function updateSummary() {
  $("#total-platos").textContent = cache.platos.filter(p => p.disponible).length;
  $("#total-mesas").textContent = cache.mesas.length;
  $("#total-pedidos").textContent = cache.pedidos.filter(p => !["entregado", "cancelado"].includes(p.estado)).length;
  for (const key of Object.keys(cache)) { $(`#count-${key}`).textContent = cache[key].length; }
}
async function loadAll() {
  try {
    const [platos, mesas, pedidos] = await Promise.all(Object.keys(API).map(key => request(API[key])));
    cache.platos = platos; cache.mesas = mesas; cache.pedidos = pedidos;
    renderPlatos(platos); renderMesas(mesas); renderPedidos(pedidos); fillSelects(); updateSummary();
  } catch (error) { notify(`No fue posible cargar la API. Verifica que Django esté activo. ${error.message}`, "error"); }
}
function formObject(form, resource) {
  const data = new FormData(form); const payload = {};
  for (const [key, value] of data.entries()) { if (key !== "id") payload[key] = value; }
  if (resource === "platos") payload.disponible = form.elements.disponible.checked;
  if (["cantidad", "mesa", "plato", "numero", "capacidad"].some(k => k in payload)) for (const k of ["cantidad", "mesa", "plato", "numero", "capacidad"]) if (k in payload) payload[k] = Number(payload[k]);
  return payload;
}
function resetForm(form) { form.reset(); form.elements.id.value = ""; const cancel = $(".cancel-edit", form); cancel.hidden = true; $("button[type=submit]", form).textContent = `Guardar ${form.id.replace("form-", "").slice(0,-1)}`; if (form.id === "form-pedidos") form.elements.cantidad.value = 1; }
for (const resource of Object.keys(API)) {
  const form = $(`#form-${resource}`);
  form.addEventListener("submit", async event => {
    event.preventDefault(); const id = form.elements.id.value; const url = id ? `${API[resource]}${id}/` : API[resource];
    try { await request(url, {method:id ? "PUT" : "POST", body:JSON.stringify(formObject(form, resource))}); resetForm(form); await loadAll(); notify(id ? "Registro actualizado." : "Registro creado y visible en la tabla."); }
    catch (error) { notify(`No se pudo guardar: ${error.message}`, "error"); }
  });
  $(".cancel-edit", form).addEventListener("click", () => resetForm(form));
}
document.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]"); if (!button) return;
  const {action, resource, id} = button.dataset; const item = cache[resource].find(record => String(record.id) === id); if (!item) return;
  if (action === "delete") {
    if (!window.confirm("¿Eliminar este registro?")) return;
    try { await request(`${API[resource]}${id}/`, {method:"DELETE"}); await loadAll(); notify("Registro eliminado."); }
    catch (error) { notify(`No se puede eliminar: ${error.message}. Revisa si existen pedidos relacionados.`, "error"); }
    return;
  }
  const form = $(`#form-${resource}`);
  if (resource === "pedidos") fillSelects();
  for (const [key, value] of Object.entries(item)) if (form.elements[key]) form.elements[key].value = value ?? "";
  if (resource === "platos") form.elements.disponible.checked = item.disponible;
  form.elements.id.value = item.id; $(".cancel-edit", form).hidden = false; $("button[type=submit]", form).textContent = "Actualizar";
  form.scrollIntoView({behavior:"smooth", block:"center"});
});
document.addEventListener("DOMContentLoaded", loadAll);
