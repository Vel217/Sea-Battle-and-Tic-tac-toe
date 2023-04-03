const getMainLine = ({ currentShipCells }) => {
  let x = currentShipCells[0].x;
  let y = currentShipCells[0].y;

  const isXMianLine = currentShipCells.every((cell) => cell.x === x);
  const isYMianLine = currentShipCells.every((cell) => cell.y === y);

  if (isXMianLine) {
    return { x };
  }
  if (isYMianLine) {
    return { y };
  }
};

const getAvaliableCellsForShip = ({ currentShipCells }) => {
  const xValues = currentShipCells.map((cell) => cell.x);
  const yValues = currentShipCells.map((cell) => cell.y);

  const maxX = Math.max(...xValues);
  const minX = Math.min(...xValues);
  const maxY = Math.max(...yValues);
  const minY = Math.min(...yValues);

  const mainLine = getMainLine({ currentShipCells });
  const mainAxisName = Object.keys(mainLine)[0];

  if (mainAxisName === "x") {
    return [
      { x: mainLine.x, y: maxY + 1 },
      { x: mainLine.x, y: minY - 1 },
    ];
  }

  if (mainAxisName === "y") {
    return [
      { x: maxX + 1, y: mainLine.y },
      { x: minX - 1, y: mainLine.y },
    ];
  }
};

export const isCellAvalibleForShip = ({ currentShipCells, x, y }) => {
  if (currentShipCells.length === 0) return true;
  if (currentShipCells.length === 1) {
    const curX = currentShipCells[0].x;
    const curY = currentShipCells[0].y;
    return (
      (curX === x) & (curY - y === 1 || curY - y === -1) ||
      (curY === y) & (curX - x === 1 || curX - x === -1)
    );
  }

  const avaliableCells = getAvaliableCellsForShip({ currentShipCells });

  return avaliableCells.some((cell) => (cell.x === x) & (cell.y === y));
};
