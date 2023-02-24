import { useState, useEffect } from 'react'
import { useMutation, useQuery } from "../convex/_generated/react";
import reactLogo from './assets/react.svg'
import './App.css'

const W_KEY    = 87; // up
const S_KEY    = 83; // down
const UP_KEY   = 38; // up
const DOWN_KEY = 40; // down
const K_KEY    = 75; // up
const J_KEY    = 74; // down

const paddleLength = 100;
const paddleWidth  = 15;
const boardSize    = 600;
const ballSize     = 15;

const backgroundColor = "#b4f5f0";
const paddleColor     = "#0476d0";
const paddleStroke    = "#041f60";
const ballColor       = "#2ceef0";
const ballStroke      = "#0476d0";
const textColor       = "#041f60";

function App() {
  const [boardSvg, setBoardSvg]         = useState(null);
  const [leftPaddle, setLeftPaddle]     = useState(null);
  const [rightPaddle, setRightPaddle]   = useState(null);
  const [ball, setBall]                 = useState(null);
  const [text, setText]                 = useState(null)
  const [gameInterval, setGameInterval] = useState();

  const joinOrCreateGame = useMutation("joinOrCreateGame");
  const updateGameStatus = useMutation("updateGameStatus");
  const advanceBall      = useMutation("advanceBall");
  const movePaddle       = useMutation("movePaddle");
  const countDown        = useMutation("countDown");
  const updatePing       = useMutation("updatePing");

  const [gameId, setGameId]   = useState(null);
  const [ballId, setBallId]   = useState(null);
  const [leftId, setLeftId]   = useState(null);
  const [rightId, setRightId] = useState(null);
  const [player, setPlayer]   = useState(null);

  const game   = useQuery("getById", gameId);
  const balldb = useQuery("getById", ballId);
  const left   = useQuery("getById", leftId);
  const right  = useQuery("getById", rightId);

  const getGameInfo = async () => {
    const {id, player} = await joinOrCreateGame(boardSize, paddleLength);

    setGameId(id);
    setPlayer(player);
  };

  useEffect(() => {
    getGameInfo();

    document.getElementById('app').focus();

    if (boardSvg == null) {
      var svg = d3.select("#board")
        .append("svg")
        .attr("width", boardSize)
        .attr("height", boardSize)
        .style("background-color", backgroundColor);

      setBoardSvg(svg);

      var left = svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr("rx", 8)
        .attr('width', paddleWidth)
        .attr('height', paddleLength)
        .attr('stroke', paddleStroke)
        .attr('fill', paddleColor);

      setLeftPaddle(left);

      var right = svg.append('rect')
        .attr('x', boardSize - paddleWidth)
        .attr('y', 0)
        .attr("rx", paddleWidth / 2)
        .attr('width', paddleWidth)
        .attr('height', paddleLength)
        .attr('stroke', paddleStroke)
        .attr('fill', paddleColor);

      setRightPaddle(right);

      var ball = svg.append('circle')
        .attr('cx', (boardSize / 2))
        .attr('cy', (boardSize / 2))
        .attr('r', ballSize)
        .attr('stroke', ballStroke)
        .attr('fill', ballColor);

      setBall(ball);

      var middleText = svg.append('text')
        .attr('x', boardSize / 2)
        .attr('y', boardSize / 2 - ballSize * 2)
        .style("text-anchor", "middle")
        .style("font-size", "29px")
        .style('fill', textColor)
        .text('waiting player');

      setText(middleText);
    }
  }, []);

  useEffect(() => {
    if(game && !ballId) {
      setBallId(game.ballId);
      setRightId(game.right);
      setLeftId(game.left);

      setInterval(() => { updatePing(game._id, player) }, 1000)
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

  function stopGame() {
    clearInterval(gameInterval);
  }

  function handleKeyDown(event) {
    const keyCode = event.keyCode;

    if(gameId, keyCode == W_KEY || keyCode == S_KEY || keyCode == J_KEY || keyCode == K_KEY || keyCode == UP_KEY || keyCode == DOWN_KEY) {
      event.preventDefault();

      switch(keyCode) {
        case W_KEY:
        case K_KEY:
        case UP_KEY:
          movePaddle(gameId, player, -1, boardSize, paddleLength)
          break;
        case S_KEY:
        case J_KEY:
        case DOWN_KEY:
          movePaddle(gameId, player, 1, boardSize, paddleLength)
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

          if(player == 'left') {
            setTimeout(() => { countDown(gameId) }, 1000);
          }
        break;
        case 'kickball':
          text.text("");

          if(player == 'left') {
            const velocity = Math.max(110 - ((game.leftScore + game.rightScore) * 5), 80);

            const gameInterval = setInterval(()=> {
              advanceBall(gameId, boardSize, ballSize, paddleWidth, paddleLength)
            }, velocity);

            setGameInterval(gameInterval);

            updateGameStatus(gameId, 'playing');
          }
        break;
        case 'reset':
          resetGame()
        break;
        case 'disconnected':
          if (player == 'left') {
            text.text("right player gave up");
          } else {
            text.text("left player gave up");
          }

          stopGame()
        break;
      }
    }
  }, [game]);

  function startCountDown(){
    updateGameStatus(gameId, 'countdown');
  }

  function handleClick(){
    if(game && game.status == 'ready'){
      startCountDown()
    }
  }

  return (
    <div id="app" onKeyDown={handleKeyDown} onClick={handleClick} tabIndex="0">
        {game &&
        <div className="scores">
          <h1 className="left-score">{game.leftScore}</h1>
          <h1>score</h1>
          <h1 className="right-score">{game.rightScore}</h1>
        </div>
        }
      <div id="board"></div>
    </div>
  )
}

export default App
