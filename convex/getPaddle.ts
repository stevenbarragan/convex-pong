import { Id } from './_generated/dataModel';
import { query } from "./_generated/server";

export default query(async ({ db }, id: Id<'paddles'>) => {
  if (id) {
    return await db.get(id);
  }
});
