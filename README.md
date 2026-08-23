# Mini D-Mart - Grocery Store Web Application

Mini D-Mart is a simple, clean, and beginner-friendly full-stack grocery store web application designed for a Software Developer Intern assessment. It implements role-based access control (RBAC) supporting three roles: Customers, Staff, and Administrators.

---

## Live Links
* **Live Application**: [https://mini-dmart-mauve.vercel.app](https://mini-dmart-mauve.vercel.app)
* **Backend API**: [https://mini-dmart-2f6r.onrender.com](https://mini-dmart-2f6r.onrender.com)
* **GitHub Repository**: [https://github.com/shrutika00/mini-dmart](https://github.com/shrutika00/mini-dmart)

---

## 1. Project Overview
Mini D-Mart is built to emulate a simplified version of a grocery platform similar to D-Mart. It allows customers to browse, search, and filter items, add them to a cart, check out with either Home Delivery or Store Pickup, track orders, and request returns or exchanges. It provides staff members with order fulfillment dashboards and inventory previews, while administrators get full CRUD controls over products, categories, users, and overall analytics.

This version uses **PostgreSQL** as the primary relational database with **Sequelize ORM** for modeling and data interactions.

---

## 2. Features

### Customer Features
* **Register/Login**: Standard credentials register and login.
* **Product Catalog**: Browse active products, search by name, and filter by category.
* **Cart**: Add items, increase/decrease quantities, with stock limitation validation.
* **Checkout**: Choose between **Home Delivery** (address input) and **Store Pickup** (date and time slot selection).
* **Order Management**: Place orders, view order history/details, and cancel orders in initial stages.
* **Returns & Exchanges**: Request returns or exchanges for delivered orders within 7 days.

### Staff Features
* **Orders Log**: View all orders, view address or pickup slots, and update statuses.
* **Inventory Preview**: Check products list and their current stock levels.
* **Process Returns**: Approve, reject, or complete customer return/exchange requests.

### Admin Features
* **Summary Analytics**: View Total Products, Total Users, Total Orders, and Pending Returns.
* **Product CRUD**: Add, edit, or soft-deactivate products (retains order history integrity).
* **Category CRUD**: Create, edit, and delete grocery category classifications.
* **Users Directory**: View a list of all registered users (roles: customer, staff, admin).
* **Full Access Control**: Edit order statuses and process return logs.

---

## 3. Tech Stack
* **Frontend**: React.js (SPA, Vite builder, React Router v6, Plain CSS styles, React Context for State).
* **Backend**: Node.js, Express.js (REST APIs, CORS, Helmet security).
* **Database**: PostgreSQL, Sequelize ORM.
* **Authentication**: JWT (stateless token, stored in client `LocalStorage`), Bcryptjs (password hashing).

---

## 4. Architecture
The application uses a **three-tier client-server PERN architecture**:
1. **Presentation Layer (Client)**: React SPA talking to the backend REST endpoints.
2. **Application Layer (Server)**: Node/Express REST API serving JSON responses.
3. **Data Layer (Database)**: PostgreSQL relational database storing tables for users, categories, products, carts, cart_items, orders, order_items, and returns.

---

## 5. Folder Structure
```text
mini-dmart/
├── backend/
│   ├── config/          # PostgreSQL Sequelize configurations
│   ├── controllers/     # Controller logic for Express handlers
│   ├── middleware/      # Auth (RBAC) and Error handler middlewares
│   ├── models/          # Sequelize relational models
│   ├── routes/          # REST API route endpoints
│   ├── seed/            # Seed data and SQL scripting
│   ├── package.json     # Node scripts & dependencies
│   └── server.js        # Main server entry file
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, ProtectedRoute, ProductCard
│   │   ├── context/     # AuthContext, CartContext
│   │   ├── pages/       # Login, Register, Dashboards, Details, Cart
│   │   ├── services/    # api.js client fetch requests handler
│   │   ├── App.css      # Helper classes
│   │   ├── App.jsx      # Router configuration
│   │   ├── index.css    # Master stylesheet (Plain CSS)
│   │   └── main.jsx     # React root renderer
│   ├── package.json     # Vite scripts & dependencies
│   ├── vercel.json      # Vercel SPA routing rewrites config
│   └── index.html       # Vite root index file
│
├── README.md            # Setup guide and instructions
├── SECURITY.md          # Security specifications
├── .env.example         # Root-level env template
└── .gitignore
```

---

## 6. Database Design (Sequelize Relational Tables)
Refer to the detailed Sequelize schema model definitions:
* **User**: [`User.js`](backend/models/User.js)
* **Category**: [`Category.js`](backend/models/Category.js)
* **Product**: [`Product.js`](backend/models/Product.js)
* **Cart**: [`Cart.js`](backend/models/Cart.js)
* **CartItem**: [`CartItem.js`](backend/models/CartItem.js)
* **Order**: [`Order.js`](backend/models/Order.js)
* **OrderItem**: [`OrderItem.js`](backend/models/OrderItem.js)
* **Return**: [`Return.js`](backend/models/Return.js)
* **Relations**: Associations and foreign keys are defined in [`models/index.js`](backend/models/index.js).

---

## 7. REST API Endpoints
* **Auth**:
  - `POST /api/auth/register` (Public)
  - `POST /api/auth/login` (Public)
  - `GET /api/auth/me` (Protected)
* **Products**:
  - `GET /api/products` (Public)
  - `GET /api/products/:id` (Public)
  - `POST /api/products` (Admin)
  - `PUT /api/products/:id` (Admin)
  - `DELETE /api/products/:id` (Admin)
* **Categories**:
  - `GET /api/categories` (Public)
  - `POST /api/categories` (Admin)
  - `PUT /api/categories/:id` (Admin)
  - `DELETE /api/categories/:id` (Admin)
* **Cart**:
  - `GET /api/cart` (Customer)
  - `POST /api/cart` (Customer)
  - `PUT /api/cart/:productId` (Customer)
  - `DELETE /api/cart/:productId` (Customer)
* **Orders**:
  - `POST /api/orders` (Customer)
  - `GET /api/orders` (Protected - owner, staff, admin)
  - `GET /api/orders/:id` (Protected - owner, staff, admin)
  - `PUT /api/orders/:id/status` (Staff, Admin)
  - `DELETE /api/orders/:id/cancel` (Protected - owner, staff, admin)
* **Returns**:
  - `POST /api/returns` (Customer)
  - `GET /api/returns` (Protected)
  - `PUT /api/returns/:id/status` (Staff, Admin)
* **Users & Admin**:
  - `GET /api/users` (Admin)
  - `GET /api/users/stats` (Admin)

---

## 8. Roles and Permissions
1. **Customer**: Can buy products, manage cart, checkout, view order status, request cancellations (placed/confirmed), and request return/exchange.
2. **Staff**: Can view all orders and inventory stock levels, change order status to preparing/delivering/ready, and approve/reject returns.
3. **Admin**: Has complete administrative control: CRUD operations on Categories and Products, view Users, update order statuses, resolve return logs, and check summary analytics.

---

## 9. Key Business Rules
1. **Stock Check on Add-to-Cart**: Quantity added cannot exceed product stock.
2. **Atomic SQL Transactions**: Checkouts and cancellations run in database-level transactions, double checking available stock and incrementing/decrementing quantities atomically.
3. **Stock Reversion on Order cancellation**: If order is cancelled, stock is incremented back.
4. **Cancellation constraints**: Customers can only cancel orders in `PLACED` or `CONFIRMED` statuses.
5. **Return constraints**: Allowed only for `DELIVERED` orders and within 7 calendar days of order date.

---

## 10. Environment Variables
Configure the environment variables using the `.env.example` file located at the root of the repository:

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## 11. Local Setup & Seeding Instructions
1. Ensure PostgreSQL is running locally on port `5432` with a configured user.
2. Connect to psql and create the database:
   ```sql
   CREATE DATABASE mini_dmart;
   ```
3. **Install and Seed the Backend**:
   ```bash
   cd backend
   npm install
   npm run seed
   ```
4. **Install the Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 12. Test Credentials (Local Development Only)
These credentials are seeded by the script for testing purposes:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@minidmart.com` | `admin123` |
| **Staff** | `staff@minidmart.com` | `staff123` |
| **Customer 1** | `customer1@gmail.com` | `customer123` |
| **Customer 2** | `customer2@gmail.com` | `customer123` |

> [!WARNING]
> These credentials are for local development and testing purposes only. They must never be exposed as production credentials.

---

## 13. How to Run the Application Locally

### Running Backend Server
```bash
cd backend
npm start
```
Starts backend server on `http://localhost:5000`.

### Running Frontend Development Server
```bash
cd frontend
npm run dev
```
Starts development server on `http://localhost:3000`.

---

## 14. Deployment Instructions

### Database Setup
1. Create a **Render PostgreSQL** database or use another host (e.g. Supabase, Neon).
2. Copy the external connection string (`DATABASE_URL`).

### Backend Deployment (Render)
1. Register on [Render.com](https://render.com/).
2. Create a new **Web Service** and link your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add these Environment Variables:
   - `DATABASE_URL` = `<your_postgres_connection_string>`
   - `JWT_SECRET` = `<your_jwt_secret_key>`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `<your_deployed_vercel_frontend_url>`
5. Click **Deploy**. Note the URL (e.g., `https://your-backend.onrender.com`).

### Frontend Deployment (Vercel)
1. Register on [Vercel.com](https://vercel.com/).
2. Create a new **Project** and import your GitHub repository.
3. Configure settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add this Environment Variable:
   - `VITE_API_URL` = `<your_deployed_render_backend_url>`
5. Click **Deploy**.

---

## 15. Known Limitations
* **JWT Storage**: JWT token is stored in LocalStorage. For higher security against XSS attacks, transition to HttpOnly cookies is recommended.
* **In-Memory Cache**: No cache layers are configured. Direct database requests are made.
* **No Payments Integration**: Checkout is mock-fulfilled directly upon clicking "Place Order".

---

## 16. AI Assistance
AI assistance was utilized during this project for:
* Scaffolding directories and package setups.
* Designing and implementing Sequelize database models.
* Writing clean modular controller operations.
* Assisting with the plain CSS responsive layout styling.
* Assisting with documentation write-up.
The code was thoroughly reviewed and validated to ensure reliability and beginner-friendliness.
