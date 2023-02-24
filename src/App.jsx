import { useState, useEffect } from 'react'
import { useMutation, useQuery } from "../convex/_generated/react";
import reactLogo from './assets/react.svg'
import './App.css'

const W_KEY = 87; // up
const S_KEY = 83; // down

const K_KEY = 75; // up
const J_KEY = 74; // down

const paddleLength = 100;
const paddleWidth  = 10;
const boardSize    = 600;
const ballSize     = 20;

function App() {
	const [boardSvg, setBoardSvg]         = useState(null);
	const [leftPaddle, setLeftPaddle]     = useState(null);
	const [rightPaddle, setRightPaddle]   = useState(null);
	const [ball, setBall]                 = useState(null);
	const [text, setText]                 = useState(null)
	const [gameInterval, setGameInterval] = useState();
	const [gameStarted, setGameStarted]   = useState(false);

	const joinOrCreateGame = useMutation("joinOrCreateGame");
	const updateGameStatus = useMutation("updateGameStatus");
	const updateGame       = useMutation("updateGame");
	const advanceBall      = useMutation("advanceBall");
	const movePaddle       = useMutation("movePaddle");
	const countDown        = useMutation("countDown");

	const [gameId, setGameId]   = useState(null);
	const [ballId, setBallId]   = useState(null);
	const [leftId, setLeftId]   = useState(null);
	const [rightId, setRightId] = useState(null);
	const [player, setPlayer]   = useState(null);

	const game   = useQuery("getById", gameId);
	const balldb = useQuery("getById", ballId);
	const left   = useQuery("getById", leftId);
	const right  = useQuery("getById", rightId);

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
				.text('waiting for player');

			setText(middleText);
		}

		const getGameInfo = async () => {
			const {id, player} = await joinOrCreateGame(boardSize, paddleLength);

			setGameId(id);
			setPlayer(player);
		};

		getGameInfo();
	}, []);

	useEffect(() => {
		if(game && !ballId) {
			setBallId(game.ballId);
			setRightId(game.right);
			setLeftId(game.left);
		}
	}, [game]);

	useEffect(() => {
		if(left) {
			leftPaddle.transition()
				.duration(100)
				.attr("y", left.position)
				.ease(d3.easeQuadInOut);
		}
	}, [left])

	useEffect(() => {
		if(right) {
			rightPaddle.transition()
				.duration(100)
				.attr("y", right.position)
				.ease(d3.easeQuadInOut);
		}
	}, [right])

	useEffect(() => {
		if(ball && balldb) {
			ball.transition()
				.duration(100)
				.attr("cx", balldb.x)
				.attr("cy", balldb.y)
				.ease(d3.easeLinear);
		}
	}, [balldb])

	function resetGame() {
		clearInterval(gameInterval);

		startCountDown()
	}

	function handleKeyDown(event) {
		const keyCode = event.keyCode;

		if(gameId, keyCode == W_KEY || keyCode == S_KEY || keyCode == J_KEY || keyCode == K_KEY) {
			event.preventDefault();

			switch(keyCode) {
				case W_KEY:
					movePaddle(gameId, 'left', -1, boardSize, paddleLength)
					break;
				case S_KEY:
					movePaddle(gameId, 'left', 1, boardSize, paddleLength)
					break;
				case J_KEY:
					movePaddle(gameId, 'right', 1, boardSize, paddleLength)
					break;
				case K_KEY:
					movePaddle(gameId, 'right', -1, boardSize, paddleLength)
					break;
			}
		}
	}

	useEffect(() => {
		if(game) {
			console.debug(game.status);

			switch(game.status) {
				case 'waiting':
					text.text("waiting for player");
				break;
				case 'ready':
					text.text("CLICK TO START");
				break;
				case 'countdown':
					text.text(game.countDown);

					setTimeout(() => { countDown(gameId) }, 1000);
				break;
				case 'kickball':
					text.text("");

					updateGameStatus(gameId, 'playing');

					const gameInterval = setInterval(()=> {
						advanceBall(gameId, boardSize, ballSize, paddleWidth, paddleLength)
					}, 150);

					setGameInterval(gameInterval);
				break;
				case 'reset':
					resetGame()
				break;
			}
		}
	}, [game]);

	function startCountDown(){
		updateGameStatus(gameId, 'countdown');
	}

	function handleClick(){
		// && game.status == 'ready'
		if(game && gameStarted == false){
			setGameStarted(true);

			startCountDown()
		}
	}

	return (
		<div className="app" onKeyDown={handleKeyDown} onClick={handleClick} tabIndex="0">
			<div className="scores">
				{game && 
					<div>
						<h1 className="left-score">{game.leftScore}</h1>
						<h1 className="right-score">{game.rightScore}</h1>
					</div>
				}
			</div>
		</div>
	)
}

export default App
