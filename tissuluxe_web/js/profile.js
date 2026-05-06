(() => {
  const { apiGet, apiPut, apiPost, apiDelete, qs, notify, getUser } = window.TLX;

  const orderRow = (order) => `
    <a class="order-row" href="details-commande.html?order=${encodeURIComponent(order.order_number)}">
      <strong>${order.order_number}</strong><span class="status-pill">${order.status}</span><span>${Number(order.total || 0).toFixed(2)} MAD</span>
    </a>`;

  const addressLine = (address) => `
    <article class="panel address-mini-card">
      <h3>${address.label || "Adresse"}</h3>
      <p>${address.full_name || ""} · ${address.phone || ""}</p>
      <p>${address.address}, ${address.city} ${address.postal_code || ""}</p>
      <button class="btn btn-secondary" type="button" data-delete-address="${address.id}">Supprimer</button>
    </article>`;

  const loadProfile = async () => {
    const root = qs("[data-profile]");
    if (!root) return;
    if (!getUser()) {
      root.innerHTML = '<div class="empty-state">Connectez-vous pour accéder à votre espace client.</div>';
      return;
    }
    try {
      const [me, orders, addresses] = await Promise.all([
        apiGet("/users/profile"),
        apiGet("/orders/my-orders"),
        apiGet("/users/addresses")
      ]);
      const displayName = `${me.first_name || ""} ${me.last_name || ""}`.trim() || "Client TissuLuxe";
      root.innerHTML = `
        <section class="account-welcome">
          <div class="account-avatar">${(me.first_name || "T").slice(0, 1)}</div>
          <div>
            <h1>Bonjour, ${me.first_name || "Sara"} !</h1>
            <p>Merci de faire partie de la famille TissuLuxe. Voici un aperçu de votre activité.</p>
          </div>
        </section>
        <section class="account-stats">
          <article><i class="fas fa-bag-shopping"></i><strong>${orders.length}</strong><span>Commandes</span></article>
          <article><i class="far fa-heart"></i><strong>3</strong><span>Articles favoris</span></article>
          <article><i class="fas fa-location-dot"></i><strong>${addresses.length}</strong><span>Adresses</span></article>
        </section>
        <section class="panel account-info-panel">
          <div class="panel-title"><h2>Informations personnelles</h2><a href="#profile-form">Modifier</a></div>
          <p><strong>Nom complet</strong><span>${displayName}</span></p>
          <p><strong>E-mail</strong><span>${me.email || "-"}</span></p>
          <p><strong>Téléphone</strong><span>${me.phone || "-"}</span></p>
        </section>
        <section class="panel">
          <div class="panel-title"><h2>Modifier mes informations</h2></div>
          <form id="profile-form" data-profile-form class="form-grid">
            <input name="first_name" value="${me.first_name || ""}" placeholder="Prénom" required>
            <input name="last_name" value="${me.last_name || ""}" placeholder="Nom" required>
            <input name="phone" value="${me.phone || ""}" placeholder="Téléphone">
            <button class="btn btn-primary" type="submit">Mettre à jour</button>
          </form>
        </section>
        <section class="panel"><div class="panel-title"><h2>Mes dernières commandes</h2><a href="mes-commandes.html">Voir toutes</a></div>${orders.slice(0, 4).map(orderRow).join("") || "<p>Aucune commande.</p>"}</section>
        <section><div class="section-head"><h2>Adresses de livraison</h2></div><div class="product-grid">${addresses.map(addressLine).join("") || '<div class="empty-state">Aucune adresse enregistrée.</div>'}</div></section>
        <section class="panel">
          <div class="panel-title"><h2>Ajouter une adresse</h2></div>
          <form data-address-form class="form-grid">
            <input name="label" placeholder="Libellé" value="Maison">
            <input name="full_name" placeholder="Nom complet">
            <input name="phone" placeholder="Téléphone">
            <input name="city" placeholder="Ville" required>
            <input name="postal_code" placeholder="Code postal">
            <input name="country" placeholder="Pays" value="Maroc">
            <textarea name="address" placeholder="Adresse complète" required></textarea>
            <button class="btn btn-primary" type="submit">Ajouter</button>
          </form>
        </section>`;
    } catch (err) {
      root.innerHTML = `<div class="empty-state">${err.message}</div>`;
    }
  };

  document.addEventListener("submit", async (event) => {
    const profile = event.target.closest("[data-profile-form]");
    const address = event.target.closest("[data-address-form]");
    if (!profile && !address) return;
    event.preventDefault();
    try {
      if (profile) await apiPut("/users/profile", Object.fromEntries(new FormData(profile).entries()));
      if (address) await apiPost("/users/addresses", Object.fromEntries(new FormData(address).entries()));
      notify(profile ? "Profil mis à jour" : "Adresse ajoutée");
      loadProfile();
    } catch (err) {
      notify(err.message, "error");
    }
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-address]");
    if (!button) return;
    try {
      await apiDelete(`/users/addresses/${button.dataset.deleteAddress}`);
      notify("Adresse supprimée");
      loadProfile();
    } catch (err) {
      notify(err.message, "error");
    }
  });

  document.addEventListener("DOMContentLoaded", loadProfile);
})();
