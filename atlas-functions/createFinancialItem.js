/**
 * Atlas Function: createFinancialItem
 * HTTP Method: POST
 * Endpoint: /financial-items
 */

exports = async function (request, response) {
  response.setHeader("Content-Type", "application/json");

  if (request.method !== "POST") {
    response.setStatusCode(405);
    return response.setBody(JSON.stringify({ error: "Method not allowed" }));
  }

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

  const { name, type, meta } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "name is required" }));
  }
  if (!["loan", "investment", "asset", "credit_card"].includes(type)) {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "type must be 'loan', 'investment', 'asset', or 'credit_card'" }));
  }

  const db = context.services.get("mongodb-atlas").db("expense_tracker");

  const doc = {
    userId,
    name: name.trim(),
    type,
    meta: meta || {},
    createdAt: new Date(),
  };

  const result = await db.collection("financial_items").insertOne(doc);
  const inserted = { ...doc, _id: result.insertedId };

  response.setStatusCode(201);
  return response.setBody(JSON.stringify(inserted));
};
