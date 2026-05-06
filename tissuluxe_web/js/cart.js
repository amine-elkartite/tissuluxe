(() => {
  const { apiGet, apiPost, apiPut, apiDelete, money, asset, qs, notify } = window.TLX;

  const renderCart = async () => {
    const root = qs("[data-cart]");
    const badge = qs("[data-cart-count]");
    try {
      const cart = await apiGet("/cart");
      const count = (cart.items || []).reduce((sum, item) => sum + Number(item.quantity), 0);
      if (badge) badge.textContent = count;
      if (!root) return;
      root.innerHTML = `
        <div class="cart-lines">
          ${(cart.items || []).map((item) => `
            <article class="cart-line">
              <img src="${asset(item.product.main_image)}" alt="${item.product.name}">
              <div><h3>${item.product.name}</h3><small>${item.product.category_name || ""}</small><strong>${money(item.product.price)}</strong></div>
              <input type="number" min="1" value="${item.quantity}" data-cart-qty="${item.id}">
              <button class="btn-icon" type="button" data-cart-remove="${item.id}" title="Supprimer" aria-label="Supprimer ${item.product.name}">×</button>
            </article>`).join("") || '<div class="empty-state">Votre panier est vide.</div>'}
        </div>
        <aside class="summary">
          <h2>Résumé</h2>
          <p><span>Sous-total</span><strong>${money(cart.subtotal)}</strong></p>
          <p><span>Livraison</span><strong>${money(cart.delivery_fee)}</strong></p>
          <p class="summary-total"><span>Total</span><strong>${money(cart.total)}</strong></p>
          <a class="btn btn-primary full" href="checkout.html">Commander</a>
          <button class="btn btn-secondary full" type="button" data-cart-clear>Vider le panier</button>
        </aside>`;
    } catch (_err) {
      if (root) root.innerHTML = '<div class="empty-state">Impossible de charger le panier.</div>';
    }
  };

  document.addEventListener("change", async (event) => {
    const input = event.target.closest("[data-cart-qty]");
    if (!input) return;
    try {
      await apiPut(`/cart/${input.dataset.cartQty}`, { quantity: input.value });
      renderCart();
    } catch (err) {
      notify(err.message, "error");
    }
  });

  document.addEventListener("click", async (event) => {
    const remove = event.target.closest("[data-cart-remove]");
    const clear = event.target.closest("[data-cart-clear]");
    try {
      if (remove) await apiDelete(`/cart/${remove.dataset.cartRemove}`);
      if (clear) await apiDelete("/cart");
      if (remove || clear) {
        notify("Panier mis à jour");
        renderCart();
      }
    } catch (err) {
      notify(err.message, "error");
    }
  });

  document.addEventListener("tlx:cart-updated", renderCart);
  document.addEventListener("DOMContentLoaded", renderCart);
})();
