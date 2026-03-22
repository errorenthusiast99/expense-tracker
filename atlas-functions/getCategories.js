/**
 * Atlas Function: getCategories
 * HTTP Method: GET
 * Endpoint: /categories
 */

exports = async function (request, response) {
  response.setHeader("Content-Type", "application/json");

  if (request.method !== "GET") {
    response.setStatusCode(405);
    return response.setBody(JSON.stringify({ error: "Method not allowed" }));
  }

  const userId = context.user?.id;
  if (!userId) {
    response.setStatusCode(401);
    return response.setBody(JSON.stringify({ error: "Unauthorized" }));
  }

  const db = context.services.get("mongodb-atlas").db("expense_tracker");

  const categories = await db
    .collection("categories")
    .find({ userId })
    .sort({ name: 1 })
    .toArray();

  response.setStatusCode(200);
  return response.setBody(JSON.stringify(categories));
};
