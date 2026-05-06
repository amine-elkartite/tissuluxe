(() => {
  const { apiGet, apiPost, money, asset, qs, qsa, notify } = window.TLX;

  const fallbackCategories = [
    { name: "Tissus Fleuris", slug: "tissus-fleuris", image: "images/products/fabric-01.jpg", product_count: 128 },
    { name: "Tissus Caftan", slug: "tissus-caftan", image: "images/products/fabric-04.jpg", product_count: 86 },
    { name: "Décoration", slug: "decoration", image: "images/products/fabric-07.jpg", product_count: 93 },
    { name: "Dentelle", slug: "dentelle", image: "images/products/fabric-05.jpg", product_count: 64 }
  ];

  const fallbackProducts = [
    { id: 1, name: "Tissu Floral Foncé", slug: "tissu-floral-fonce", category_name: "Tissus Fleuris", main_image: "images/products/fabric-01.jpg", price: 89, old_price: 120, stock: 24 },
    { id: 2, name: "Tissu Magnolia Violet", slug: "tissu-magnolia-violet", category_name: "Tissus Fleuris", main_image: "images/products/fabric-02.jpg", price: 95, old_price: 130, stock: 18 },
    { id: 3, name: "Tissu Fleurs Marron & Blanc", slug: "tissu-fleurs-marron-blanc", category_name: "Tissus Fleuris", main_image: "images/products/fabric-03.jpg", price: 85, old_price: 110, stock: 21 },
    { id: 4, name: "Tissu Baroque Bleu & Orange", slug: "tissu-baroque-bleu-orange", category_name: "Tissus Caftan", main_image: "images/products/fabric-04.jpg", price: 110, old_price: 160, stock: 7 },
    { id: 5, name: "Tissu Floral Dentelle Violet", slug: "tissu-floral-dentelle-violet", category_name: "Dentelle", main_image: "images/products/fabric-05.jpg", price: 120, old_price: 160, stock: 12 },
    { id: 6, name: "Tissu Rose Crème", slug: "tissu-rose-creme", category_name: "Soie imprimée", main_image: "images/products/fabric-06.jpg", price: 99, old_price: 140, stock: 16 }
  ];

  const productCard = (p) => `
    <article class="product-card">
      <div class="product-img-wrap product-media">
        ${p.old_price ? '<span class="badge-sale">Promo</span>' : ""}
        <button class="wishlist-btn" title="Ajouter aux favoris" data-add-wishlist="${p.id}" type="button"><i class="far fa-heart"></i></button>
        <a href="produit.html?slug=${encodeURIComponent(p.slug)}"><img src="${asset(p.main_image)}" alt="${p.name}"></a>
      </div>
      <div class="product-info product-body">
        <div class="product-category">${p.category_name || "Tissu premium"}</div>
        <a class="product-name" href="produit.html?slug=${encodeURIComponent(p.slug)}">${p.name}</a>
        <div class="product-rating">
          <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i></div>
          <span class="rating-count">${p.stock > 0 ? "En stock" : "Rupture"}</span>
        </div>
        <div class="product-price"><span class="price-current">${money(p.price)}</span>${p.old_price ? `<span class="price-old">${money(p.old_price)}</span>` : ""}</div>
        <div class="product-actions old-actions">
          <button class="add-to-cart-btn" type="button" data-add-cart="${p.id}"><i class="fas fa-cart-plus"></i> Ajouter au panier</button>
        </div>
      </div>
    </article>`;

  const categoryCard = (c) => `
    <a class="category-card" href="liste-produits.html?category=${encodeURIComponent(c.slug)}">
      <img src="${asset(c.image)}" alt="${c.name}">
      <span>${c.name}</span>
      <small>${c.product_count || 0} produits</small>
    </a>`;

  const loadHome = async () => {
    const featured = qs("[data-featured]");
    const cats = qs("[data-categories]");
    if (featured) {
      const fallback = featured.innerHTML;
      if (!fallback.trim()) featured.innerHTML = skeletonCards(4);
      try {
        const products = await apiGet("/products/featured");
        featured.innerHTML = products.map(productCard).join("");
      } catch (err) {
        featured.innerHTML = fallbackProducts.map(productCard).join("");
      }
    }
    if (cats) {
      let categories = fallbackCategories;
      try {
        categories = await apiGet("/categories");
      } catch (_err) {}
      cats.innerHTML = categories.map(categoryCard).join("");
    }
  };

  const loadCategories = async () => {
    const container = qs("[data-all-categories]");
    if (!container) return;
    container.innerHTML = skeletonCards(6);
    let categories = fallbackCategories;
    try {
      categories = await apiGet("/categories");
    } catch (_err) {}
    container.innerHTML = categories.map(categoryCard).join("");
  };

  const loadListing = async () => {
    const grid = qs("[data-products-grid]");
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    const form = qs("[data-product-filters]");
    if (form) {
      for (const [key, value] of params.entries()) {
        const input = form.elements[key];
        if (input) input.value = value;
      }
    }
    let categories = fallbackCategories;
    try {
      categories = await apiGet("/categories");
    } catch (_err) {}
    const select = form?.elements.category || qs("[name='category']");
    if (select && select.options.length < 2) {
      select.insertAdjacentHTML("beforeend", categories.map((c) => `<option value="${c.slug}">${c.name}</option>`).join(""));
      if (params.get("category")) select.value = params.get("category");
    }
    grid.innerHTML = skeletonCards(8);
    let data;
    try {
      data = await apiGet(`/products?${params.toString() || "page=1&limit=12"}`);
    } catch (_err) {
      data = { products: fallbackProducts, pagination: { pages: 1, page: 1 } };
    }
    grid.innerHTML = data.products.map(productCard).join("") || emptyState("Aucun produit trouvé");
    const count = qs(".catalog-toolbar span");
    if (count) count.textContent = `${data.products.length} produits trouvés`;
    renderPagination(data.pagination);
  };

  const loadProductDetail = async () => {
    const root = qs("[data-product-detail]");
    if (!root) return;
    const slug = new URLSearchParams(location.search).get("slug") || "satin-floral-royal";
    let product;
    try {
      product = await apiGet(`/products/${slug}`);
    } catch (_err) {
      product = { ...fallbackProducts[0], description: "Tissu premium sélectionné par TissuLuxe.", colors: ["Noir", "Rouge"], material: "Satin", width: "150 cm", pattern: "Floral", images: [] };
    }
    root.innerHTML = `
      <div class="detail-gallery">
        <img class="detail-main" src="${asset(product.main_image)}" alt="${product.name}">
        <div class="thumbs">${[product.main_image, ...(product.images || [])].slice(0, 4).map((img, index) => `<button type="button" aria-label="Voir l'image ${index + 1}"><img src="${asset(img)}" alt=""></button>`).join("")}</div>
      </div>
      <div class="detail-info">
        <p class="eyebrow">${product.category_name}</p>
        <h1>${product.name}</h1>
        <p class="lead">${product.description || ""}</p>
        <div class="detail-price">${money(product.price)} ${product.old_price ? `<del>${money(product.old_price)}</del>` : ""}</div>
        <div class="swatches">${(product.colors || []).map((c) => `<span>${c}</span>`).join("")}</div>
        <dl class="specs">
          <div><dt>Matière</dt><dd>${product.material || "-"}</dd></div>
          <div><dt>Largeur</dt><dd>${product.width || "-"}</dd></div>
          <div><dt>Motif</dt><dd>${product.pattern || "-"}</dd></div>
          <div><dt>Stock</dt><dd>${product.stock} m</dd></div>
        </dl>
        <div class="qty-row"><input type="number" min="1" value="1" data-qty><button class="btn btn-primary" type="button" data-add-cart="${product.id}">Ajouter au panier</button><button class="btn btn-secondary" type="button" data-add-wishlist="${product.id}">Favori</button></div>
      </div>`;
    loadReviews(product.id);
  };

  const loadReviews = async (productId) => {
    const container = qs("[data-reviews]");
    if (!container) return;
    const reviews = await apiGet(`/reviews/product/${productId}`);
    container.innerHTML = reviews.map((r) => `<article class="review"><strong>${"★".repeat(r.rating)}</strong><p>${r.comment || ""}</p><small>${r.first_name || "Client"} ${r.last_name || ""}</small></article>`).join("") || emptyState("Aucun avis pour ce produit.");
  };

  const renderPagination = (pagination) => {
    const el = qs("[data-pagination]");
    if (!el || !pagination) return;
    el.innerHTML = Array.from({ length: pagination.pages || 1 }, (_, i) => {
      const page = i + 1;
      const params = new URLSearchParams(location.search);
      params.set("page", page);
      return `<a class="${page === pagination.page ? "active" : ""}" href="?${params.toString()}">${page}</a>`;
    }).join("");
  };

  const skeletonCards = (count) => Array.from({ length: count }, () => '<div class="skeleton-card"></div>').join("");
  const emptyState = (text) => `<div class="empty-state">${text}</div>`;

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-product-filters]");
    if (!form) return;
    event.preventDefault();
    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      if (value) params.set(key, value);
    });
    location.href = `liste-produits.html?${params.toString()}`;
  });

  document.addEventListener("click", async (event) => {
    const add = event.target.closest("[data-add-cart]");
    const wish = event.target.closest("[data-add-wishlist]");
    try {
      if (add) {
        if (add.disabled) return;
        add.disabled = true;
        const quantity = Number(qs("[data-qty]")?.value || 1);
        await apiPost("/cart", { product_id: add.dataset.addCart, quantity });
        notify("Produit ajouté au panier");
        document.dispatchEvent(new Event("tlx:cart-updated"));
        add.disabled = false;
      }
      if (wish) {
        if (wish.disabled) return;
        wish.disabled = true;
        await apiPost("/wishlist", { product_id: wish.dataset.addWishlist });
        notify("Produit ajouté aux favoris");
        wish.disabled = false;
      }
    } catch (err) {
      notify(err.message, "error");
      if (add) add.disabled = false;
      if (wish) wish.disabled = false;
    }
  });

  document.addEventListener("click", (event) => {
    const thumb = event.target.closest(".thumbs button img");
    if (thumb) qs(".detail-main").src = thumb.src;
  });

  window.TLXProducts = { productCard, categoryCard, loadListing };
  document.addEventListener("DOMContentLoaded", () => {
    Promise.allSettled([loadHome(), loadCategories(), loadListing(), loadProductDetail()]).catch(() => {});
  });
})();
