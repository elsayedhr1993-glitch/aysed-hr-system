if (process.env.NODE_ENV === "production") { import("./testserver.cjs"); } else { import("./testserver2.ts"); }
