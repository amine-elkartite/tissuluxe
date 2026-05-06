# Future application mobile TissuLuxe

Ce dossier prépare la future application mobile. L'API TissuLuxe peut être utilisée avec Flutter, React Native ou Kotlin sans changer le backend.

## Base URL

```text
http://localhost:3000/api
```

## Authentification

L'API utilise JWT. Après `POST /api/auth/login`, envoyez le token dans les appels protégés :

```text
Authorization: Bearer <token>
```

## Endpoints utiles

- Auth : `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Produits : `GET /products`, `GET /products/featured`, `GET /products/:slug`
- Catégories : `GET /categories`
- Panier : `GET /cart`, `POST /cart`, `PUT /cart/:id`, `DELETE /cart`
- Favoris : `GET /wishlist`, `POST /wishlist`, `DELETE /wishlist/:productId`
- Commandes : `POST /orders`, `GET /orders/my-orders`, `GET /orders/track/:orderNumber`
- Coupons : `POST /coupons/validate`
- Contact : `POST /contact`

## Exemple d'appel

```js
const response = await fetch("http://localhost:3000/api/products?limit=12");
const payload = await response.json();

if (payload.success) {
  console.log(payload.data.products);
}
```

Pour les paniers invités, envoyez aussi un header `X-Session-Id` stable côté mobile.
