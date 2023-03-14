import { AssertType } from "../../Utils/Assert.mjs";
import { Vector2D } from "../../Utils/Vector2D.mjs";
import { SvgElement } from "./SvgElement.mjs";
import { CColor } from "../../Utils/Color.mjs";

class Line extends SvgElement {
    #vecA;
    #vecB;

    #color;
    #width;

    constructor(vecA, vecB, options) {
        super(SvgElement.CreateElement('line'));
        AssertType(vecA, Vector2D);
        AssertType(vecB, Vector2D);

        this.setA(vecA);
        this.setB(vecB);
        this.color = options.color;
        this.width = options.width;
    }

    get color() { return this.#color; }
    set color(value) {
        this.#color = new CColor(value ?? 'black');
        this._element.setAttribute('stroke', this.#color.toHslaString());
    }

    get width() { return this.#width; }
    set width(value) {
        this.#width = Math.max(value ??= 1, 1);        
        this._element.setAttribute('stroke-width', this.#width);
    }

    setA(vector) {
        this.#vecA = vector;
        this._element.setAttribute('x1', vector.x);
        this._element.setAttribute('y1', vector.y);
    }
    setB(vector) {
        this.#vecB = vector;
        this._element.setAttribute('x2', vector.x);
        this._element.setAttribute('y2', vector.y);
    }
}

export { Line }