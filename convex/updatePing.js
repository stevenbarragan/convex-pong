import { mutation } from "./_generated/server";

export default mutation(async ({ db }, gameId, player) => {
	var pingToUpdate = null;
	var pingToCheck = null;

	const game = await db.get(gameId);

	if (player == 'left') {
		pingToUpdate = game.leftPing;
		pingToCheck = game.rightPing;
	} else {
		pingToUpdate = game.rightPing;
		pingToCheck = game.leftPing;
	}

	const now = Math.floor(Date.now() / 1000)

	db.patch(pingToUpdate, { time: now })

	if (game.status !== 'waiting' && game.status != 'ready') {
		const ping = await db.get(pingToCheck);

		if (now - ping.time > 3) {
			db.patch(gameId, {status: 'disconnected'})
		}
	}
});
