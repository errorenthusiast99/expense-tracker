/**
 * Atlas Function: deleteFinancialItem
 * HTTP Method: DELETE
 * Endpoint: /financial-items/:id
 */

exports = async function (request, response) {
  response.setHeader("Content-Type", "application/json");

  if (request.method !== "DELETE") {
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

  const db = context.services.get("mongodb-atlas").db("expense_tracker");
  const result = await db.collection("financial_items").deleteOne({
    _id: new BSON.ObjectId(itemId),
    userId,
  });

  if (result.deletedCount === 0) {
    response.setStatusCode(404);
    return response.setBody(JSON.stringify({ error: "Item not found" }));
  }

  response.setStatusCode(200);
  return response.setBody(JSON.stringify({ success: true }));
};
