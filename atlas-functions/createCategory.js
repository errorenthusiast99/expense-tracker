/**
 * Atlas Function: createCategory
 * HTTP Method: POST
 * Endpoint: /categories
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

  const { name, parentId } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    response.setStatusCode(400);
    return response.setBody(JSON.stringify({ error: "name is required" }));
  }

  const db = context.services.get("mongodb-atlas").db("expense_tracker");

  // Validate parent exists and belongs to the same user
  if (parentId) {
    const parent = await db.collection("categories").findOne({
      _id: new BSON.ObjectId(parentId),
      userId,
    });
    if (!parent) {
      response.setStatusCode(400);
      return response.setBody(JSON.stringify({ error: "Parent category not found" }));
    }
    // Prevent deep nesting — only one level of hierarchy
    if (parent.parentId) {
      response.setStatusCode(400);
      return response.setBody(JSON.stringify({ error: "Cannot nest more than one level deep" }));
    }
  }

  const doc = {
    userId,
    name: name.trim(),
    parentId: parentId ? new BSON.ObjectId(parentId) : null,
    createdAt: new Date(),
  };

  const result = await db.collection("categories").insertOne(doc);
  const inserted = { ...doc, _id: result.insertedId };

  response.setStatusCode(201);
  return response.setBody(JSON.stringify(inserted));
};
