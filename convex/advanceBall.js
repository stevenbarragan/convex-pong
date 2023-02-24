import { mutation } from "./_generated/server";

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function calculateRightAngle(position, paddleLength) {
	return 140 * (100 - position) / paddleLength + 110
}

function calculateLeftAngle(position, paddleLength) {
	return 140 * position / paddleLength + 290
}

const step = 20;

export default mutation(async ({ db }, gameId, boardSize, ballSize, paddleWidth, paddleLength) => {
	var game = await db.get(gameId);

	if (game.status == 'playing') {
		var ball = await db.get(game.ballId);

		db.patch(game.ballId, {
			x: clamp(ball.x + (Math.cos(toRadians(ball.direction)) * step), 0, boardSize),
			y: clamp(ball.y + (Math.sin(toRadians(ball.direction)) * step), 0, boardSize)
		});

		const cos = Math.cos(toRadians(ball.direction));

		// to the right
		if(cos >= 0) {
			const right = await db.get(game.right);

			if (ball.x + ballSize >= boardSize - paddleWidth && ball.y >= right.position && ball.y <= right.position + paddleLength) {
				const newDirection = calculateRightAngle(ball.y - right.position, paddleLength);

				db.patch(ball._id, {direction: newDirection})
			} else if(ball.y <= 0){
				const newDirection = ball.direction + 90;

				db.patch(ball._id, {direction: newDirection})
			} else if(ball.y >= boardSize) {
				const newDirection = ball.direction - 90;

				db.patch(ball._id, {direction: newDirection})
			} else if(ball.x >= boardSize) {
				db.patch(ball._id, {
					direction: 180,
					x: boardSize / 2,
					y: boardSize / 2
				});

				db.patch(game._id, {
					countDown: 3,
					leftScore: game.leftScore + 1,
					status: 'reset'
				});
			}
		} else {
			const left = await db.get(game.left);

			if (ball.x <= paddleWidth + ballSize && ball.y >= left.position && ball.y <= left.position + paddleLength) {
				const newDirection = calculateLeftAngle(ball.y - left.position, paddleLength);

				db.patch(ball._id, {direction: newDirection})
			} else if(ball.y <= 0){
				const newDirection = ball.direction - 90;

				db.patch(ball._id, {direction: newDirection})
			} else if(ball.y >= boardSize) {
				const newDirection = ball.direction + 90;

				db.patch(ball._id, {direction: newDirection})
			} else if(ball.x <= 0) {
				db.patch(ball._id, {
					direction: 0,
					x: boardSize / 2,
					y: boardSize / 2
				});

				db.patch(game._id, {
					countDown: 3,
					rightScore: game.rightScore + 1,
					status: 'reset'
				})
			}
		}
	}
})
