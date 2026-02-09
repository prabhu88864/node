import cron from "node-cron";
import Product from "../models/Product.js";

const CATEGORY_JOBS = {
  Electronics: { cron: "*/1 * * * *", pct: [-0.03, 0.07] },
  Fashion: { cron: "*/2 * * * *", pct: [-0.02, 0.05] },
  groceries: { cron: "*/3 * * * *", pct: [-0.01, 0.03] },
};

function scheduleCategory(category, { cron: cronExpr, pct: [minPct, maxPct] }) {
  cron.schedule(
    cronExpr,
    async () => {
      try {
        const query = { category };

        const result = await Product.updateMany(query, [
          {
            $set: {
              _r: {
                $add: [
                  minPct,
                  {
                    $multiply: [
                      { $rand: {} },
                      { $subtract: [maxPct, minPct] }
                    ]
                  }
                ]
              }
            }
          },
          {
            $set: {
              price: {
                $round: [
                  {
                    $min: [
                      "$maxPrice",
                      {
                        $max: [
                          "$minPrice",
                          { $multiply: ["$price", { $add: [1, "$_r"] }] }
                        ]
                      }
                    ]
                  },
                  0
                ]
              },
              lastUpdatedAt: "$$NOW"
            }
          },
          { $unset: "_r" }
        ]);

        const modified = result.modifiedCount ?? result.nModified ?? 0;
        console.log(`✅ [${category}] Updated ${modified} products @ ${new Date().toISOString()}`);
      } catch (err) {
        console.error(`❌ [${category}] Price scheduler error:`, err);
      }
    },
    { timezone: "Asia/Kolkata" }
  );
}

// Register schedulers for each category defined above
Object.entries(CATEGORY_JOBS).forEach(([cat, cfg]) => scheduleCategory(cat, cfg));
