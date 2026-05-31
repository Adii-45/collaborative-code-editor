# ⚡ Collaborative Code Editor

A real-time, premium collaborative code editor equipped with Monaco Editor, integrated terminal support, dynamic file explorer (drag-and-drop), and seamless Git integration. Designed for developer collaboration with high performance and visual excellence.

---

## ✨ Features

- **👥 Real-time Collaboration:** Edit code simultaneously with other developers in real-time, supported by Socket.io.
- **💻 Pro-grade Editor:** Powered by Microsoft's Monaco Editor (the core of VS Code) featuring autocomplete, multi-cursor, and syntax highlighting.
- **🐚 Integrated Terminal:** Features an interactive terminal window powered by `xterm.js` to run and view processes.
- **🗂️ Drag-and-Drop Workspace:** Easily organize and reposition panels and files using `@dnd-kit/core`.
- **🔐 Secure Authentication:** Seamless email/password credentials alongside built-in GitHub OAuth authentication.
- **🌿 Git-powered Repositories:** Direct server-side Git repository management using `simple-git`.
- **🎨 Premium Interface:** Crafted with a sleek dark-mode layout, Tailwind CSS, dynamic resizing, and fluid transition animations.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** React + Vite (Fast Build Tooling)
- **Styling:** Tailwind CSS + PostCSS
- **Editor:** `@monaco-editor/react`
- **Real-time:** `socket.io-client`
- **Terminal:** `xterm` + `@xterm/addon-fit`
- **Dnd & UI:** `@dnd-kit/core`, `react-resizable-panels`, `lucide-react`, `react-icons`
- **Routing:** `react-router-dom`

### Backend (Server)
- **Runtime:** Node.js + Express
- **Real-time:** `socket.io`
- **Database:** MongoDB (via Mongoose)
- **Security:** JWT (`jsonwebtoken`) & `bcryptjs`
- **Git Utilities:** `simple-git`
- **Environment:** `dotenv`

---

## 🚀 Quick Start Guide

Follow these steps to set up and run the application locally on your machine.

### 📋 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- A [GitHub Developer Account](https://github.com/settings/developers) (optional, for OAuth setup)

---

### ⚙️ Environment Configuration

#### 1. Backend Server Setup (`server/.env`)
Create a `.env` file in the `server` directory and configure the following variables:

```env
PORT=8001
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# GitHub OAuth Setup (Create an app at https://github.com/settings/developers)
# Homepage URL: http://localhost:5173
# Callback URL: http://localhost:5173/github/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8001/api/auth/github/callback
```

#### 2. Frontend Client Setup (`client/.env`)
Create a `.env` file in the `client` directory and configure the client credentials:

```env
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

---

### 🏃‍♂️ Running the Application

You need to start both the **backend server** and **frontend client** in separate terminal windows/sessions.

#### Option A: Start the Backend Server (Port `8001`)

1. Open your terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Start the server in development mode (with hot-reload):
   ```bash
   npm run dev
   ```
   *For production mode, run: `npm start`*

#### Option B: Start the Frontend Client (Port `5173`)

1. Open a new terminal window and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Once successfully started, open your browser and navigate to:
   ```url
   http://localhost:5173
   ```

---

## 📂 Project Structure

```text
code-editor/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # UI & Feature components (Editor, Terminal, Explorer)
│   │   ├── context/        # Socket & State context providers
│   │   ├── pages/          # Main page views (Auth, Workspace, Dashboard)
│   │   └── utils/          # Client helper functions & API configurations
│   ├── tailwind.config.js  # Styling guidelines
│   └── vite.config.js      # Bundler settings
│
└── server/                 # Backend Node/Express Server
    ├── config/             # DB & Passport authentication configs
    ├── controllers/        # Request handling logic
    ├── models/             # Mongoose schemas (Users, Projects, Files)
    ├── routes/             # RESTful API routing
    ├── services/           # Git operation wrappers & logic
    ├── socket/             # Real-time WebSocket room management
    └── server.js           # Server startup script
```
