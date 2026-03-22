/**
 * Atlas Function: updateTransaction
 * HTTP Method: PUT
 * Endpoint: /transactions/:id
 *
 * Body: Partial transaction fields to update
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

  // Extract transaction ID from path: /transactions/{id}
  const pathParts = request.path.split("/");
  const transactionId = pathParts[pathParts.length - 1];

  if (!transactionId) {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "Transaction ID is required" }));
  }

  let body;
  try {
    body = JSON.parse(request.body.text());
  } catch {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "Invalid JSON body" }));
  }

  const { amount, type, categoryId, date, note, financialItemId } = body;

  const updateFields = {};
  if (amount !== undefined) {
    if (typeof amount !== "number" || amount <= 0) {
      response.setStatusCode(400);
      return response.setBody(JSON.stringify({ error: "amount must be a positive number" }));
    }
    updateFields.amount = amount;
  }
  if (type !== undefined) {
    if (!["income", "expense"].includes(type)) {
      response.setStatusCode(400);
      return response.setBody(JSON.stringify({ error: "type must be 'income' or 'expense'" }));
    }
    updateFields.type = type;
  }
  if (categoryId !== undefined) updateFields.categoryId = new BSON.ObjectId(categoryId);
  if (date !== undefined) updateFields.date = new Date(date);
  if (note !== undefined) updateFields.note = note || null;
  if (financialItemId !== undefined) {
    updateFields.financialItemId = financialItemId ? new BSON.ObjectId(financialItemId) : null;
  }

  const db = context.services.get("mongodb-atlas").db("expense_tracker");
  const result = await db.collection("transactions").findOneAndUpdate(
    { _id: new BSON.ObjectId(transactionId), userId },
    { $set: updateFields },
    { returnNewDocument: true }
  );

  if (!result) {
    response.setStatusCode(404);
    return response.setBody(JSON.stringify({ error: "Transaction not found" }));
  }

  response.setStatusCode(200);
  return response.setBody(JSON.stringify(result));
};
