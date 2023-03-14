import { uuidv4 } from "../../Utils/uuidv4.mjs";

class SvgElement {
    #uuid;
    
    _element;

    get uuid() { return this.#uuid; }
    get element() { return this._element; }

    constructor(element) {
        this.#uuid = uuidv4();
        this._element = element;
        this._element.id = this.#uuid;
    }

    remove() {
        this._element.remove();
    }

    static CreateElement(type) {
        return document.createElementNS("http://www.w3.org/2000/svg", type);
    }
}

export { SvgElement }