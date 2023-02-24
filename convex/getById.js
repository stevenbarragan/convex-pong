import { query } from "./_generated/server";

export default query(async ({ db }, id) => {
  if (id) {
    return await db.get(id);
  }
});
