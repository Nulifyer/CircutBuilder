import { AssertType } from "../../Utils/Assert.mjs";
import { Pin } from "../Components/Pin.mjs";
import { Wire } from "./Wire.mjs";

class WireConnection {
    #pinA;
    #pinB;
    #wire;

    get wire() { return this.#wire; }
    get state() { return this.#wire.state; }
    get pinA() { return this.#pinA; }
    get pinB() { return this.#pinB; }

    constructor(pinA, pinB) {
        AssertType(pinA, Pin);
        AssertType(pinB, Pin);
        
        this.#pinA = pinA;
        this.#pinB = pinB;

        this.#wire = new Wire(this.#pinA.position, this.#pinB.position, {
            color: this.#pinA.component?.connectionColor,
            width: 2,
        });

        this.updatePosition();
    }

    connect() {
        this.#pinA.connect(this);
        this.#pinB.connect(this);
        this.#pinA.component.update();
    }

    disconnect() {
        this.#pinA.disconnect(this);
        this.#pinB.disconnect(this);
    }

    updatePosition() {
        this.#wire.setA(this.#pinA.position);
        this.#wire.setB(this.#pinB.position);
    }

    update() {
        this.#pinB?.component?.update();
    }

    toggleState(newState = undefined) {
        this.#wire.toggleState(newState);
    }
}

export { WireConnection }