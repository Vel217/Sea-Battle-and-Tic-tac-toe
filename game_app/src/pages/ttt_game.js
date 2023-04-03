import React, { Fragment, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BOARD_SIZE = 3;
const FULL_BOARD_SIZE = BOARD_SIZE * BOARD_SIZE;
const gameName = "tic-tac";
// const victory = [
//   [1,1,1,0,0,0,0,0,0],
//   [0,0,0,1,1,1,0,0,0],
//   [0,0,0,0,0,0,1,1,1],
//   [1,0,0,1,0,0,1,0,0],
//   [0,1,0,0,1,0,0,1,0],
//   [0,0,1,0,0,1,0,0,1],
//   [1,0,0,0,1,0,0,0,1],
//   [0,0,1,0,1,0,1,0,0],
// ]
const victory = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const wss = new WebSocket(`ws://${window.location.hostname}:4000`);
function Ttt_game() {
  let { gameId } = useParams();
  const [enemyName, setEnemyName] = useState(null);
  const [mySign, setMySign] = useState("X");
  const [currentTurn, setCurrentTurn] = useState(null);
  const [readyToPlay, setReadyToPlay] = useState(false);
  const [currentGameFinal, setCurrentGameFinal] = useState(null);
  const [userName] = useState(localStorage.name);
  const [board, setBoard] = useState(Array(BOARD_SIZE * BOARD_SIZE).fill(null));

  const getInvertedSign = (sign) => {
    return sign === "X" ? "O" : "X";
  };

  const connect = useCallback(() => {
    sendMessage({
      event: "connect",
      payload: {
        username: userName,
        gameId,
      },
    });
  }, [gameId, userName]);

  useEffect(() => {
    connect();
  }, []);

  wss.onmessage = (response) => {
    const { type, payload } = JSON.parse(response.data);
    const {
      username,
      index,
      enemyName,
      currentSign,
      gameIsReady,
      moveSign,
      victory,
    } = payload;

    switch (type) {
      case "connectToPlay": {
        setMySign(currentSign);
        setReadyToPlay(gameIsReady);
        if (gameIsReady) {
          setCurrentTurn("X");
        }
        setEnemyName(enemyName);
        break;
      }
      case "move": {
        const newBoard = [...board];
        newBoard[index] = moveSign;
        setBoard(newBoard);
        setCurrentTurn(getInvertedSign(moveSign));
        break;
      }
      default: {
        console.log(`Unknown message type: ${type}`);
      }
    }
  };

  useEffect(() => {
    const currentUserWon = checkVictory(board, mySign);
    const enemyWon = checkVictory(board, getInvertedSign(mySign));
    const draw =
      !currentUserWon &&
      !enemyWon &&
      board.filter(Boolean).length === FULL_BOARD_SIZE;
    if (draw || currentUserWon || enemyWon) {
      setCurrentGameFinal(
        draw ? "draw" : currentUserWon ? "currentWin" : "enemyWin"
      );
      setCurrentTurn(null);
    }
  }, [board, mySign]);

  const checkVictory = (newBoard, sign) => {
    const myMoves = newBoard
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => value === sign);
    return victory.find((victoryItem) =>
      victoryItem.every((victoryTurn) =>
        myMoves.find((move) => move.index === victoryTurn)
      )
    );
  };

  const sendMessage = (payload) => {
    const send = () => {
      wss.send(JSON.stringify({ gameName, ...payload }));
    };
    if (wss.readyState === WebSocket.OPEN) {
      send();
    } else {
      wss.onopen = () => send();
    }
  };

  const isMyTurn = () => {
    return mySign === currentTurn;
  };

  const handleMove = (index) => {
    if (board[index] || !readyToPlay || !isMyTurn()) {
      return;
    }
    const newBoard = [...board];
    newBoard[index] = mySign;
    setBoard(newBoard);
    sendMessage({
      event: "move",
      payload: {
        username: userName,
        index,
        gameId,
        moveSign: mySign,
      },
    });
  };

  const renderCell = (index, isWinningCell) => {
    const value = board[index];
    return (
      <div
        className={
          "cell_ttt" +
          (isMyTurn() ? " my-turn" : " not-my-turn") +
          (isWinningCell ? " -winning" : "")
        }
        onClick={() => handleMove(index)}
      >
        {value}
      </div>
    );
  };

  const renderRow = (startIndex, victoryCombination) => {
    const cells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const cellIndex = startIndex + i;
      cells.push(
        renderCell(cellIndex, victoryCombination?.includes(cellIndex))
      );
    }
    return <div className="row">{cells}</div>;
  };

  const renderBoard = () => {
    const rows = [];
    const victoryCombination = checkVictory(board, mySign);
    for (let i = 0; i < BOARD_SIZE; i++) {
      rows.push(renderRow(i * BOARD_SIZE, victoryCombination));
    }
    return <div className="board_ttt">{rows}</div>;
  };

  return (
    <div className={"app" + (isMyTurn() ? " -active" : "")}>
      <h1>Logged in as {userName}.</h1>
      {!currentGameFinal ? (
        <>
          {
            <h1>
              {enemyName
                ? `You're playing against ${enemyName}. Your sign: ${mySign}`
                : ""}
            </h1>
          }

          {mySign !== currentTurn ? (
            <h2>Waiting for turn of {currentTurn}</h2>
          ) : (
            <h2>Your turn</h2>
          )}
        </>
      ) : currentGameFinal === "draw" ? (
        " It is a draw"
      ) : currentGameFinal === "currentWin" ? (
        "You win!"
      ) : (
        `  Winner: ${enemyName}`
      )}
      {renderBoard()}
    </div>
  );
}

export default Ttt_game;
