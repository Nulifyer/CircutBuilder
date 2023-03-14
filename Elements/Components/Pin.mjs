import { Line } from "../SvgElements/Line.mjs";
import { WireConnection } from "../Connectors/WireConnection.mjs";
import { Vector2D } from "../../Utils/Vector2D.mjs";
import { AssertType } from "../../Utils/Assert.mjs";
import { Component } from "./Component.mjs";

class Pin {
    #component;
    #type;
    #pinNum;
    #dotElem;
    #connections;

    get dotElem() { return this.#dotElem; }
    get type() { return this.#type; }
    get pinNum() { return this.#pinNum; }
    get component() { return this.#component; }
    get position() {
        const rect = this.dotElem.getBoundingClientRect();
        return new Vector2D(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    constructor(component, type, pinNum) {
        AssertType(component, Component, true);

        this.#component = component;
        this.#type = type;
        this.#pinNum = pinNum;
        this.#connections = [];

        this.#dotElem = document.createElement('div');
        this.#dotElem.classList.add('conn-pin');
        this.dotElem.disableDrag = () => {};
        this.dotElem.enableDrag = () => {};

        if (this.type === 'output') {
            // setup mouse drag
            let mouse_down, mouse_up, mouse_drag;
            let mouse_down_start, mouse_down_hold = 200;
            let mouse_drag_tmout;
            let drag_wire;
            mouse_drag = (e) => {
                if (Date.now() - mouse_down_start > mouse_down_hold) {
                    const mouseVec = new Vector2D(e.clientX, e.clientY);
                    if (drag_wire)
                        drag_wire.setB(mouseVec);
                    else {
                        self.dragging_pin = this;
                        drag_wire = new Line(this.position, mouseVec, { color: this.component?.connectionColor, width: 2 });
                        this.component?.board.addSvgElement(drag_wire);
                    }
                }
            };
            mouse_down = (e) => {
                e.stopPropagation();
                mouse_down_start = Date.now();
                if (drag_wire) {
                    drag_wire.remove();
                    this.component?.board.removeSvgElement(drag_wire);
                    drag_wire = undefined;
                }
                self.addEventListener('mousemove', mouse_drag);
                self.addEventListener('mouseup', mouse_up);
                mouse_drag_tmout = setTimeout(() => {
                    this.dotElem.classList.add('dragging');
                }, mouse_down_hold);
            };
            mouse_up = (e) => {
                clearTimeout(mouse_drag_tmout);
                if (drag_wire) {
                    drag_wire.remove();
                    this.component?.board.removeSvgElement(drag_wire);
                    drag_wire = undefined;
                }
                self.dragging_pin = undefined;
                self.removeEventListener('mousemove', mouse_drag);
                self.removeEventListener('mouseup', mouse_up);
                this.dotElem.classList.remove('dragging');
            };
            this.dotElem.disableDrag = () => this.dotElem.removeEventListener('mousedown', mouse_down);
            this.dotElem.enableDrag = () => this.dotElem.addEventListener('mousedown', mouse_down);
            this.dotElem.enableDrag();
        }
        else if (this.type === 'input') {
            this.dotElem.addEventListener('mouseup', (e) => {
                if (self.dragging_pin instanceof Pin && self.dragging_pin !== this) {
                    const conn = new WireConnection(self.dragging_pin, this);
                    conn.connect();
                }
            });
        }
        this.dotElem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            for (const c of this.getConnections())
                c.disconnect();
        });
    }

    getConnections() {
        return this.#connections.slice();
    }

    connect(wire_connection) {
        AssertType(wire_connection, WireConnection);
        this.#connections.push(wire_connection);
        this.component?.board.addSvgElement(wire_connection.wire);
    }
    disconnect(wire_connection) {
        AssertType(wire_connection, WireConnection);
        const idx = this.#connections.indexOf(wire_connection);
        const [conn] = this.#connections.splice(idx, 1);
        this.component?.board.removeSvgElement(conn.wire);
    }
}

export { Pin }