(() => {
  const { qs, getUser } = window.TLX || {};

  const nav = `
    <div class="top-bar">
      <div class="delivery-msg"><i class="fas fa-truck"></i> Livraison gratuite à partir de 500 MAD</div>
      <div class="top-links">
        <a href="contact.html">Centre d'aide</a>
        <span class="divider"></span>
        <a href="suivi-commande.html">Suivre ma commande</a>
        <span class="divider"></span>
        <a href="politique-retour.html">Retours faciles</a>
        <span class="divider"></span>
        <select aria-label="Langue"><option>Français</option></select>
      </div>
    </div>
    <header class="main-header">
      <a href="index.html" class="logo">
        <img class="logo-icon" src="images/logo-tissuluxe.png" alt="TissuLuxe">
      </a>
      <form class="search-bar" action="liste-produits.html">
        <select name="category"><option value="">Toutes les catégories</option></select>
        <input name="search" type="search" placeholder="Rechercher des tissus, couleurs et plus...">
        <button type="submit" aria-label="Rechercher"><i class="fas fa-search"></i></button>
      </form>
      <div class="header-actions">
        <a href="login.html" class="header-action" data-account-link>
          <i class="far fa-user"></i>
          <div class="header-action-text"><span data-account-kicker>Se connecter</span><strong data-account-label>Mon compte</strong></div>
        </a>
        <a href="favoris.html" class="header-action">
          <i class="far fa-heart"></i>
          <div class="header-action-text"><span>Liste d'envies</span><strong>Mon compte</strong></div>
          <div class="badge wishlist-badge">3</div>
        </a>
        <a href="panier.html" class="header-action">
          <i class="far fa-shopping-bag"></i>
          <div class="header-action-text"><span>Panier</span><strong class="cart-total">0,00 MAD</strong></div>
          <div class="badge" data-cart-count>0</div>
        </a>
      </div>
    </header>
    <nav class="main-nav">
      <a class="categories-btn" href="categories.html"><i class="fas fa-bars"></i> Catégories</a>
      <div class="nav-links">
        <a href="index.html">Accueil</a>
        <a href="liste-produits.html">Boutique</a>
        <a href="liste-produits.html?sort=best">Promotions</a>
        <a href="liste-produits.html?sort=newest">Nouveautés</a>
        <a href="liste-produits.html?sort=best">Meilleures ventes</a>
        <a href="liste-produits.html?category=tissus-fleuris">Tissus Fleuris</a>
        <a href="liste-produits.html?category=tissus-caftan">Tissus Caftan</a>
        <a href="liste-produits.html?category=decoration">Décoration</a>
        <a href="suivi-commande.html">Suivi commande</a>
        <a href="contact.html">Contact</a>
      </div>
    </nav>`;

  const footer = `
    <footer class="footer site-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <div class="footer-logo"><img src="images/logo-tissuluxe.png" alt=""><span>TissuLuxe.</span></div>
          <p>Votre destination incontournable pour des tissus de qualité supérieure. Élégance, qualité et style pour toutes vos créations.</p>
          <div class="footer-social">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
            <a href="https://www.pinterest.com/" target="_blank" rel="noopener" aria-label="Pinterest"><i class="fab fa-pinterest-p"></i></a>
          </div>
        </div>
        <div class="footer-col"><h4>Boutique</h4><a href="categories.html">Toutes les catégories</a><a href="liste-produits.html">Tous les tissus</a><a href="liste-produits.html?sort=newest">Nouveautés</a><a href="liste-produits.html?sort=best">Meilleures ventes</a><a href="liste-produits.html?sort=best">Promotions</a></div>
        <div class="footer-col"><h4>Service client</h4><a href="contact.html">Centre d'aide</a><a href="suivi-commande.html">Suivre ma commande</a><a href="politique-retour.html">Retours & échanges</a><a href="politique-livraison.html">Livraison</a><a href="contact.html">Nous contacter</a></div>
        <div class="footer-col"><h4>À propos</h4><a href="a_propos.html">À propos de nous</a><a href="contact.html">Nos magasins</a><a href="cgv.html">Conditions générales</a><a href="pdc.html">Politique de confidentialité</a></div>
        <div class="footer-col footer-payments"><h4>Paiements sécurisés</h4><div class="payment-row"><span>VISA</span><span>Mastercard</span><span>PayPal</span><span>Apple Pay</span><span>Cash Plus</span></div><p>© 2026 TissuLuxe. Tous droits réservés.</p></div>
      </div>
    </footer>`;

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
      document.head.appendChild(link);
    }
    if (!qs(".main-header") && !qs(".site-header")) document.body.insertAdjacentHTML("afterbegin", nav);
    if (!qs(".site-footer") && !qs("footer")) document.body.insertAdjacentHTML("beforeend", footer);
    const user = getUser?.();
    const account = qs("[data-account-label]");
    const accountKicker = qs("[data-account-kicker]");
    const accountLink = qs("[data-account-link]");
    if (account) account.textContent = user ? `Bonjour, ${user.first_name}` : "Mon compte";
    if (accountKicker) accountKicker.textContent = user ? "Mon compte" : "Se connecter";
    if (accountLink && user) accountLink.href = "profil.html";
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest(".newsletter-form");
    if (!form) return;
    event.preventDefault();
    window.TLX?.notify?.("Merci pour votre inscription");
    form.reset();
  });
})();
