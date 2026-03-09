# Coin-Change-Dev

College Project by **Soumik Biswas**.

A full-stack web application that solves the classic **Coin Change Problem** using both **Greedy** and **Dynamic Programming (DP)** algorithms. This project provides a comparative analysis of the two approaches, including visualization of algorithm efficiency.

## 🚀 Tech Stack

### Frontend

- **Core Unit**: React 18, React Router DOM (v6)
- **Build Tool**: Vite
- **Styling**: SCSS (Sass) and standard CSS
- **Visualization**: Chart.js & react-chartjs-2
- **Authentication**: Google OAuth (`@react-oauth/google`)

### Backend

- **Environment**: Node.js, Express.js
- **Database**: SQLite (via `sql.js`)
- **Security**: JWT (`jsonwebtoken`) and `bcryptjs`

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation & Setup

1. **Backend Setup**
   Open a terminal and run:

   ```bash
   cd backend
   npm install
   # Copy .env.example to .env and fill in required variables (e.g., JWT_SECRET)
   npm run dev
   ```

2. **Frontend Setup**
   Open a new terminal and run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Access the frontend at `http://localhost:5173`.

## 🧠 Core Algorithms

The core of the application lies in `backend/utils/coinChangeAlgorithms.js`, featuring two main approaches:

1. **Greedy Algorithm**: Fast (`O(n log n)`) approach that iteratively picks the largest possible coin. Works optimally for standard currencies but may fail for some arbitrary coin systems.
2. **Dynamic Programming (DP) Algorithm**: Mathematically robust (`O(amount × coins)`) and guarantees the absolute minimum number of coins for any given coin denomination system.

The application includes a **Comparison Engine** that runs both algorithms side-by-side to evaluate and highlight which approach yields the mathematically optimal result.

## 📖 Complete Documentation

For an in-depth explanation of the build process, algorithm logic, and comparison engine details, please refer to the [Project Documentation](PROJECT_DOCUMENTATION.md).
