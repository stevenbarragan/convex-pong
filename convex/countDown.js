import { mutation } from "./_generated/server";

export default mutation(async ({ db }, gameId) => {
	var game = await db.get(gameId);

	if (game.countDown == 1 ) {
		db.patch(gameId, {
			status: 'kickball'
		})
	} else {
		db.patch(gameId, {
			countDown: game.countDown - 1
		})
	}
})
