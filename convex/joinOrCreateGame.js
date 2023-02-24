import { mutation } from "./_generated/server";

export default mutation(async ({ db }, boardSize, paddleSize) => {
	var waiting = await db
		.query('games')
		.filter((q) => q.eq(q.field('status'), 'waiting'))
		.first();

	if (waiting !== null) {
		await db.patch(waiting._id, {status: 'ready'});

		return {
			id: waiting._id,
			player: 'right'
		}
	}

	const ballId = await db.insert("balls", {
		direction: 0,
		x: boardSize / 2,
		y: boardSize / 2
	});

	const left = await db.insert("paddles", {
		position: (boardSize - paddleSize) / 2
	})

	const right = await db.insert("paddles", {
		position: (boardSize - paddleSize) / 2
	})

	const gameData = {
		status: 'waiting',
		countDown: 3,
		ballId,
		left,
		right,
		leftScore: 0,
		rightScore: 0
	};

	const game = await db.insert("games", gameData);

	return {
		id: game,
		player: 'left'
	}
})
