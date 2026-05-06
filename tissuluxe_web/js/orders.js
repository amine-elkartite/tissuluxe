(() => {
  const { apiGet, apiPost, money, asset, qs, notify } = window.TLX;

  const statusLabel = {
    pending: "En attente",
    confirmed: "Confirmée",
    processing: "Préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée"
  };

  const orderLink = (order) => `details-commande.html?order=${encodeURIComponent(order.order_number)}`;

  const orderRow = (order) => `
    <a class="order-row" href="${orderLink(order)}">
      <strong>${order.order_number}</strong>
      <span>${statusLabel[order.status] || order.status}</span>
      <span>${money(order.total)}</span>
    </a>`;

  const timeline = (order) => `
    <div class="timeline">
      ${(order.timeline || []).map((step) => `<div class="${step.done ? "done" : ""}"><span></span>${step.label}</div>`).join("")}
    </div>`;

  const orderItems = (items = []) => `
    <div class="cart-lines">
      ${items.map((item) => `
        <article class="cart-line">
          <img src="${asset(item.product_image)}" alt="${item.product_name}">
          <div><h3>${item.product_name}</h3><small>${item.quantity} m</small><strong>${money(item.price)}</strong></div>
          <strong>${money(item.total)}</strong>
        </article>`).join("")}
    </div>`;

  const loadMyOrders = async () => {
    const root = qs("[data-my-orders]");
    if (!root) return;
    try {
      const orders = await apiGet("/orders/my-orders");
      root.innerHTML = orders.map(orderRow).join("") || '<div class="empty-state">Aucune commande pour le moment.</div>';
    } catch (err) {
      root.innerHTML = `<div class="empty-state">${err.message}. Connectez-vous pour voir vos commandes.</div>`;
    }
  };

  const renderOrder = (root, order, mode = "detail") => {
    root.innerHTML = `
      <section class="panel">
        <p class="eyebrow">Commande ${order.order_number}</p>
        <h2>${statusLabel[order.status] || order.status}</h2>
        <p>Total <strong>${money(order.total)}</strong> · ${order.city || ""} ${order.tracking_number ? `· Suivi ${order.tracking_number}` : ""}</p>
        ${timeline(order)}
      </section>
      <section class="panel"><h2>Articles commandés</h2>${orderItems(order.items)}</section>
      <section class="summary">
        <h2>Résumé</h2>
        <p><span>Sous-total</span><strong>${money(order.subtotal)}</strong></p>
        <p><span>Livraison</span><strong>${money(order.delivery_fee)}</strong></p>
        <p><span>Réduction</span><strong>${money(order.discount)}</strong></p>
        <p class="summary-total"><span>Total</span><strong>${money(order.total)}</strong></p>
        ${mode === "confirmation" ? `<a class="btn btn-primary full" href="suivi-commande.html?order=${order.order_number}">Suivre la commande</a>` : ""}
      </section>`;
  };

  const loadOrderDetail = async () => {
    const root = qs("[data-order-detail]");
    if (!root) return;
    const orderNumber = new URLSearchParams(location.search).get("order") || "TLX-2026-100001";
    try {
      renderOrder(root, await apiGet(`/orders/${encodeURIComponent(orderNumber)}`));
    } catch (err) {
      root.innerHTML = `<div class="empty-state">${err.message}</div>`;
    }
  };

  const loadConfirmation = async () => {
    const root = qs("[data-confirmation]");
    if (!root) return;
    const orderNumber = new URLSearchParams(location.search).get("order");
    if (!orderNumber) {
      root.innerHTML = '<div class="empty-state">Aucune commande à confirmer.</div>';
      return;
    }
    try {
      renderOrder(root, await apiGet(`/orders/track/${encodeURIComponent(orderNumber)}`), "confirmation");
    } catch (err) {
      root.innerHTML = `<div class="empty-state">${err.message}</div>`;
    }
  };

  const track = async (orderNumber) => {
    const root = qs("[data-order-track]");
    if (!root || !orderNumber) return;
    try {
      renderOrder(root, await apiGet(`/orders/track/${encodeURIComponent(orderNumber)}`));
    } catch (err) {
      root.innerHTML = `<div class="empty-state">${err.message}</div>`;
    }
  };

  document.addEventListener("submit", async (event) => {
    const tracking = event.target.closest("[data-track-form]");
    const contact = event.target.closest("[data-contact-form]");
    if (!tracking && !contact) return;
    event.preventDefault();
    const form = tracking || contact;
    const submit = form.querySelector("button[type='submit'], button:not([type])");
    try {
      if (submit) {
        submit.disabled = true;
        submit.dataset.originalText = submit.textContent;
        submit.textContent = "Veuillez patienter...";
      }
      if (tracking) {
        const number = new FormData(tracking).get("order");
        history.replaceState(null, "", `?order=${encodeURIComponent(number)}`);
        await track(number);
      }
      if (contact) {
        await apiPost("/contact", Object.fromEntries(new FormData(contact).entries()));
        contact.reset();
        notify("Message envoyé");
      }
    } catch (err) {
      notify(err.message, "error");
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = submit.dataset.originalText || "Réessayer";
      }
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    loadMyOrders();
    loadOrderDetail();
    loadConfirmation();
    const order = new URLSearchParams(location.search).get("order");
    if (qs("[data-order-track]")) track(order || "TLX-2026-100001");
  });
})();
