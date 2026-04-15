/**
 * Atlas Function: getFinancialItems
 * HTTP Method: GET
 * Endpoint: /financial-items
 *
 * Optional query: ?type=loan|investment|asset|credit_card
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
  const query = { userId };

  const { type } = request.query;
  if (type && ["loan", "investment", "asset", "credit_card"].includes(type)) {
    query.type = type;
  }

  const items = await db
    .collection("financial_items")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  response.setStatusCode(200);
  return response.setBody(JSON.stringify(items));
};
