import { Line } from "../SvgElements/Line.mjs";

class Wire extends Line {
    #state;

    get state() { return this.#state; }

    constructor(vecA, vecB, options) {
        super(vecA, vecB, options);
        this.#state = -1;
        this.turnOff();
    }

    turnOn() {
        if (this.#state !== 1) {
            this.color = this.color.lighter(40);
            this.#state = 1;
        }
    }

    turnOff() {
        if (this.#state !== 0) {
            this.color = this.color.darker(40);
            this.#state = 0;
        }
    }

    toggleState(newState) {
        if (newState !== undefined ? newState : !this.#state)
            this.turnOn();
        else
            this.turnOff();
    }
}

export { Wire }