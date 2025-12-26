# LuxeEstate - Backend API

The robust backend server powering the **LuxeEstate** real estate platform. Built with Node.js and Express, it handles authentication, property management, real-time notifications, and secure data storage.

---

## 🚀 Key Features

*   **RESTful API**: Comprehensive endpoints for Properties, Users, Inquiries, and Analytics.
*   **Authentication**: Secure JWT-based auth with Access and Refresh tokens.
*   **Role-Based Access Control (RBAC)**: Distinct permissions for Users, Agents, and Admins.
*   **Real-Time Engine**: Integrated **Socket.io** for instant notifications and status updates.
*   **Image Handling**: Seamless integration with **Cloudinary** for property image uploads.
*   **Email System**: SMTP integration for inquiry replies and notifications.

---

## 🛠 Tech Stack

*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
*   **Real-Time**: [Socket.io](https://socket.io/)
*   **Security**: Helmet, CORS, Bcrypt, JWT
*   **Logging**: Morgan

---

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v16+)
*   MongoDB Instance (Local or Atlas)
*   Cloudinary Account (Free tier works)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Mathiyarasan2102/LuxeEstate-RealEstate-Website-Backend.git
    cd LuxeEstate-RealEstate-Website-Backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    *   Rename `.env.example` to `.env`.
    *   Fill in your credentials:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_ACCESS_SECRET=some_super_secret_string
    # ... add your Cloudinary and SMTP keys
    ```

4.  **Run the Server**
    ```bash
    # Development Mode (with Nodemon)
    npm run dev

    # Production Mode
    npm start
    ```
    The server typically runs on port `5000`.

---

## 🔌 API Documentation

| Resource | Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | `POST /api/auth/login` | User login |
| **Properties** | `GET /api/properties` | Fetch all properties (with filters) |
| **Properties** | `POST /api/properties` | Create a new listing (Agent/Admin) |
| **Inquiries** | `POST /api/inquiries` | Send a property inquiry |
| **Users** | `GET /api/users/profile` | Get current user's profile |

---

## 🤝 Contributing

Constructive feedback is welcome! Please open an issue if you find any bugs.

---

**Developed by Mathiyarasan P**
