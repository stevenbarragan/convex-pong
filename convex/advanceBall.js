import { mutation } from "./_generated/server";

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function calculateRightAngle(position, paddleLength) {
	return 140 * (paddleLength - position) / paddleLength + 110
}

function calculateLeftAngle(position, paddleLength) {
	return 140 * position / paddleLength + 290
}

const step = 20;

export default mutation(async ({ db }, gameId, boardSize, ballSize, paddleWidth, paddleLength) => {
	var game = await db.get(gameId);

	if (game.status == 'playing') {
		var ball = await db.get(game.ballId);

		const x = clamp(ball.x + (Math.cos(toRadians(ball.direction)) * step), 0, boardSize);
		const y = clamp(ball.y + (Math.sin(toRadians(ball.direction)) * step), ballSize, boardSize - ballSize);

		db.patch(game.ballId, {x ,y});

		const cos = Math.cos(toRadians(ball.direction));

		// to the right
		if(cos >= 0) {
			const right = await db.get(game.right);

			if (x + ballSize >= boardSize - paddleWidth && y >= right.position && y <= right.position + paddleLength) {
				const newDirection = calculateRightAngle(y - right.position, paddleLength);

				db.patch(ball._id, {direction: newDirection})
			} else if(y <= ballSize){
				const newDirection = ball.direction + 90;

				db.patch(ball._id, {direction: newDirection})
			} else if(y >= boardSize - ballSize) {
				const newDirection = ball.direction - 90;

				db.patch(ball._id, {direction: newDirection})
			} else if(x >= boardSize) {
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

			if (x <= paddleWidth + ballSize && y >= left.position && y <= left.position + paddleLength) {
				const newDirection = calculateLeftAngle(y - left.position, paddleLength);

				db.patch(ball._id, {direction: newDirection})
			} else if(y <= ballSize){
				const newDirection = ball.direction - 90;

				db.patch(ball._id, {direction: newDirection})
			} else if(y >= boardSize - ballSize) {
				const newDirection = ball.direction + 90;

				db.patch(ball._id, {direction: newDirection})
			} else if(x <= 0) {
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
