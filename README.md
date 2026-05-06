# TissuLuxe

TissuLuxe est une plateforme e-commerce pour tissus premium : site web vanilla dynamique, API Node.js/Express/MySQL réutilisable par une future application mobile, et panel administrateur.

## Fonctionnalités

- Catalogue produits dynamique avec catégories, filtres, recherche, tri et pagination
- Détail produit avec galerie, variantes couleur, stock, avis et produits suggérés
- Panier invité ou connecté via session/API
- Favoris client, profil, adresses et historique de commandes
- Checkout, coupon `WELCOME10`, paiement simulé, confirmation et suivi commande
- Formulaire contact connecté à l'API
- Admin panel : dashboard, produits, catégories, commandes, clients, coupons, messages, réglages
- API sécurisée avec JWT, bcryptjs, Helmet, CORS, rate limit et middlewares d'erreur

## Technologies

- Backend : Node.js, Express.js, MySQL2, JWT, bcryptjs, multer, dotenv, Helmet, CORS, morgan, express-rate-limit
- Frontend : HTML, CSS responsive, JavaScript vanilla
- Admin : HTML/CSS/JS vanilla connecté à l'API
- Base de données : MySQL

## Structure

```text
API/                  API REST Express + MySQL
admin/                Panel administrateur
tissuluxe_web/        Site e-commerce public
tissuluxe_app/        Notes pour future application mobile
README.md
```

## Installation Backend

```bash
cd API
npm install
cp .env.example .env
npm run dev
```

L'API démarre sur `http://localhost:3000` avec le préfixe `http://localhost:3000/api`.

## Base De Données

Créer puis importer la base :

```bash
mysql -u root -p < API/database/schema.sql
```

Le script crée `tissuluxe_db`, les tables, les catégories, produits demo, avis, commandes et le coupon `WELCOME10`.

## Frontend

Ouvrir `tissuluxe_web/index.html` avec Live Server.

Exemple avec un serveur statique depuis la racine :

```bash
python3 -m http.server 5500
```

Puis visiter `http://localhost:5500/tissuluxe_web/index.html`.

## Admin

Ouvrir `admin/login.html` avec Live Server.

## Comptes Demo

- Admin : `admin@tissuluxe.ma` / `Admin12345`
- Client : `sara@example.com` / `Sara12345`

## Routes API Principales

- Auth : `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Users : `GET /api/users/profile`, `PUT /api/users/profile`, `GET /api/users/addresses`
- Products : `GET /api/products`, `GET /api/products/featured`, `GET /api/products/search?q=`, `GET /api/products/:slug`
- Categories : `GET /api/categories`, `GET /api/categories/:slug`
- Cart : `GET /api/cart`, `POST /api/cart`, `PUT /api/cart/:id`, `DELETE /api/cart/:id`, `DELETE /api/cart`
- Wishlist : `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/:productId`
- Orders : `POST /api/orders`, `GET /api/orders/my-orders`, `GET /api/orders/track/:orderNumber`, `PUT /api/orders/:id/status`
- Reviews : `GET /api/reviews/product/:productId`, `POST /api/reviews`
- Contact : `POST /api/contact`, `GET /api/contact`
- Coupons : `POST /api/coupons/validate`, `GET /api/coupons`
- Dashboard : `GET /api/dashboard/stats`, `GET /api/dashboard/sales`, `GET /api/dashboard/best-products`
- Upload : `POST /api/upload/product-image`

## Pages Disponibles

Site web : `index`, `categories`, `liste-produits`, `produit`, `panier`, `checkout`, `paiement`, `confirmation`, `favoris`, `profil`, `login`, `register`, `mes-commandes`, `details-commande`, `suivi-commande`, `contact`, `a_propos`, `cgv`, `pdc`, `politique-retour`, `politique-livraison`, `mentions-legales`, `cookies`, `404`.

Admin : `login`, `dashboard`, `products`, `product-form`, `orders`, `order-details`, `users`, `categories`, `coupons`, `messages`, `settings`.

## Future Mobile App

Le backend est prêt pour Flutter, React Native ou Kotlin : authentification JWT, endpoints produits, catégories, panier, favoris, commandes et suivi commande. Voir `tissuluxe_app/README.md`.
