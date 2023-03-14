import { AssertType } from "../Utils/Assert.mjs";
import { Vector2D } from "../Utils/Vector2D.mjs";
import { BoardNode } from "./BoardNode.mjs";
import { Component } from "./Components/Component.mjs";
import { SvgElement } from "./SvgElements/SvgElement.mjs";

class Board {
    #svgElements;
    #components;
    #menu;
    #menuShowing;
    #inputs;
    #outputs;
    
    _wrap;
    _div;
    _menu;
    _svg;
    _inputs;
    _outputs;

    get width() { return this._div.offsetWidth; }
    get height() { return this._div.offsetHeight; }

    constructor(target) {
        this.#menu = {};
        this.#menuShowing = false;

        this.#inputs = [];
        this.#outputs = [];

        this.#components = {};
        this.#svgElements = {};

        this._wrap = document.createElement('div');
        this._wrap.classList.add('board');

        this._div = document.createElement('div');
        this._div.classList.add('board-body');

        this._menu = document.createElement('div');
        this._menu.classList.add('board-menu');

        this._svg = SvgElement.CreateElement('svg');
        this._svg.classList.add('board-svg');

        this._inputs = document.createElement('div');
        this._inputs.classList.add('board-nodes', 'board-inputs');
        this._inputs.setAttribute('node-type', 'output');

        this._outputs = document.createElement('div');
        this._outputs.classList.add('board-nodes', 'board-outputs');
        this._outputs.setAttribute('node-type', 'input');

        const nodeSetup = [
            { elem: this._inputs, arr: this.#inputs },
            { elem: this._outputs, arr: this.#outputs },
        ];
        for (const item of nodeSetup) {
            const node = document.createElement('div');
            node.classList.add('board-node');
            item.elem.appendChild(node);

            const addBtn = document.createElement('button');
            addBtn.classList.add('board-node-addBtn');
            addBtn.innerHTML = '&#x2b;';
            node.appendChild(addBtn);

            addBtn.addEventListener('click', () => this.#addNode(item.elem, item.arr));
        }
        
        this._wrap.appendChild(this._svg);
        this._wrap.appendChild(this._div);
        this._wrap.appendChild(this._inputs);
        this._wrap.appendChild(this._outputs);
        this._wrap.appendChild(this._menu);
        
        target.appendChild(this._wrap);

        let resizeTmout;
        target.ownerDocument.defaultView.addEventListener('resize', () => {
            clearTimeout(resizeTmout);
            resizeTmout = setTimeout(() => {
                this.resized();
            }, 100);
        });
        this.resized();
    }

    resized() {
        this._svg.setAttribute('width', this.width);
        this._svg.setAttribute('height', this.height);
        this._svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    }

    addComponentMenu(component) {
        AssertType(component, Component);
        if (this.#menu[component.typeName] !== undefined)
            return;

        this.#menu[component.typeName] = component;
        component.element.disable();
        component.element.addEventListener('click', () => {
            // add to board
            const centerScreen = new Vector2D(this.width / 2, this.height / 2);
            this.addComponent(new component.constructor(centerScreen));
        });
        this.updateMenu();
    }
    removeComponentMenu(typeName) {
        if (typeName instanceof Component)
            typeName = typeName.typeName;

        if (this.#menu[typeName] === undefined)
            return false;

        delete this.#menu[typeName];
        this.updateMenu();
        return true;
    }
    updateMenu() {
        while(this._menu.firstChild)
            this._menu.firstChild.remove();
        
        const items = Object.values(this.#menu);
        items.sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
        for (const item of items) {
            this._menu.appendChild(item.element);
        }
    }
    toggleMenu(show) {
        this.#menuShowing = show ?? !this.#menuShowing;
        this._menu.classList.toggle('show', this.#menuShowing);
    }

    addComponent(component) {
        AssertType(component, Component);
        this.#components[component.uuid] = component;
        this._div.appendChild(component.element);
        component.setBoard(this);
    }
    removeComponent(uuid) {
        if (uuid instanceof Component)
            uuid = uuid.uuid;

        if (this.#components[uuid] === undefined)
            return false;

        this.#components[uuid].setBoard(undefined);
        this.#components[uuid].element.remove();
        delete this.#components[uuid];
        return true;
    }

    addSvgElement(svgElement) {
        AssertType(svgElement, SvgElement);
        this.#svgElements[svgElement.uuid] = svgElement;
        this._svg.appendChild(svgElement.element);
    }
    removeSvgElement(uuid) {
        if (uuid instanceof SvgElement)
            uuid = uuid.uuid;

        if (this.#svgElements[uuid] === undefined)
            return false;

        this.#svgElements[uuid].element.remove();
        delete this.#svgElements[uuid];
        return true;
    }

    *getComponents() {
        for(const uuid in this.#components)
            yield this.#components[uuid];
    }
    *getSvgElements() {
        for(const uuid in this.#svgElements)
            yield this.#svgElements[uuid];
    }

    #addNode(elem, nodeArr) {
        const type = elem.getAttribute('node-type');
        const num_existing = elem.querySelectorAll('.board-node[node-type]').length;
        
        const node = new BoardNode(this, type, num_existing + 1);
        elem.prepend(node._element);

        nodeArr.forEach(n => n.updateConnections());

        nodeArr.push(node);

        // check for overflow
        elem.style.justifyContent = elem.clientHeight < elem.scrollHeight
            ? 'flex-start'
            : '';        
    }
    addInput() {
        this.#addNode(this._inputs, this.#inputs);
    }
    addOutput() {
        this.#addNode(this._outputs, this.#inputs);
    }
}

export { Board }