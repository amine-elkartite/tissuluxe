const ADMIN_API = "http://localhost:3000/api";
const adminTokenKey = "tlx_admin_token";
const adminUserKey = "tlx_admin_user";

const $ = (s, r = document) => r.querySelector(s);
const money = (v) => `${Number(v || 0).toFixed(2)} MAD`;
const notify = (message) => {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = message; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2500);
};
async function api(path, options = {}) {
  const token = localStorage.getItem(adminTokenKey);
  const res = await fetch(`${ADMIN_API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.success === false) throw new Error(payload.message || "Erreur API");
  return payload.data;
}

function guard() {
  if (location.pathname.endsWith("login.html")) return;
  if (!localStorage.getItem(adminTokenKey)) location.href = "login.html";
}

async function loadDashboard() {
  if (!$("[data-admin-dashboard]")) return;
  const [stats, sales, best, recent, messages] = await Promise.all([
    api("/dashboard/stats"), api("/dashboard/sales"), api("/dashboard/best-products"), api("/dashboard/recent-orders"), api("/contact").catch(() => [])
  ]);
  $("[data-stats]").innerHTML = [
    ["Clients", stats.customers], ["Produits", stats.products], ["Commandes", stats.orders], ["Revenus", money(stats.revenue)], ["À traiter", stats.pending_orders]
  ].map(([label, value]) => `<div class="card"><span>${label}</span><strong>${value}</strong></div>`).join("");
  $("[data-sales]").innerHTML = sales.map((s) => `<p><span>${new Date(s.day).toLocaleDateString("fr-FR")}</span><strong>${money(s.total)}</strong></p>`).join("") || "<p>Aucune vente récente.</p>";
  $("[data-best]").innerHTML = best.map((p) => `<p><span>${p.product_name}</span><strong>${p.quantity} ventes</strong></p>`).join("") || "<p>Pas encore de données.</p>";
  $("[data-recent-orders]").innerHTML = table(recent, ["order_number", "customer_name", "status", "total"]);
  $("[data-messages]").innerHTML = table(messages.slice(0, 6), ["name", "subject", "status"]);
}

async function loadProducts() {
  const root = $("[data-admin-products]");
  const categories = await api("/categories").catch(() => []);
  if ($("[data-category-options]")) $("[data-category-options]").innerHTML = categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  if (!root) return;
  const data = await api("/products?limit=60");
  root.innerHTML = table(data.products, ["id", "name", "category_name", "price", "stock"], (p) => `<button class="btn danger" data-delete-product="${p.id}">Désactiver</button>`);
}

async function loadCategories() {
  const root = $("[data-admin-categories]");
  if (!root) return;
  const rows = await api("/categories");
  root.innerHTML = table(rows, ["id", "name", "slug", "status", "product_count"], (c) => `<button class="btn danger" data-delete-category="${c.id}">Désactiver</button>`);
}

async function loadOrders() {
  const root = $("[data-admin-orders]");
  if (!root) return;
  const rows = await api("/admin/orders");
  root.innerHTML = table(rows, ["order_number", "customer_name", "status", "total"], (o) => `<a class="btn secondary" href="order-details.html?order=${o.order_number}">Voir</a> <select data-order-status="${o.id}">${["pending","confirmed","processing","shipped","delivered","cancelled"].map((s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select>`);
}

async function loadUsers() {
  const root = $("[data-admin-users]");
  if (!root) return;
  root.innerHTML = table(await api("/users"), ["id", "first_name", "last_name", "email", "role", "status"], (u) => `<button class="btn ${u.status === "blocked" ? "secondary" : "danger"}" data-user-status="${u.id}" data-status="${u.status === "blocked" ? "active" : "blocked"}">${u.status === "blocked" ? "Débloquer" : "Bloquer"}</button>`);
}

async function loadCoupons() {
  const root = $("[data-admin-coupons]");
  if (!root) return;
  root.innerHTML = table(await api("/coupons"), ["code", "type", "value", "min_order", "used_count", "status"], (c) => `<button class="btn danger" data-delete-coupon="${c.id}">Désactiver</button>`);
}

async function loadMessages() {
  const root = $("[data-admin-messages]");
  if (!root) return;
  root.innerHTML = table(await api("/contact"), ["name", "email", "subject", "status", "created_at"], (m) => `<select data-message-status="${m.id}">${["new","read","replied"].map((s) => `<option ${s === m.status ? "selected" : ""}>${s}</option>`).join("")}</select>`);
}

async function loadOrderDetail() {
  const root = $("[data-admin-order-detail]");
  if (!root) return;
  const orderNumber = new URLSearchParams(location.search).get("order");
  if (!orderNumber) { root.innerHTML = "<div class='card'>Numéro de commande manquant.</div>"; return; }
  const order = await api(`/orders/${orderNumber}`);
  root.innerHTML = `<section class="panel"><h2>${order.order_number}</h2><p>${order.customer_name} · ${order.email} · ${money(order.total)}</p><select data-order-status="${order.id}">${["pending","confirmed","processing","shipped","delivered","cancelled"].map((s) => `<option ${s === order.status ? "selected" : ""}>${s}</option>`).join("")}</select></section>${table(order.items, ["product_name", "quantity", "price", "total"])}`;
}

function table(rows, columns, actions) {
  if (!rows || !rows.length) return "<div class='card'>Aucune donnée.</div>";
  return `<table><thead><tr>${columns.map((c) => `<th>${c}</th>`).join("")}${actions ? "<th>Actions</th>" : ""}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((c) => `<td>${c.includes("total") || c === "price" ? money(row[c]) : row[c] ?? ""}</td>`).join("")}${actions ? `<td>${actions(row)}</td>` : ""}</tr>`).join("")}</tbody></table>`;
}

document.addEventListener("submit", async (e) => {
  const login = e.target.closest("[data-admin-login]");
  const product = e.target.closest("[data-product-form]");
  const category = e.target.closest("[data-category-form]");
  const coupon = e.target.closest("[data-coupon-form]");
  if (!login && !product && !category && !coupon) return;
  e.preventDefault();
  try {
    if (login) {
      const data = Object.fromEntries(new FormData(login).entries());
      const result = await api("/auth/login", { method: "POST", body: JSON.stringify(data) });
      if (result.user.role !== "admin") throw new Error("Compte administrateur requis");
      localStorage.setItem(adminTokenKey, result.token); localStorage.setItem(adminUserKey, JSON.stringify(result.user));
      location.href = "dashboard.html";
    }
    if (product) {
      await api("/products", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(product).entries())) });
      product.reset(); notify("Produit créé"); location.href = "products.html";
    }
    if (category) {
      await api("/categories", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(category).entries())) });
      category.reset(); notify("Catégorie créée"); loadCategories();
    }
    if (coupon) {
      await api("/coupons", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(coupon).entries())) });
      coupon.reset(); notify("Coupon créé"); loadCoupons();
    }
  } catch (err) { notify(err.message); }
});

document.addEventListener("click", async (e) => {
  if (e.target.closest("[data-admin-logout]")) { localStorage.removeItem(adminTokenKey); localStorage.removeItem(adminUserKey); location.href = "login.html"; }
  const dp = e.target.closest("[data-delete-product]");
  const dc = e.target.closest("[data-delete-category]");
  const dco = e.target.closest("[data-delete-coupon]");
  const us = e.target.closest("[data-user-status]");
  try {
    if (dp) { await api(`/products/${dp.dataset.deleteProduct}`, { method: "DELETE" }); notify("Produit désactivé"); loadProducts(); }
    if (dc) { await api(`/categories/${dc.dataset.deleteCategory}`, { method: "DELETE" }); notify("Catégorie désactivée"); loadCategories(); }
    if (dco) { await api(`/coupons/${dco.dataset.deleteCoupon}`, { method: "DELETE" }); notify("Coupon désactivé"); loadCoupons(); }
    if (us) { await api(`/users/${us.dataset.userStatus}/status`, { method: "PUT", body: JSON.stringify({ status: us.dataset.status }) }); notify("Client mis à jour"); loadUsers(); }
  } catch (err) { notify(err.message); }
});

document.addEventListener("change", async (e) => {
  const status = e.target.closest("[data-order-status]");
  const messageStatus = e.target.closest("[data-message-status]");
  if (!status && !messageStatus) return;
  try {
    if (status) await api(`/orders/${status.dataset.orderStatus}/status`, { method: "PUT", body: JSON.stringify({ status: status.value }) });
    if (messageStatus) await api(`/contact/${messageStatus.dataset.messageStatus}/status`, { method: "PUT", body: JSON.stringify({ status: messageStatus.value }) });
    notify("Statut mis à jour");
  }
  catch (err) { notify(err.message); }
});

document.addEventListener("DOMContentLoaded", () => {
  guard();
  loadDashboard().catch((e) => notify(e.message));
  loadProducts().catch((e) => notify(e.message));
  loadCategories().catch((e) => notify(e.message));
  loadOrders().catch((e) => notify(e.message));
  loadUsers().catch((e) => notify(e.message));
  loadCoupons().catch((e) => notify(e.message));
  loadMessages().catch((e) => notify(e.message));
  loadOrderDetail().catch((e) => notify(e.message));
});
