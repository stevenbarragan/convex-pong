import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

const W_KEY = 87; // up
const S_KEY = 83; // down

const K_KEY = 75; // up
const J_KEY = 74; // down

const paddleLength = 100;
const paddleWidth = 10;
const boardSize = 600;
const ballSize = 20;

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function calculateRightAngle(position) {
	return 140 * (100 - position) / paddleLength + 110
}

function calculateLeftAngle(position) {
	return 140 * position / paddleLength + 290
}

function invertAngle(angle) {
	return angle + 180
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function App() {
	const [boardSvg, setBoardSvg] = useState(null);
	const [leftPaddle, setLeftPaddle] = useState(null);
	const [rightPaddle, setRightPaddle] = useState(null);
	const [ball, setBall] = useState(null);
	const [ballPosition, setBallPosition] = useState({x: boardSize / 2 - 10, y: boardSize / 2 - 10});
	const [leftPosition, setLeftPosition] = useState(0);
	const [rightPosition, setRightPosition] = useState(0);
	const [leftScore, setLeftScore] = useState(0);
	const [rightScore, setRightScore] = useState(0);
	const [direction, setDirection] = useState(0);
	const [text, setText] = useState(null)
	const [countDown, setCountDown] = useState(3)
	const [countDownInterval, setCountDownInterval] = useState(null);
	const [gameInterval, setGameInterval] = useState();
	const [gameStarted, setGameStarted] = useState(false);

	useEffect(() => {
		if (boardSvg == null) {
			var svg = d3.select(".app")
				.append("svg")
				.attr("width", boardSize)
				.attr("height", boardSize)
				.style("background-color", 'white');

			setBoardSvg(svg);

			var left = svg.append('rect')
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', paddleWidth)
				.attr('height', paddleLength)
				.attr('stroke', 'black')
				.attr('fill', 'orange');

			setLeftPaddle(left);

			var right = svg.append('rect')
				.attr('x', boardSize - paddleWidth)
				.attr('y', 0)
				.attr('width', paddleWidth)
				.attr('height', paddleLength)
				.attr('stroke', 'black')
				.attr('fill', 'orange');

			setRightPaddle(right);

			var ball = svg.append('circle')
				.attr('cx', (boardSize / 2))
				.attr('cy', (boardSize / 2))
				.attr('r', ballSize)
				.attr('stroke', 'black')
				.attr('fill', 'orange');

			setBall(ball);

			var middleText = svg.append('text')
				.attr('x', boardSize / 2)
				.attr('y', boardSize / 2 - ballSize * 2)
				.style("text-anchor", "middle")
				.style("font-size", "34px")
				.text('START');

			setText(middleText);

		}
	}, []);

	useEffect(() => {
		if(leftPaddle) {
			leftPaddle.transition()
				.duration(100)
				.attr("y", leftPosition)
				.ease(d3.easeCubicOut);
		}
	}, [leftPosition])

	useEffect(() => {
		if(rightPaddle) {
			rightPaddle.transition()
				.duration(100)
				.attr("y", rightPosition)
				.ease(d3.easeCubicOut);
		}
	}, [rightPosition])

	useEffect(() => {
		if(ball) {
			ball.transition()
				.duration(100)
				.attr("cx", ballPosition.x)
				.attr("cy", ballPosition.y)
				.ease(d3.easeLinear);
		}
	}, [ballPosition])

	useEffect(() => {
		const cos = Math.cos(toRadians(direction));

		// to the right
		if(cos >= 0) {
			if (ballPosition.x + ballSize >= boardSize - paddleWidth && ballPosition.y >= rightPosition && ballPosition.y <= rightPosition + paddleLength) {
				const newDirection = calculateRightAngle(ballPosition.y - rightPosition);

				setDirection(newDirection);
			} else if(ballPosition.y <= 0){
				const newDirection = direction + 90;

				setDirection(newDirection);
			} else if(ballPosition.y >= boardSize) {
				const newDirection = direction - 90;

				setDirection(newDirection);
			} else if(ballPosition.x >= boardSize) {
				setLeftScore(leftScore + 1);

				resetGame(180)
			}
		} else {
			if (ballPosition.x <= paddleWidth + ballSize && ballPosition.y >= leftPosition && ballPosition.y <= leftPosition + paddleLength) {
				const newDirection = calculateLeftAngle(ballPosition.y - leftPosition);

				setDirection(newDirection);
			} else if(ballPosition.y <= 0){

				const newDirection = direction - 90;
				setDirection(newDirection);
			} else if(ballPosition.y >= boardSize) {
				const newDirection = direction + 90;

				setDirection(newDirection);
			} else if(ballPosition.x <= 0) {
				setRightScore(rightScore + 1);

				resetGame(0)
			}
		}
	}, [ballPosition])

	function resetGame(direction) {
		clearInterval(gameInterval);

		setDirection(direction)

		setBallPosition({
			x: boardSize / 2,
			y: boardSize / 2
		});

		startGame()
	}

	function movePaddle(player, position) {
		const step = 20 * position

			if (player == "left") {
				const newPosition = leftPosition + step;

				if (newPosition >= 0 && newPosition <= boardSize - paddleLength ) {
					setLeftPosition(newPosition)
				}
			} else {
				const newPosition = rightPosition + step;

				if (newPosition >= 0 && newPosition <= boardSize - paddleLength) {
					setRightPosition(newPosition)
				}
			}
	}

	function handleKeyDown(event) {
		const keyCode = event.keyCode;

		if(keyCode == W_KEY || keyCode == S_KEY || keyCode == J_KEY || keyCode == K_KEY) {
			event.preventDefault();

			switch(keyCode) {
				case W_KEY:
					movePaddle('left', -1)
					break;
				case S_KEY:
					movePaddle('left', 1)
					break;
				case J_KEY:
					movePaddle('right', 1)
					break;
				case K_KEY:
					movePaddle('right', -1)
					break;
			}
		}
	}

	function advanceBall(){
		const step = 30;

		setDirection(direction => {
			setBallPosition(prevPosition => {
				return {
					x: clamp(prevPosition.x + (Math.cos(toRadians(direction)) * step), 0, boardSize),
					y: clamp(prevPosition.y + (Math.sin(toRadians(direction)) * step), 0, boardSize)
				}
			});

			return direction
		});
	}

	function startGame(){
		text.text(countDown);

		const interval = setInterval(() => {
			setCountDown(countDown => {
				if (countDown == 1 ) {
					text.text("");

					setCountDownInterval((countDownInterval) => {
						clearInterval(countDownInterval);
					})

					const game = setInterval(()=> { advanceBall() }, 100);
					setGameInterval(game);

					return 3
				} else {
					const newCountDown = countDown - 1;

					text.text(newCountDown);

					return newCountDown;
				}
			})
		}, 1000);

		setCountDownInterval(interval);
	}

	function handleClick(){
		if(gameStarted == false){
			setGameStarted(true);

			startGame()
		}
	}

	return (
		<div className="app" onKeyDown={handleKeyDown} onClick={handleClick} tabIndex="0">
			<div className="scores">
				<h1 className="left-score">{leftScore}</h1>
				<h1 className="right-score">{rightScore}</h1>
			</div>
		</div>
	)
}

export default App
