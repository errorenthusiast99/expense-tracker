/**
 * Atlas Function: getTransactionAnalytics
 * HTTP Method: GET
 * Endpoint: /transactions/analytics/monthly?year=2024
 *           /transactions/analytics/categories?startDate=...&endDate=...
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

  const pathParts = request.path.split("/");
  const analyticsType = pathParts[pathParts.length - 1]; // "monthly" or "categories"

  const db = context.services.get("mongodb-atlas").db("expense_tracker");

  // ── Monthly summary ──────────────────────────────────────────────────────
  if (analyticsType === "monthly") {
    const year = parseInt(request.query.year) || new Date().getFullYear();
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const pipeline = [
      { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
    ];

    const raw = await db.collection("transactions").aggregate(pipeline).toArray();

    // Build 12-month array
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const summary = months.map((month, i) => {
      const monthNum = i + 1;
      const income = raw.find((r) => r._id.month === monthNum && r._id.type === "income")?.total ?? 0;
      const expense = raw.find((r) => r._id.month === monthNum && r._id.type === "expense")?.total ?? 0;
      return { month, income, expense, net: income - expense };
    });

    response.setStatusCode(200);
    return response.setBody(JSON.stringify(summary));
  }

  // ── Category breakdown ───────────────────────────────────────────────────
  if (analyticsType === "categories") {
    const { startDate, endDate } = request.query;
    const matchStage = { userId };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate + "T23:59:59.999Z");
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { categoryId: "$categoryId", type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ];

    const raw = await db.collection("transactions").aggregate(pipeline).toArray();

    // Get total per type for percentage calc
    const totalByType = {};
    for (const r of raw) {
      totalByType[r._id.type] = (totalByType[r._id.type] ?? 0) + r.total;
    }

    // Fetch categories
    const categoryIds = [...new Set(raw.map((r) => r._id.categoryId.toString()))];
    const categories = await db
      .collection("categories")
      .find({ _id: { $in: raw.map((r) => r._id.categoryId) } })
      .toArray();
    const catMap = new Map(categories.map((c) => [c._id.toString(), c]));

    const parentIds = categories.filter((c) => c.parentId).map((c) => c.parentId);
    const parents = await db
      .collection("categories")
      .find({ _id: { $in: parentIds } })
      .toArray();
    const parentMap = new Map(parents.map((p) => [p._id.toString(), p]));

    const breakdown = raw.map((r) => {
      const cat = catMap.get(r._id.categoryId.toString());
      const parent = cat?.parentId ? parentMap.get(cat.parentId.toString()) : null;
      const typeTotal = totalByType[r._id.type] || 1;
      return {
        categoryId: r._id.categoryId.toString(),
        categoryName: cat?.name ?? "Unknown",
        parentCategoryName: parent?.name ?? null,
        total: r.total,
        percentage: (r.total / typeTotal) * 100,
        type: r._id.type,
      };
    });

    response.setStatusCode(200);
    return response.setBody(JSON.stringify(breakdown));
  }

  response.setStatusCode(404);
  return response.setBody(JSON.stringify({ error: "Analytics endpoint not found" }));
};
