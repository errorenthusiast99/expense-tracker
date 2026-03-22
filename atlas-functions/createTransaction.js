/**
 * Atlas Function: createTransaction
 * HTTP Method: POST
 * Endpoint: /transactions
 *
 * Authorization: Requires authenticated user (Atlas Auth)
 * Body: { amount, type, categoryId, date, note?, financialItemId? }
 */

exports = async function (request, response) {
  response.setHeader("Content-Type", "application/json");

  // Only allow POST
  if (request.method !== "POST") {
    response.setStatusCode(405);
    return response.setBody(JSON.stringify({ error: "Method not allowed" }));
  }

  // Require authenticated user
  const userId = context.user?.id;
  if (!userId) {
    response.setStatusCode(401);
    return response.setBody(JSON.stringify({ error: "Unauthorized" }));
  }

  let body;
  try {
    body = JSON.parse(request.body.text());
  } catch {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "Invalid JSON body" }));
  }

  const { amount, type, categoryId, date, note, financialItemId } = body;

  // Validate required fields
  if (typeof amount !== "number" || amount <= 0) {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "amount must be a positive number" }));
  }
  if (!["income", "expense"].includes(type)) {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "type must be 'income' or 'expense'" }));
  }
  if (!categoryId) {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "categoryId is required" }));
  }
  if (!date) {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "date is required" }));
  }

  const db = context.services.get("mongodb-atlas").db("expense_tracker");
  const collection = db.collection("transactions");

  const doc = {
    userId,
    amount,
    type,
    categoryId: new BSON.ObjectId(categoryId),
    date: new Date(date),
    note: note || null,
    financialItemId: financialItemId ? new BSON.ObjectId(financialItemId) : null,
    createdAt: new Date(),
  };

  const result = await collection.insertOne(doc);
  const inserted = { ...doc, _id: result.insertedId };

  response.setStatusCode(201);
  return response.setBody(JSON.stringify(inserted));
};
