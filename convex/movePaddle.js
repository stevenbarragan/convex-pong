import { mutation } from "./_generated/server";

export default mutation(async ({ db }, gameId, player, position, boardSize, paddleLength) => {
	var game = await db.get(gameId);

	const step = 20 * position;

	if (player == 'left') {
		const paddle = await db.get(game.left);
		const newPosition = paddle.position + step;

		if (newPosition >= 0 && newPosition <= boardSize - paddleLength ) {
			db.patch(paddle._id, { position: newPosition })
		}
	} else {
		const paddle = await db.get(game.right);
		const newPosition = paddle.position + step;

		if (newPosition >= 0 && newPosition <= boardSize - paddleLength) {
			db.patch(paddle._id, { position: newPosition })
		}
	}
})
