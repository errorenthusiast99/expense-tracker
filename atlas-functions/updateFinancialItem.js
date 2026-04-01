/**
 * Atlas Function: updateFinancialItem
 * HTTP Method: PUT
 * Endpoint: /financial-items/:id
 */

exports = async function (request, response) {
  response.setHeader("Content-Type", "application/json");

  if (request.method !== "PUT") {
    response.setStatusCode(405);
    return response.setBody(JSON.stringify({ error: "Method not allowed" }));
  }

  const userId = context.user?.id;
  if (!userId) {
    response.setStatusCode(401);
    return response.setBody(JSON.stringify({ error: "Unauthorized" }));
  }

  const pathParts = request.path.split("/");
  const itemId = pathParts[pathParts.length - 1];

  if (!itemId) {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "Item ID is required" }));
  }

  let body;
  try {
    body = JSON.parse(request.body.text());
  } catch {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "Invalid JSON body" }));
  }

  const { name, type, meta } = body;
  const updateFields = {};

  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      response.setStatusCode(400);
      return response.setBody(JSON.stringify({ error: "name cannot be empty" }));
    }
    updateFields.name = name.trim();
  }
  if (type !== undefined) {
    if (!["loan", "investment", "asset", "credit_card"].includes(type)) {
      response.setStatusCode(400);
      return response.setBody(JSON.stringify({ error: "Invalid type" }));
    }
    updateFields.type = type;
  }
  if (meta !== undefined) updateFields.meta = meta;

  const db = context.services.get("mongodb-atlas").db("expense_tracker");
  const result = await db.collection("financial_items").findOneAndUpdate(
    { _id: new BSON.ObjectId(itemId), userId },
    { $set: updateFields },
    { returnNewDocument: true }
  );

  if (!result) {
    response.setStatusCode(404);
    return response.setBody(JSON.stringify({ error: "Item not found" }));
  }

  response.setStatusCode(200);
  return response.setBody(JSON.stringify(result));
};
