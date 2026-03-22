# Migration Guide: Atlas Functions → Node.js Backend

This guide explains how to migrate from MongoDB Atlas Functions to a self-hosted
Node.js (Express or NestJS) backend **without any frontend changes**.

---

## Why This Is Easy

The frontend never talks directly to Atlas. It only talks to the `service layer` 
(`/src/services/`), which reads `NEXT_PUBLIC_API_BASE_URL` for the base URL.

**To migrate:**
1. Build a Node.js API that mirrors the same endpoints
2. Change `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Done.

No components, stores, or models need to change.

---

## Step 1: Create Your Node.js Project

```bash
# Express
npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors dotenv

# OR NestJS
npx @nestjs/cli new expense-tracker-api
npm install @nestjs/mongoose mongoose @nestjs/jwt bcryptjs
```

---

## Step 2: Bootstrap Express App

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Auth middleware
const authMiddleware = require('./middleware/auth');

// Routes
app.use('/api/transactions', authMiddleware, require('./routes/transactions'));
app.use('/api/categories', authMiddleware, require('./routes/categories'));
app.use('/api/financial-items', authMiddleware, require('./routes/financial-items'));
app.use('/api/auth', require('./routes/auth'));

mongoose.connect(process.env.MONGODB_URI);
app.listen(3001);
```

---

## Step 3: Implement Auth Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## Step 4: Implement Transaction Routes

```javascript
// routes/transactions.js
const router = require('express').Router();
const Transaction = require('../models/Transaction');

// GET /transactions
router.get('/', async (req, res) => {
  try {
    const query = { userId: req.userId };
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.date.$lte = new Date(req.query.endDate + 'T23:59:59Z');
    }
    if (req.query.type) query.type = req.query.type;
    if (req.query.categoryId) query.categoryId = req.query.categoryId;
    
    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /transactions
router.post('/', async (req, res) => {
  try {
    const tx = await Transaction.create({ ...req.body, userId: req.userId });
    res.status(201).json(tx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /transactions/:id
router.put('/:id', async (req, res) => {
  const tx = await Transaction.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true }
  );
  if (!tx) return res.status(404).json({ error: 'Not found' });
  res.json(tx);
});

// DELETE /transactions/:id
router.delete('/:id', async (req, res) => {
  const result = await Transaction.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
```

---

## Step 5: Mongoose Models

```javascript
// models/Transaction.js
const { Schema, model } = require('mongoose');

const TransactionSchema = new Schema({
  userId:          { type: String, required: true, index: true },
  amount:          { type: Number, required: true, min: 0.01 },
  type:            { type: String, enum: ['income', 'expense'], required: true },
  categoryId:      { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  date:            { type: Date, required: true },
  note:            { type: String, default: null },
  financialItemId: { type: Schema.Types.ObjectId, ref: 'FinancialItem', default: null },
  createdAt:       { type: Date, default: Date.now },
});

module.exports = model('Transaction', TransactionSchema);
```

---

## Step 6: Update Frontend Config

In `.env.local`:

```env
# Change from Atlas endpoint:
# NEXT_PUBLIC_API_BASE_URL=https://data.mongodb-api.com/app/xxx/endpoint

# To your Node.js backend:
NEXT_PUBLIC_API_BASE_URL=https://your-api.example.com/api
# OR for local dev:
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

Also update `AuthService` in `src/services/auth.service.ts` to point to your
own JWT auth endpoint instead of the Atlas auth endpoint.

---

## Auth Migration

The main difference is auth — Atlas uses its own JWT format, while your 
Node.js backend issues its own JWTs.

Update `src/services/auth.service.ts`:

```typescript
// Replace Atlas auth URL with your own:
async login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, payload);
  // Map your response to { user_id, access_token, refresh_token }
  const session = {
    userId: res.data.userId,
    email: payload.email,
    accessToken: res.data.token,
  };
  saveSession(session);
  return res.data;
},
```

---

## Mobile App Support (Flutter / React Native)

The same API contracts in `docs/API_CONTRACTS.md` apply.

For React Native, simply create a service layer using `fetch` or `axios` with the same endpoints and request/response formats.

For Flutter, use the `http` or `dio` package:

```dart
// Flutter example
final response = await http.get(
  Uri.parse('$baseUrl/transactions'),
  headers: {'Authorization': 'Bearer $accessToken'},
);
```

All API responses are plain JSON — no platform-specific encoding needed.
