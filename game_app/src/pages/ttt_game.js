import React, { Fragment, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BOARD_SIZE = 3;
const wss = new WebSocket(`ws://${window.location.hostname}:4000`);
function Ttt_game() {
  const [isXNext, setIsXNext] = useState(true);
  const [enemyName, setEnemeyName] = useState("enemy");
  const [userName, setUserName] = useState('User'+Math.floor(Math.random()*10));
  //   let { gameId } = useParams();
  let gameId = "123456789";
  const [isXTurn, setIsXTurn] = useState(true);
  const [board, setBoard] = useState(Array(BOARD_SIZE * BOARD_SIZE).fill(null));

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

  wss.onopen = () => {
    console.log("WebSocket connected");
  };

  wss.onmessage = (response) => {
    const { type, payload } = JSON.parse(response.data);
    const { username, index, enemyName, success } = payload;

    switch (type) {
      case "turn":
        setIsXTurn(payload);
        break;
      case "move":
        const newBoard = [...board];
        newBoard[payload] = isXTurn ? "X" : "O";
        setBoard(newBoard);
        setIsXTurn(!isXTurn);
        break;
      default:
        console.log(`Unknown message type: ${type}`);
    }
  };

  const sendMessage = (payload) => {
    const send = () => {
      wss.send(JSON.stringify(payload));
    };
    if (wss.readyState === WebSocket.OPEN) {
      send();
    } else {
      wss.onopen = () => send();
    }
  };

 const handleMove = (index) => {
    if (board[index] || !isXTurn) {
      return;
    }
    sendMessage({
      event: "move",
      payload: { username: userName, index, gameId },
    });
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXTurn(!isXTurn);
  };

  const renderCell = (index) => {
    const value = board[index];
    console.log(board)
    console.log(value)
    return (
      <div className="cell_ttt" onClick={() => handleMove(index)}>
        {value}
      </div>
    );
  };

  const renderRow = (startIndex) => {
    const cells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      cells.push(renderCell(startIndex + i));
    }
    return <div className="row">{cells}</div>;
  };

  const renderBoard = () => {
    const rows = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      rows.push(renderRow(i * BOARD_SIZE));
    }
    return <div className="board_ttt">{rows}</div>;
  };

  return (
    <div className="app">
      <h1>{isXTurn ? "X" : "O"} turn</h1>
      {renderBoard()}
    </div>
  );
}

export default Ttt_game;
