# Joy Store — HTML, CSS and JavaScript prototype

## Files
- `index.html` — customer-facing store
- `admin.html` — store admin dashboard
- `styles.css` — shared mobile-first styles
- `store.js` — catalog filtering, cart and demo checkout
- `admin.js` — product CRUD and order management

## Run it
This is a static prototype. Upload the folder to a static hosting provider or open `index.html` in a browser. A local static server is recommended for development.

## Important limitations
- Product and order data are stored in `localStorage` on the current browser/device.
- Store and admin share data only when opened on the same browser origin and device.
- There is no real admin authentication, backend database, order notification, payment processing, or cross-device synchronization.
- Never use this localStorage prototype to store real customer data or accept real payments.
- The “Online payment (coming soon)” option does not charge anyone.
- Demo checkout creates a local demo order only. Delivery fee is not calculated.
- Before launch, add a server-side API/database, authentication and authorization, input validation, server-side stock checks, payment-provider verification/webhooks, privacy/return policies and backups.

## Product data
Initial demo prices and quantities are based on the supplied planning figures. Jewelry and phone prices are set to zero until you enter real prices in the admin. Confirm unit sizes and pricing before publishing.

## Suggested next build
1. Replace `localStorage` functions with API calls to a backend.
2. Add server-side login and admin roles.
3. Add a PostgreSQL database for products, orders, order items and payment records.
4. Add delivery-fee rules for Addis Ababa neighborhoods.
5. Integrate a payment gateway only after merchant approval and test mode validation.
