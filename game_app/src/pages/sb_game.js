import React, { Fragment, useState, useEffect, useCallback } from "react";
import { Board } from "../models/sb_models/Board";
import BoardComponent from "../components/sb_board/BoardComponent";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import SetShipBoardComponent from "../components/sb_board/SetShipsBoardComponent";

const wss = new WebSocket(`ws://${window.location.hostname}:4000`);
function Game() {
  const [myBoard, setMyBoard] = useState(new Board());
  const [hisBoard, setHisBoard] = useState(new Board());
  const [enemyName, setEnemeyName] = useState("enemy");
  const [shipsReady, setShipsReady] = useState(false);
  const [canShoot, setCanShoot] = useState(false);
  const [userName, setUserName] = useState(localStorage.name);

  const [winner, setWinner] = useState("");
  const [open, setOpen] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  let { gameId } = useParams();
  function restart() {
    const newMyBoard = new Board();
    const newhisBoard = new Board();
    newMyBoard.initCells();
    newhisBoard.initCells();
    setMyBoard(newMyBoard);
    setHisBoard(newhisBoard);
  }

  useEffect(() => {
    restart();
  }, []);

  useEffect(() => {
    const myDamage = myBoard.cells.flatMap((el) => {
      return el.filter((item) => {
        return item.mark?.name == "damage";
      });
    });
    const hisDamage = hisBoard.cells.flatMap((el) => {
      return el.filter((item) => {
        return item.mark?.name == "damage";
      });
    });
    setGameOver(myDamage.length === 20 || hisDamage.length === 20);

    if (gameOver) {
      if (myDamage == 20) {
        setWinner(enemyName);
      } else {
        setWinner(userName);
      }
    }
  });
 
  function shoot(x, y) {
    sendMessage({
      event: "shoot",
      payload: {
        username: userName,
        gameId,
        x,
        y,
      },
    });
  }
  const navigate = useNavigate();
  wss.onmessage = function (response) {
    const { type, payload } = JSON.parse(response.data);
    const { username, x, y, canStart, enemyName, success } = payload;

    switch (type) {
      case "connectToPlay":
        if (!success) {
          return navigate("/");
        }
        setEnemeyName(enemyName);
        break;
      case "readyToPlay":
        if (payload.username === userName && canStart) {
          setCanShoot(true);
        }
        break;
      case "afterShootByMe":
        if (username !== userName) {
          const isPerfectHit = myBoard.cells[y][x].mark?.name === "ship";
          changeBoardAfterShoot(myBoard, setMyBoard, x, y, isPerfectHit);
          wss.send(
            JSON.stringify({
              event: "checkShoot",
              payload: { ...payload, isPerfectHit },
            })
          );
          if (!isPerfectHit) {
            setCanShoot(true);
          }
        }
        break;
      case "isPerfectHit": {
        if (username === userName) {
          changeBoardAfterShoot(
            hisBoard,
            setHisBoard,
            x,
            y,
            payload.isPerfectHit
          );
          payload.isPerfectHit ? setCanShoot(true) : setCanShoot(false);
        }
        break;
      }
      default:
        break;
    }
  };
  function changeBoardAfterShoot(board, setBoard, x, y, isPerfectHit) {
    isPerfectHit ? board.addDamage(x, y) : board.addMiss(x, y);
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
  }

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

  const connect = useCallback(() => {
    sendMessage({
      event: "connect",
      payload: {
        username: userName,
        gameId,
      },
    });
  }, []);

  const iAmReadyToPlay = useCallback((shipsReady) => {
    sendMessage({
      event: "ready",
      payload: {
        username: userName,
        gameId,
      },
    });
    setShipsReady(shipsReady);
  }, []);

  useEffect(() => {
    connect();
    restart();
  }, []);

  return (
    <div className="flex flex-col w-full justify-center">
      {gameOver && (
        <Transition.Root show={open} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setOpen}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                    <div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Game Over
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-xxl text-gray-500">
                            Winner {winner}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => setOpen(false)}
                      >
                        Go back to GAMES LIST
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      )}

      {!shipsReady && (
        <div>
          <p>Your Game id {gameId}</p>
          <SetShipBoardComponent
            board={myBoard}
            setBoard={setMyBoard}
            setShipsReady={iAmReadyToPlay}
            className="justify-center"
          />
        </div>
      )}

      {shipsReady && (
        <div>
          <h1 className="my-10 text-3xl">Sea Battle</h1>
          <div className="flex w-full justify-around">
            <div className="mx-5">
              <p className="mb-10 bg-sky-500 py-1 px-2 text-s font-semibold text-white shadow-sm">
                {userName}
              </p>
              <BoardComponent
                board={myBoard}
                isMyBoard
                shipsReady={shipsReady}
                setBoard={setMyBoard}
                canShoot={false}
                setShipsReady={setShipsReady}
              />
            </div>
            <div className="mx-5">
              <p className="mb-10 bg-red-500 py-1 px-2 text-s font-semibold text-white shadow-sm">
                {enemyName}
              </p>
              <BoardComponent
                board={hisBoard}
                setBoard={setHisBoard}
                canShoot={canShoot}
                shoot={shoot}
                shipsReady={shipsReady}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
