import { Cell } from "./Cell";
import { Ship } from "./marks/Ship";
import { Miss } from "./marks/Miss";
import { Damage } from "./marks/Damage";

export class Board {
  cells = [];

  initCells() {
    for (let i = 0; i < 10; i++) {
      const row = [];
      for (let j = 0; j < 10; j++) {
        row.push(new Cell(this, j, i, null));
      }
      this.cells.push(row);
    }
  }
  getCopyBoard() {
    const newBoard = new Board();
    newBoard.cells = this.cells;
    return newBoard;
  }
  getCells(x, y) {
    return this.cells[y][x];
  }

  addShip(x, y) {
    new Ship(this.getCells(x, y));
  }
  addMiss(x, y) {
    new Miss(this.getCells(x, y));
  }
  addDamage(x, y) {
    new Damage(this.getCells(x, y));
  }

  isCellAvaliableForNewShip({ x, y, currentShipCells }) {
    const cellsForCheck = [
      { x: x + 1, y },
      { x: x + 1, y: y + 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y },
      { x: x - 1, y: y + 1 },
      { x: x - 1, y: y - 1 },
      { x, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ].filter((cell) => {

      return !currentShipCells.some((currentShipCell) => {
        return currentShipCell.x === cell.x && currentShipCell.y === cell.y;
      });
    });

    const hasOtherShipNear = cellsForCheck.some((checkingCell) => {
      console.log("checkingCell", checkingCell);
      return this.cells.some((line) => {
        return line.some((cell) => {
          console.log("cell", cell);
          if (cell.x === checkingCell.x && cell.y === checkingCell.y) {
            console.log("RTY", cell.mark && cell.mark.name === "ship");
            return cell.mark && cell.mark.name === "ship";
          }
        });
      });
    });

    return !hasOtherShipNear;
  }
}
