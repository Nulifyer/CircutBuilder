import { AssertType } from '../../Utils/Assert.mjs';
import { uuidv4 } from '../../Utils/uuidv4.mjs';
import { Vector2D } from '../../Utils/Vector2D.mjs';
import { WireConnection } from '../Connectors/WireConnection.mjs';
import { Pin } from './Pin.mjs';

class Component {
    #uuid;
    #element;
    #label;
    #position;
    #board;

    _label;
    _color;

    _inputs;
    _outputs;
    _inputWrap;
    _outputWrap;

    get uuid() { return this.#uuid; }
    get element() { return this.#element; }
    get typeName() { return this.constructor.name; }
    get color() { return this._color; }
    get connectionColor() { return this._connectionColor; }
    get label() { return this.#label; }
    get position() { return this.#position; }
    get board() { return this.#board; }

    set color(value) {
        this._color = value;
        this.element.style.backgroundColor = this._color;
    }
    set connectionColor(value) {
        this._connectionColor = value;
        this.updateConnections();
    }
    set label(value) {
        return this._label.innerText = this.#label = value;
    }
    set position(value) {
        AssertType(value, Vector2D);
        this.#position = value;

        const rect = this.element.getBoundingClientRect();
        this.element.style.top = `${this.#position.y - rect.height / 2}px`;
        this.element.style.left = `${this.#position.x - rect.width / 2}px`;
    }

    constructor(label, position, inputs = 0, outputs = 0) {
        // setup basic variables
        this.#uuid = uuidv4();
        this._textColor = 'rgb(20, 20, 20)';
        this._color = 'rgb(20, 20, 20)';
        this._connectionColor = 'red';

        // create base element
        this.#element = document.createElement('div');
        this.element.classList.add('component', this.typeName.toLowerCase());
        this.element.setAttribute('com-type', this.typeName.toLowerCase());
        this.element.id = this.#uuid;

        // setup mouse drag
        let mouse_down, mouse_up, mouse_drag;
        let mouse_down_start, mouse_down_hold = 200;
        let render_frame_last = Date.now(), render_frame_tm = 15;
        let mouse_drag_tmout;
        mouse_drag = (e) => {
            if (Date.now() - mouse_down_start > mouse_down_hold) {
                if (Date.now() - render_frame_last > render_frame_tm) {
                    this.position = new Vector2D(e.clientX, e.clientY);
                    this.updateConnections();
                    render_frame_last = Date.now();
                }
            }
        };
        mouse_down = (e) => {
            mouse_down_start = Date.now();
            self.addEventListener('mousemove', mouse_drag);
            self.addEventListener('mouseup', mouse_up);
            mouse_drag_tmout = setTimeout(() => {
                this.element.classList.add('dragging');
            }, mouse_down_hold);
        };
        mouse_up = (e) => {
            clearTimeout(mouse_drag_tmout);
            self.removeEventListener('mousemove', mouse_drag);
            self.removeEventListener('mouseup', mouse_up);
            this.element.classList.remove('dragging');

            const rect = this.element.getBoundingClientRect();
            const parent_rect = this.element.offsetParent?.getBoundingClientRect();
            const wRadius = rect.width / 2;
            const hRadius = rect.height / 2;

            const x = Math.min(Math.max(this.position.x, parent_rect.left + wRadius), parent_rect.right - wRadius);
            const y = Math.min(Math.max(this.position.y, parent_rect.top + hRadius), parent_rect.bottom - hRadius);

            this.position = new Vector2D(x, y);

            this.updateConnections();
        };
        
        this.element.disableDrag = () => this.element.removeEventListener('mousedown', mouse_down);
        this.element.enableDrag = () => this.element.addEventListener('mousedown', mouse_down);
        this.element.enableDrag();

        this.element.disablePins = () => Array.from(this._outputs).concat(Array.from(this._inputs)).forEach(p => p.dotElem.disableDrag());
        this.element.enablePins = () => Array.from(this._outputs).concat(Array.from(this._inputs)).forEach(p => p.dotElem.enableDrag());

        this.element.disable = () => {
            this.element.disableDrag();
            this.element.disablePins();
        };
        this.element.enable = () => {
            this.element.enableDrag();
            this.element.enablePins();
        };

        // setup input/ouput connections
        this._inputs = new Array(inputs).fill(undefined).map((_, i) => new Pin(this, 'input', i));
        this._outputs = new Array(outputs).fill(undefined).map((_, i) => new Pin(this, 'output', i));

        this._inputWrap = document.createElement('div');
        this._inputWrap.classList.add('component-conn-wrap', 'inputs');
        for (const conn of this._inputs)
            this._inputWrap.appendChild(conn.dotElem);
        this.element.appendChild(this._inputWrap);

        this._outputWrap = document.createElement('div');
        this._outputWrap.classList.add('component-conn-wrap', 'outputs');
        for (const conn of this._outputs)
            this._outputWrap.appendChild(conn.dotElem);
        this.element.appendChild(this._outputWrap);

        // set position
        this.position = position;

        // setup label
        this._label = document.createElement('span');
        this._label.classList.add('component-label');
        this.element.appendChild(this._label);
        this.label = label;
    }

    setBoard(board) {
        this.#board = board;
    }

    getPins() {
        return {
            inputs: this._inputs.slice(),
            outputs: this._outputs.slice(),
        };
    }
    getBinaryPins() {
        const { inputs, outputs } = this.getPins();
        return {
            inputs: inputs.map(p => p.getConnections().some(c => c.state === 1) ? 1 : 0),
            outputs: outputs.map(p => p.getConnections().some(c => c.state === 1) ? 1 : 0),
        }
    }

    updateConnections(inputs = true, outputs = true) {
        if (inputs === true) {
            for (const pin of this._inputs)
                for (const conn of pin.getConnections())
                    conn.updatePosition();
        }
        if (outputs === true) {
            for (const pin of this._outputs)
                for (const conn of pin.getConnections())
                    conn.updatePosition();
        }
    }

    update() {
        for (const pin of this._outputs)
            for (const conn of pin.getConnections())
                conn.update();
    }
}

export { Component }