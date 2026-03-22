/**
 * Atlas Function: deleteTransaction
 * HTTP Method: DELETE
 * Endpoint: /transactions/:id
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
  const transactionId = pathParts[pathParts.length - 1];

  if (!transactionId) {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "Transaction ID is required" }));
  }

  const db = context.services.get("mongodb-atlas").db("expense_tracker");
  const result = await db.collection("transactions").deleteOne({
    _id: new BSON.ObjectId(transactionId),
    userId, // Enforce ownership — users can only delete their own data
  });

  if (result.deletedCount === 0) {
    response.setStatusCode(404);
    return response.setBody(JSON.stringify({ error: "Transaction not found" }));
  }

  response.setStatusCode(200);
  return response.setBody(JSON.stringify({ success: true }));
};
