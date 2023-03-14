import { Board } from "./Elements/Board.mjs";
import { Wire } from "./Elements/Connectors/Wire.mjs";
import { Vector2D } from "./Utils/Vector2D.mjs";
import { DefaultGates } from "./Elements/Components/LogicGates/Gates.mjs";

const board = new Board(document.body);

const offScreen = new Vector2D(-Infinity, -Infinity);
DefaultGates.forEach(g => board.addComponentMenu(new g(offScreen)));

self.addEventListener('keyup', function(e) {
    switch (e.code) {
        case 'KeyE':
            board.toggleMenu();
            break;
    }
});

self.CircuitBoard = board;