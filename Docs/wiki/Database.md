# Database

## Overview

The database stores the main data used by the TissuLuxe e-commerce platform.

It supports product management, categories, customers, orders, admin actions, and store configuration.

---

## Main Data Areas

The database can include information related to:

- Products
- Categories
- Customers
- Orders
- Order items
- Admin users
- Product images
- Store settings

---

## Suggested Tables

```txt
products
categories
customers
orders
order_items
admins
settings
media
```

---

## Products Data

Product records can include:

- Product name
- Description
- Category
- Price
- Image
- Availability
- Created date
- Updated date

---

## Orders Data

Order records can include:

- Customer information
- Ordered products
- Quantity
- Total amount
- Order status
- Created date

---

## Database Best Practices

- Use clear table names.
- Keep relationships organized.
- Validate data before insertion.
- Avoid storing sensitive data without protection.
- Keep backups regularly.
- Do not expose database credentials in the repository.

---

## Back to Wiki

Return to [Home](Home.md).
