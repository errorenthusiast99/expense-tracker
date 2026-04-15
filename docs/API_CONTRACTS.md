# API Contracts

All endpoints follow REST conventions and return JSON.
All requests (except Auth) require:

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Authentication

Atlas App Services handles auth natively. The frontend uses the Realm SDK HTTP API.

### Register

```
POST https://realm.mongodb.com/api/client/v2.0/app/{appId}/auth/providers/local-userpass/register

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: 201 No Body
```

### Login

```
POST https://realm.mongodb.com/api/client/v2.0/app/{appId}/auth/providers/local-userpass/login

Body:
{
  "username": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "user_id": "string",
  "access_token": "string",
  "refresh_token": "string",
  "device_id": "string"
}
```

### Refresh Token

```
POST https://realm.mongodb.com/api/client/v2.0/app/{appId}/auth/session

Headers:
  Authorization: Bearer <refresh_token>

Response 200:
{
  "access_token": "string"
}
```

---

## Transactions

### GET /transactions

Fetch all transactions for the authenticated user.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `startDate` | `string` (ISO) | Filter from date |
| `endDate` | `string` (ISO) | Filter to date |
| `categoryId` | `string` (ObjectId) | Filter by category |
| `parentCategoryId` | `string` (ObjectId) | Filter by parent + children |
| `type` | `"income" \| "expense"` | Filter by type |

**Response 200:**
```json
[
  {
    "_id": "ObjectId",
    "userId": "string",
    "amount": 5000,
    "type": "expense",
    "categoryId": "ObjectId",
    "date": "2024-03-01T00:00:00.000Z",
    "note": "Monthly groceries",
    "financialItemId": null,
    "createdAt": "2024-03-01T10:30:00.000Z"
  }
]
```

---

### POST /transactions

Create a new transaction.

**Request Body:**
```json
{
  "amount": 5000,
  "type": "expense",
  "categoryId": "ObjectId_string",
  "date": "2024-03-01",
  "note": "Optional note",
  "financialItemId": "ObjectId_string_or_null"
}
```

**Response 201:** Returns the created transaction document.

---

### PUT /transactions/:id

Update a transaction (partial update supported).

**Request Body:** Any subset of transaction fields.

**Response 200:** Returns the updated transaction document.

**Response 404:** `{ "error": "Transaction not found" }`

---

### DELETE /transactions/:id

Delete a transaction.

**Response 200:** `{ "success": true }`

**Response 404:** `{ "error": "Transaction not found" }`

---

### GET /transactions/analytics/monthly?year=2024

Get monthly income/expense summary for a year.

**Response 200:**
```json
[
  { "month": "Jan", "income": 50000, "expense": 30000, "net": 20000 },
  { "month": "Feb", "income": 50000, "expense": 25000, "net": 25000 }
]
```

---

### GET /transactions/analytics/categories

Get category-wise breakdown.

**Query Params:** `startDate`, `endDate` (optional)

**Response 200:**
```json
[
  {
    "categoryId": "ObjectId",
    "categoryName": "Stocks",
    "parentCategoryName": "Investments",
    "total": 15000,
    "percentage": 25.5,
    "type": "expense"
  }
]
```

---

## Categories

### GET /categories

**Response 200:**
```json
[
  {
    "_id": "ObjectId",
    "userId": "string",
    "name": "Investments",
    "parentId": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "_id": "ObjectId",
    "userId": "string",
    "name": "Stocks",
    "parentId": "ObjectId_of_Investments",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### POST /categories

**Request Body:**
```json
{
  "name": "Stocks",
  "parentId": "ObjectId_string_or_null"
}
```

**Response 201:** Returns created category.

**Validation:**
- Max 1 level of nesting (a child category cannot itself be a parent)

---

## Financial Items

### GET /financial-items

**Query Params:** `type` — `"loan" | "investment" | "asset" | "credit_card"` (optional)

**Response 200:**
```json
[
  {
    "_id": "ObjectId",
    "userId": "string",
    "name": "Home Loan - HDFC",
    "type": "loan",
    "meta": {
      "interestRate": 8.5,
      "emiAmount": 25000,
      "description": "30-year home loan"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### POST /financial-items

**Request Body:**
```json
{
  "name": "Nifty 50 Index Fund",
  "type": "investment",
  "meta": {
    "currentValue": 150000,
    "description": "Monthly SIP"
  }
}
```

**Response 201:** Returns created item.

---

### PUT /financial-items/:id

**Request Body:** Any subset of financial item fields. For `credit_card`, include `meta.totalLimit` (credit limit) and optionally `meta.outstandingBalance`.

**Response 200:** Returns updated item.

---

### DELETE /financial-items/:id

**Response 200:** `{ "success": true }`

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Human-readable error message"
}
```

| Status Code | Meaning |
|---|---|
| `400` | Bad request / validation error |
| `401` | Unauthenticated |
| `403` | Forbidden (ownership violation) |
| `404` | Resource not found |
| `405` | Method not allowed |
| `500` | Server error |
