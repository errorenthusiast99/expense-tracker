/**
 * Atlas Function: getTransactions
 * HTTP Method: GET
 * Endpoint: /transactions
 *
 * Query params:
 *   startDate   - ISO date string
 *   endDate     - ISO date string
 *   categoryId  - ObjectId string
 *   type        - "income" | "expense"
 *   parentCategoryId - ObjectId string (filter by parent category's children)
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
  const { startDate, endDate, categoryId, type, parentCategoryId } = request.query;

  // Date range filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate + "T23:59:59.999Z");
  }

  // Type filter
  if (type && ["income", "expense"].includes(type)) {
    query.type = type;
  }

  // Category filter (direct or via parent)
  if (parentCategoryId) {
    const children = await db
      .collection("categories")
      .find({ userId, parentId: new BSON.ObjectId(parentCategoryId) })
      .toArray();
    const childIds = children.map((c) => c._id);
    query.categoryId = { $in: [new BSON.ObjectId(parentCategoryId), ...childIds] };
  } else if (categoryId) {
    query.categoryId = new BSON.ObjectId(categoryId);
  }

  const transactions = await db
    .collection("transactions")
    .find(query)
    .sort({ date: -1, createdAt: -1 })
    .toArray();

  response.setStatusCode(200);
  return response.setBody(JSON.stringify(transactions));
};
