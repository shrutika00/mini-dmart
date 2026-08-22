# Security Specification - Mini D-Mart

This document details the security design, decisions, and implementation details of the Mini D-Mart grocery store web application.

## 1. Authentication Approach
* **Stateless JWT Authentication**: Authentication is implemented using JSON Web Tokens (JWT). Upon successful login, the server generates a token signed with a secret key.
* **Storage**: The token is stored on the client side in `LocalStorage` and sent in the HTTP `Authorization` header as `Bearer <token>` for all subsequent protected API requests.
* **Token Payload**: Contains only the user's UUID `id` to prevent leakage of user details inside JWT decodable payloads.

## 2. Authorization & Role-Based Access Control (RBAC)
* **User Roles**: The application supports three roles: `customer`, `staff`, and `admin`.
* **Backend Enforcement**: APIs are protected using an Express middleware chain:
  1. `protect`: Verifies the validity of the JWT token and fetches the corresponding user from the database.
  2. `authorize(...roles)`: Verifies if the authenticated user's role matches one of the required roles for that route.
* **No Frontend Trust**: The frontend sends the JWT. The backend decodes it and determines the role directly from the database record rather than relying on any role value sent in request bodies or query parameters.
* **Role Promotion Guard**: During user self-registration (`POST /api/auth/register`), the user's role is forced to `customer` inside the controller, ignoring any `role` fields sent in the request payload.

## 3. Password Hashing
* **Bcrypt Hashing**: Passwords are never stored as plain text. The application uses `bcryptjs` with a work factor (salt rounds) of `10`.
* **Automatic Hook**: Sequelize hooks (`beforeCreate` and `beforeUpdate`) automatically hash passwords during user creation or updates (if modified).
* **Database Select Projection**: The password field is excluded in standard queries by utilizing Sequelize attributes exclusions (`attributes: { exclude: ['password'] }`) where user object data is retrieved, avoiding accidental password exposure in API responses.

## 4. Input Validation
* **Backend Validation**: Every critical API validates its inputs:
  - **Auth**: Ensures email conforms to standard format, name is present, and password meets the minimum 6 characters constraint.
  - **Products & Categories**: Checks that price and stock inputs are non-negative numeric values, and fields are non-empty.
  - **Cart**: Verifies the product exists, is active, and quantity requested is positive.
  - **Orders**: Validates matching dates and addresses relative to fulfillment selections.
* **Database Level Constraints**: Sequelize models use built-in validations (`allowNull`, `unique`, `validate` validation rules) as a secondary validation layer.

## 5. API Security & HTTP Headers
* **Helmet Middleware**: Integrated `helmet` middleware to set essential HTTP security headers:
  - Disables client side caching where applicable.
  - Restricts browser features via permissions policy.
  - Prevents clickjacking (`X-Frame-Options`).
  - Mitigates MIME-sniffing vulnerabilities.
* **CORS Policy**: Configured `cors` middleware to restrict cross-origin request policies, which can be locked down to specific origin domains in production environments.
* **Error Handling Middleware**: A global Express error handler captures internal errors and returns clean JSON responses. In production mode, stack traces are withheld to avoid leaking internal file structure or database schema details.

## 6. Access Control & Business Logic Guardrails
* **Cart Stock Guard**: Users cannot add items to the cart or increment quantity beyond the product's currently available stock.
* **Atomic SQL Transactions**: The checkout API and cancellation API use SQL **transactions** (`sequelize.transaction()`) to check available stock and decrement/increment quantities atomically inside the database. If stock is insufficient, the transaction rolls back before generating the order.
* **Order Cancellation Rules**: Customers can cancel orders only when they are in the `PLACED` or `CONFIRMED` stages. Once an order reaches `PREPARING` or further, cancellation is blocked. If an order is successfully cancelled, product stock is automatically restored.
* **Return Restriction**: Return or exchange requests are restricted to `DELIVERED` orders only, and must be submitted within 7 calendar days of order date.

## 7. Known Security Limitations & Future Improvements
1. **JWT Revocation**: Currently, JWT tokens remain valid until expiration. Future iterations could implement token blacklisting or Refresh Token rotators.
2. **Rate Limiting**: To prevent brute force login attempts or scraping, API rate limiting (such as `express-rate-limit`) should be added in a production environment.
3. **Query Parameter Sanitization**: Standardizing query input casting to protect against complex SQL injection.
4. **Secure Cookies**: In production, transitioning JWT storage from `LocalStorage` to `HttpOnly`, `Secure`, and `SameSite=Strict` cookies would block Cross-Site Scripting (XSS) token theft.
