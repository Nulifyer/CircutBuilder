import { Component } from "../Component.mjs";

class LogicGate extends Component {
    constructor(label, position, inputs = 0, outputs = 0) {
        super(label, position, inputs, outputs);
        this.color = 'hsl(259 65% 30% / 1)';
    }

    update() {
        super.update();
    }
}

export { LogicGate }