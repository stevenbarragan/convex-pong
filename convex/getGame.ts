import { Id } from './_generated/dataModel';
import { query } from "./_generated/server";

export default query(async ({ db }, gameId: Id<'games'>) => {
  if (gameId) {
    return await db.get(gameId);
  }
});
