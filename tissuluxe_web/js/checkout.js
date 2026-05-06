(() => {
  const { apiGet, apiPost, money, qs, notify, getUser } = window.TLX;
  const checkoutKey = "tlx_checkout";

  const readCheckout = () => {
    try {
      return JSON.parse(localStorage.getItem(checkoutKey) || "null");
    } catch (_err) {
      localStorage.removeItem(checkoutKey);
      return null;
    }
  };
  const writeCheckout = (data) => localStorage.setItem(checkoutKey, JSON.stringify(data));

  const renderSummary = async () => {
    const root = qs("[data-checkout-summary]");
    if (!root) return null;
    const cart = await apiGet("/cart");
    const saved = readCheckout() || {};
    const discount = Number(saved.discount || 0);
    const total = Math.max(Number(cart.total || 0) - discount, 0);
    root.innerHTML = `
      ${(cart.items || []).map((item) => `<p><span>${item.product.name} × ${item.quantity}</span><strong>${money(item.product.price * item.quantity)}</strong></p>`).join("") || "<p>Panier vide</p>"}
      <p><span>Sous-total</span><strong>${money(cart.subtotal)}</strong></p>
      <p><span>Livraison</span><strong>${money(cart.delivery_fee)}</strong></p>
      <p><span>Réduction</span><strong>${money(discount)}</strong></p>
      <p class="summary-total"><span>Total</span><strong>${money(total)}</strong></p>`;
    return cart;
  };

  const hydrateCheckoutForm = () => {
    const form = qs("[data-checkout-form]");
    if (!form) return;
    const user = getUser();
    const saved = readCheckout() || {};
    const names = ["customer_name", "email", "phone", "address", "city", "postal_code", "country", "delivery_method", "payment_method"];
    names.forEach((name) => {
      if (saved[name] && form.elements[name]) form.elements[name].value = saved[name];
    });
    if (user) {
      if (form.elements.customer_name && !form.elements.customer_name.value) form.elements.customer_name.value = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      if (form.elements.email && !form.elements.email.value) form.elements.email.value = user.email || "";
      if (form.elements.phone && !form.elements.phone.value) form.elements.phone.value = user.phone || "";
    }
  };

  const loadPayment = async () => {
    const root = qs("[data-payment]");
    if (!root) return;
    const saved = readCheckout();
    if (!saved) {
      root.innerHTML = '<div class="empty-state">Complétez d’abord vos informations de livraison.</div>';
      return;
    }
    const cart = await apiGet("/cart");
    root.innerHTML = `
      <section class="panel">
        <p class="eyebrow">Paiement sécurisé</p>
        <h2>${saved.payment_method === "card" ? "Carte bancaire" : "Paiement à la livraison"}</h2>
        <p>${saved.customer_name} · ${saved.city} · ${saved.delivery_method || "standard"}</p>
        <button class="btn btn-primary" type="button" data-confirm-payment>Confirmer la commande</button>
      </section>
      <aside class="summary">
        <h2>Total</h2>
        <p><span>Panier</span><strong>${money(cart.subtotal)}</strong></p>
        <p><span>Livraison</span><strong>${money(cart.delivery_fee)}</strong></p>
        <p><span>Réduction</span><strong>${money(saved.discount || 0)}</strong></p>
        <p class="summary-total"><span>À payer</span><strong>${money(Math.max(cart.total - Number(saved.discount || 0), 0))}</strong></p>
      </aside>`;
  };

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-checkout-form]");
    const coupon = event.target.closest("[data-coupon-form]");
    if (!form && !coupon) return;
    event.preventDefault();
    const submit = (form || coupon).querySelector("button[type='submit']");
    try {
      if (submit) {
        submit.disabled = true;
        submit.dataset.originalText = submit.textContent;
        submit.textContent = "Veuillez patienter...";
      }
      if (coupon) {
        const cart = await apiGet("/cart");
        const code = new FormData(coupon).get("code");
        const result = await apiPost("/coupons/validate", { code, subtotal: cart.subtotal });
        writeCheckout({ ...(readCheckout() || {}), coupon_code: code, discount: result.discount });
        notify("Coupon appliqué");
        renderSummary();
      }
      if (form) {
        const data = Object.fromEntries(new FormData(form).entries());
        writeCheckout({ ...(readCheckout() || {}), ...data });
        location.href = "paiement.html";
      }
    } catch (err) {
      notify(err.message, "error");
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = submit.dataset.originalText || "Appliquer";
      }
    }
  });

  document.addEventListener("click", async (event) => {
    const confirm = event.target.closest("[data-confirm-payment]");
    if (!confirm) return;
    try {
      confirm.disabled = true;
      confirm.textContent = "Confirmation...";
      const order = await apiPost("/orders", readCheckout() || {});
      localStorage.removeItem(checkoutKey);
      location.href = `confirmation.html?order=${encodeURIComponent(order.order_number)}`;
    } catch (err) {
      confirm.disabled = false;
      confirm.textContent = "Confirmer la commande";
      notify(err.message, "error");
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    hydrateCheckoutForm();
    renderSummary().catch(() => {});
    loadPayment().catch((err) => notify(err.message, "error"));
  });
})();
