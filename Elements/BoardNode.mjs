import { AssertType } from "../Utils/Assert.mjs";
import { Vector2D } from "../Utils/Vector2D.mjs";
import { Board } from "./Board.mjs";
import { Component } from "./Components/Component.mjs";
import { Pin } from "./Components/Pin.mjs";

class BoardNode {
    #pin;
    #comp;
    _element;

    get element() { return this._element; }

    constructor(board, pinType, pinNum) {
        AssertType(board, Board);

        this._element = document.createElement('div');
        this._element.classList.add('board-node');
        this._element.setAttribute('node-type', pinType);

        const offScreen = new Vector2D(-Infinity, -Infinity);
        
        this.#comp = new Component(
            'sudo-board-comp', 
            offScreen, 
            pinType === 'input' ? 1 : 0,
            pinType === 'output' ? 1 : 0);
        this.#pin = this.#comp.getPins()[pinType + 's'][0];
        
        this.#comp.setBoard(board);
        
        this.#pin.dotElem.innerText = pinNum;
        this._element.appendChild(this.#pin.dotElem);

        this.#pin.dotElem.addEventListener('click', () => {
            for (const c of this.#pin.getConnections()) {
                c.wire.toggleState();
                c.update();
            }
        });
    }

    updateConnections() {
        this.#comp.updateConnections();
    }
}

export { BoardNode }