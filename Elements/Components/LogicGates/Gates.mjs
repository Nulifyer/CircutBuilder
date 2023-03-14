import { LogicGate } from "./LogicGate.mjs";

class ANDGate extends LogicGate {
    constructor(position) {
        super('AND', position, 2, 1);
    }

    update() {
        const binary_out = this.getBinaryPins().inputs.every(v => v === 1) ? 1 : 0;
        const pin = this._outputs[0];
        for (const c of pin.getConnections())
            c.toggleState(binary_out);
        super.update();
    }
}

class ORGate extends LogicGate {
    constructor(position) {
        super('OR', position, 2, 1);
    }

    update() {
        const binary_out = this.getBinaryPins().inputs.some(v => v === 1) ? 1 : 0;
        const pin = this._outputs[0];
        for (const c of pin.getConnections())
            c.toggleState(binary_out);
        super.update();
    }
}

class XORGate extends LogicGate {
    constructor(position) {
        super('XOR', position, 2, 1);
    }

    update() {
        const binary_out = this.getBinaryPins().inputs.filter(x => x === 1).length === 1 ? 1 : 0;
        const pin = this._outputs[0];
        for (const c of pin.getConnections())
            c.toggleState(binary_out);
        super.update();
    }
}

class NOTGate extends LogicGate {
    constructor(position) {
        super('NOT', position, 1, 1);
    }

    update() {
        const binary_out = this.getBinaryPins().inputs.every(x => x === 1) ? 0 : 1;
        const pin = this._outputs[0];
        for (const c of pin.getConnections())
            c.toggleState(binary_out);
        super.update();
    }
}

const DefaultGates = [
    ANDGate,
    ORGate,
    XORGate,
    NOTGate,
];

// AND, OR, XOR, NOT, NAND, NOR, and XNOR

export { 
    ANDGate,
    ORGate,
    XORGate,
    NOTGate,
    DefaultGates,
}