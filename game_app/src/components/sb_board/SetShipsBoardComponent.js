import React, { useCallback, useState, useEffect } from "react";
import CellComponent from "./CellComponent";
import { isCellAvalibleForShip } from "../../utils/sbBoard";

const SetShipBoardComponent = ({ board, setBoard, setShipsReady }) => {
  function updateBoard() {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
  }

  const steps = [
    { count: 1, cells: 4, name: "«four-deck»" },
    { count: 2, cells: 3, name: "«three-deck»" },
    { count: 3, cells: 2, name: "«double-deck»" },
    { count: 4, cells: 1, name: "«single-deck»" },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [currentCount, setCurrentCount] = useState(steps[0].count);
  const [currentShipCells, setCurrentShipCells] = useState([]);
  const [countOfShips, setCountOfShips] = useState(0);

  useEffect(() => {
    if (currentShipCells.length === steps[currentStep].cells) {
      if (currentCount === 1) {
        if (currentStep === steps.length - 1) {
          setShipsReady(true);
        } else {
          const newStep = currentStep + 1;
          setCurrentCount(steps[newStep].count);
          setCurrentStep(newStep);
          setCurrentShipCells([]);
          setCountOfShips(countOfShips + 1);
        }
      } else {
        setCurrentCount(currentCount - 1);
        setCurrentShipCells([]);
      }
    }
  }, [currentShipCells.length]);

  const addShips = useCallback(
    (x, y) => {
      board.addShip(x, y);
      setCurrentShipCells([...currentShipCells, { x, y }]);
      updateBoard();
    },
    [currentShipCells, board]
  );

  const addMark = useCallback(
    (x, y) => {
      console.log("board", board);
      if (countOfShips) {
        if (board.isCellAvaliableForNewShip({ x, y, currentShipCells })) {
          if (isCellAvalibleForShip({ currentShipCells, x, y })) {
            addShips(x, y);
          } else {
            alert("You cannot place a ship in this location");
          }
        } else {
          alert("You cannot place a ship in this location");
        }
      } else if (isCellAvalibleForShip({ currentShipCells, x, y })) {
        addShips(x, y);
      } else {
        alert("You cannot place a ship in this location");
      }
    },
    [currentShipCells, board, currentStep, currentCount, countOfShips]
  );

  return (
    <div className="flex flex-col items-center">
      <div className="my-10 rounded-md bg-sky-500 py-1 px-2 text-s font-semibold text-white shadow-sm">
        <p>Welcome to the Sea Battle</p>
        <p>Prepare your ships</p>
        <p>Place {steps[currentStep].name} ship</p>
        <p>Left to place {currentCount}</p>
      </div>
      <div className="board">
        {board.cells.map((row, index) => (
          <React.Fragment key={index}>
            {row.map((cell) => (
              <CellComponent key={cell.id} cell={cell} addMark={addMark} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SetShipBoardComponent;
