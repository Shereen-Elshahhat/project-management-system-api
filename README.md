# Project Management System API

A secure, modular, and feature-rich REST API built with Node.js, Express, and MongoDB/Mongoose. This system supports role-based user management, project management, and task management with secure short-lived access tokens, refresh token rotation, and transactional/cascading data flows.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: version 18.x or higher
- **MongoDB**: Standalone or Replica Set server running locally or in the cloud.

### 2. Installation
Clone the repository, navigate to the project directory, and install dependency packages:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and populate it with the following configuration:
```env
PORT=3005
MONGO_URI=mongodb://127.0.0.1:27017/project-management
JWT_SECRET=supersecretjwtkey123!
REFRESH_TOKEN_SECRET=supersecretrefreshtokenkey123!
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password-or-app-password
EMAIL_SERVICE=gmail
EMAIL_PORT=587
EMAIL_SECURE=false
```

---

## 🛠️ Running the Project

### Database Seeding
To seed initial developers and admin accounts for local development, run the database seed script:
```bash
# Set NODE_ENV to development when running the seeder
$env:NODE_ENV="development"; npm run db:seed
```
*Seeded Accounts:*
- **Admin**: `admin@example.com` / Password: `Password123`
- **User**: `user@example.com` / Password: `Password123`

### Start Development Server
To launch the server locally using nodemon:
```bash
$env:NODE_ENV="development"; npm run dev
```
The server will start on port `3005` (or your configured `PORT` variable) and log:
```
Server is running on port 3005
db connected successfully
```

---

## 📂 Modules & Architecture

The codebase follows a modular clean-code architectural layout under `src/`:
- **`src/modules/`**: Contains separate directories for core domain models:
  - **`auth/`**: Account creation, validation, email verification, session management.
  - **`projects/`**: Project creation, ownership checks, cascading deletes.
  - **`tasks/`**: Task creation, assignments, and status query filters.
  - **`user/`**: Profile queries, admin-level operations, roles management.
- **`src/middleWare/`**: Houses Express routing gatekeepers:
  - `auth.js`: Implements access token signature decoding and role guards.
  - `validator.js`: General schema payload check wrapper.
  - `globalError.js`: Application-wide exception parser.
- **`src/utils/`**: General reusable business helpers (APIFeatures, emails, custom errors, Joi defaults).

---

## 🔌 API Endpoints Summary

All routes are mounted relative to the root URL (e.g., `http://127.0.0.1:3005`).

### 👤 Authentication Module (`/auth`)
| HTTP Method | Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | No | Registers an inactive user and triggers verification code email. |
| **POST** | `/auth/verify-account`| No | Verifies account using the code sent on registration. |
| **POST** | `/auth/resend-verification` | No | Resends the verification code email. |
| **POST** | `/auth/login` | No | Generates access token and sets secure refresh token. |
| **POST** | `/auth/refresh-token` | No | Rotates refresh token and issues fresh access token. |
| **POST** | `/auth/forgetPassword`| No | Generates password reset OTP code. |
| **POST** | `/auth/verifyOTP` | No | Verifies the password reset OTP code. |
| **POST** | `/auth/resetPassword` | No | Overwrites password with new credentials. |
| **POST** | `/auth/change-password`| Yes | Changes password for the authenticated user session. |
| **POST** | `/auth/logout` | Yes | Revokes active refresh token from the database. |

### 👥 Users Module (`/users`)
| HTTP Method | Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/users/me` | Yes | Retrieves current authenticated profile. |
| **GET** | `/users` | Yes (Admin) | Lists and filters all registered users. |
| **GET** | `/users/get/:id` | Yes (Admin) | Gets details of a specific user. |
| **POST** | `/users/add` | Yes (Admin) | Direct user creation by admin. |
| **PUT** | `/users/update` | Yes (Admin/User)| Updates profile fields (Only admin can change user roles). |
| **DELETE**| `/users/:id` | Yes (Admin) | Deletes a user profile (Self-deletion is forbidden). |

### 📁 Projects Module (`/projects`)
| HTTP Method | Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/projects` | Yes (Admin) | Creates a project. |
| **GET** | `/projects` | Yes | Lists projects (Admins see all; Users see project teams they belong to). |
| **GET** | `/projects/:id` | Yes | Gets details of a project (Must be admin or project team member). |
| **PUT** | `/projects/:id` | Yes (Admin) | Updates project settings and team members. |
| **DELETE**| `/projects/:id` | Yes (Admin) | Cascading deletion of project and all related tasks. |

### 📋 Tasks Module (`/Tasks`)
| HTTP Method | Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/Tasks` | Yes (Admin) | Creates task and assigns it to a project team member. |
| **GET** | `/Tasks` | Yes | Lists tasks (Admins see all; Users see tasks assigned to them). |
| **GET** | `/Tasks/:id` | Yes | Retrieves details of a specific task. |
| **PUT** | `/Tasks/:id` | Yes | Updates task status, assigned developer, or details. |
| **DELETE**| `/Tasks/:id` | Yes | Deletes a specific task. |

---

## 🧪 Testing Suite

The project includes an integration testing suite running on Node.js's native test runner (requiring zero external npm dependencies):
```bash
# Run the test scripts
npm test
```
