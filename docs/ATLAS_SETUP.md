# ExpenseTracker — Setup Guide

## Prerequisites

- Node.js 18+
- A MongoDB Atlas account
- An Atlas App Services (previously Realm) application

---

## 1. MongoDB Atlas Setup

### 1.1 Create a Cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user with read/write access
4. Whitelist your IP (or `0.0.0.0/0` for development)

### 1.2 Create Database & Collections

In Atlas Data Explorer, create database `expense_tracker` with these collections:

```
expense_tracker
├── transactions
├── categories
└── financial_items
```

### 1.3 Create Indexes

In Atlas, go to each collection and create these indexes for performance:

**transactions:**
```json
{ "userId": 1, "date": -1 }
{ "userId": 1, "type": 1 }
{ "userId": 1, "categoryId": 1 }
```

**categories:**
```json
{ "userId": 1, "name": 1 }
{ "userId": 1, "parentId": 1 }
```

**financial_items:**
```json
{ "userId": 1, "type": 1 }
```

---

## 2. Atlas App Services Setup

### 2.1 Create an App

1. In Atlas, go to **App Services** → **Create Application**
2. Name it `expense-tracker`
3. Link to your cluster

### 2.2 Enable Email/Password Authentication

1. Go to **Authentication** → **Email/Password**
2. Enable the provider
3. Set **User Confirmation Method** to "Automatically Confirm Users" (for quick dev) or configure email confirmation
4. Save & Deploy

### 2.3 Configure Database Rules

In **Rules**, for each collection, set:

```json
{
  "read": {
    "userId": "%%user.id"
  },
  "write": {
    "userId": "%%user.id"
  }
}
```

This ensures users can only access their own data.

### 2.4 Create HTTP Endpoints (Functions)

For each file in `/atlas-functions/`, create an HTTPS Endpoint:

| Function File | Endpoint Route | HTTP Method |
|---|---|---|
| `getTransactions.js` | `/transactions` | GET |
| `createTransaction.js` | `/transactions` | POST |
| `updateTransaction.js` | `/transactions/:id` | PUT |
| `deleteTransaction.js` | `/transactions/:id` | DELETE |
| `getTransactionAnalytics.js` | `/transactions/analytics/monthly` | GET |
| `getTransactionAnalytics.js` | `/transactions/analytics/categories` | GET |
| `getCategories.js` | `/categories` | GET |
| `createCategory.js` | `/categories` | POST |
| `getFinancialItems.js` | `/financial-items` | GET |
| `createFinancialItem.js` | `/financial-items` | POST |
| `updateFinancialItem.js` | `/financial-items/:id` | PUT |
| `deleteFinancialItem.js` | `/financial-items/:id` | DELETE |

For each endpoint:
- Set **Authentication** to `Application Authentication`
- Enable **Respond with result** = ON

### 2.5 Get Your App ID

In App Settings, note your **App ID** (format: `expense-tracker-xxxxx`)

---

## 3. Frontend Setup

```bash
# Clone the repository
git clone <your-repo> expense-tracker
cd expense-tracker

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
```

### 3.1 Configure Environment Variables

Edit `.env.local`:

```env
NEXT_PUBLIC_ATLAS_APP_ID=expense-tracker-xxxxx
NEXT_PUBLIC_API_BASE_URL=https://data.mongodb-api.com/app/expense-tracker-xxxxx/endpoint
```

> **Finding the endpoint URL:** In Atlas App Services → HTTPS Endpoints, each endpoint shows its full URL.

### 3.2 Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3.3 Build for Production

```bash
npm run build
npm start
```

---

## 4. First-Time Usage

1. Navigate to `/register` and create an account
2. Go to **Categories** and create your category hierarchy
   - Example: `Investments` → `Stocks`, `Mutual Funds`
   - Example: `Living` → `Food`, `Transport`, `Utilities`
3. Go to **Financial Items** and add any loans/investments you track
4. Start adding **Transactions**!
5. View your **Analytics** for insights

---

## 5. Deploy to Production

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard under Project → Settings → Environment Variables.

### Netlify

```bash
npm run build
# Deploy the .next directory
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
