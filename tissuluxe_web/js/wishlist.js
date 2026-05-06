(() => {
  const { apiGet, apiDelete, apiPost, asset, money, qs, notify } = window.TLX;

  const loadWishlist = async () => {
    const root = qs("[data-wishlist]");
    if (!root) return;
    try {
      const items = await apiGet("/wishlist");
      root.innerHTML = items.map((item) => `
        <article class="product-card">
          <a class="product-media" href="produit.html?slug=${item.product.slug}"><img src="${asset(item.product.main_image)}" alt="${item.product.name}"></a>
          <div class="product-body">
            <p class="eyebrow">${item.product.category_name || "Favori"}</p>
            <h3>${item.product.name}</h3>
            <div class="product-price"><strong>${money(item.product.price)}</strong></div>
            <div class="product-actions"><button class="btn btn-primary" type="button" data-fav-cart="${item.product.id}">Ajouter au panier</button><button class="btn-icon" type="button" data-fav-remove="${item.product.id}" aria-label="Retirer ${item.product.name} des favoris">×</button></div>
          </div>
        </article>`).join("") || '<div class="empty-state">Aucun favori pour le moment.</div>';
    } catch (err) {
      root.innerHTML = `<div class="empty-state">${err.message}. Connectez-vous pour retrouver vos favoris.</div>`;
    }
  };

  document.addEventListener("click", async (event) => {
    const add = event.target.closest("[data-fav-cart]");
    const remove = event.target.closest("[data-fav-remove]");
    try {
      if (add) {
        await apiPost("/cart", { product_id: add.dataset.favCart, quantity: 1 });
        notify("Favori ajouté au panier");
      }
      if (remove) {
        await apiDelete(`/wishlist/${remove.dataset.favRemove}`);
        notify("Favori supprimé");
        loadWishlist();
      }
    } catch (err) {
      notify(err.message, "error");
    }
  });

  document.addEventListener("DOMContentLoaded", loadWishlist);
})();
