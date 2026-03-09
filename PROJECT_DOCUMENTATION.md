# Coin-Change-Dev Project Documentation

This document provides complete details on the tech stack used, how to build the project, how to run it, and an in-depth explanation of the algorithms powering the application.

---

## 1. What is Used in the Build (Tech Stack & Tools)

The application is built using a modern full-stack JavaScript architecture, split into two main parts: **Frontend** and **Backend**.

### Frontend Stack

- **Core Library**: React 18
- **Build Tool / Bundler**: Vite (lightning-fast cold server start and HMR)
- **Routing**: React Router DOM (v6)
- **Styling**: SCSS (Sass) and standard CSS
- **Charting / Visualization**: Chart.js & react-chartjs-2 (for visualizing algorithm efficiency)
- **Authentication**: Google OAuth (`@react-oauth/google`)

### Backend Stack

- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (via `sql.js` for lightweight, file-based SQL storage)
- **Security & Auth**: `jsonwebtoken` (JWT) for secure session handling and `bcryptjs` for password hashing/security.
- **CORS**: Cross-Origin Resource Sharing enabled for frontend-backend communication.

---

## 2. How to Build the Project

### Prerequisites

Make sure you have **Node.js** (v18+ recommended) and **npm** installed on your system.

### Frontend Build Process

The frontend uses Vite, which compiles and bundles the React components.

1. Open a terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a production build:
   ```bash
   npm run build
   ```
   _This command creates an optimized, minified production build inside the `dist/` directory, ready to be served by any static web server._

### Backend Build Process

Since the backend uses plain Node.js and CommonJS modules, there is no explicit "build" step required (no TypeScript or Babel compilation).

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 3. How to Work / Run the Application Locally

You need to run both the frontend and backend servers concurrently for the app to function correctly.

### Step-by-Step Execution

**Terminal 1: Start the Backend Server**

1. Navigate to the `backend` folder.
2. Copy the `.env.example` to `.env` and fill in any required variables (like `JWT_SECRET`).
3. Run the development server:
   ```bash
   npm run dev
   # OR
   npm start
   ```
   _(This executes `node server.js` and usually runs on `http://localhost:5000` or `8080`)_

**Terminal 2: Start the Frontend Application**

1. Navigate to the `frontend` folder.
2. Run the Vite development server:
   ```bash
   npm run dev
   ```
   _(This spins up the Vite server, usually accessible at `http://localhost:5173`)_
3. Open the provided `localhost` URL in your web browser.

---

## 4. Full Algorithm Details (The Core Engine)

The core purpose of this application is to solve the classic **Coin Change Problem**. The backend implements two distinct algorithms to calculate the minimum number of coins needed to make a specific amount.

The algorithms reside in `backend/utils/coinChangeAlgorithms.js`.

### A. The Greedy Algorithm

**How it works:**
The greedy algorithm sorts the available coins in descending order (largest first) and iteratively subtracts the largest possible coin denomination from the remaining amount until the amount becomes zero.

**Pros & Cons:**

- **Speed**: Very fast, Time Complexity is **O(n log n)** (due to sorting, then O(n) for processing).
- **Accuracy**: It is _not_ guaranteed to find the optimal solution for all hypothetical coin systems. However, for standard US/EU currency systems (e.g., 1, 5, 10, 25), it reliably finds the optimal result.

**Implementation Logic:**

1. Sort coins descending: `[25, 10, 5, 1]`.
2. Loop through each coin.
3. If coin <= remaining amount, find how many times it fits: `count = Math.floor(remaining / coin)`.
4. Subtract `coin * count` from remaining amount.
5. Move to the next smallest coin.

### B. The Dynamic Programming (DP) Algorithm

**How it works:**
Dynamic programming solves the problem by breaking it down into smaller sub-problems. It builds a table (`dp` array) from 0 up to the target amount, finding the absolute minimum coins needed for every incremental value.

**Pros & Cons:**

- **Speed**: Slower than greedy. Time Complexity is **O(amount × number_of_coins)**. Space Complexity is **O(amount)**.
- **Accuracy**: It inherently guarantees the _absolute mathematically minimum_ number of coins for **any** arbitrary coin denomination system (e.g., if you have weird coins like 1, 3, 4 and need change for 6. Greedy gives 4+1+1 (3 coins), DP correctly gives 3+3 (2 coins)).

**Implementation Logic:**

1. Initialize an array `dp` of size `amount + 1` filled with `Infinity` (representing unattainable amounts), except `dp[0] = 0`.
2. Maintain an auxiliary array `coinUsed` to backtrack which coins were selected.
3. Loop from `i = 1` up to `amount`.
4. For each `i`, loop through every available `coin`.
5. If `coin <= i` and `dp[i - coin] + 1 < dp[i]`, update `dp[i]` with the new minimum and log the coin in `coinUsed[i]`.
6. Once complete, `dp[amount]` holds the minimum coins. Backtrack using `coinUsed` to map out the exact denominations.

### C. The Comparison Engine

The application also features a "Both / Compare" mechanism. When triggered:

1. It runs both the Greedy and DP algorithms side-by-side.
2. It analyses the output.
3. It evaluates if the Greedy algorithm successfully found the optimal solution or if it failed/provided a suboptimal coin count compared to DP.
4. It finally returns a "Recommendation" highlighting which approach was mathematically best or if they tied.
