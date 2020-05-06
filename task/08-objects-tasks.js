'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
    this.height = height;
    this.getArea = function getarea() { return this.width * this.height; };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
const getJSON = (obj) => JSON.stringify(obj);



/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    throw new Error('Not implemented');
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

/* eslint max-classes-per-file: "off" */

class BaseSelector {
    constructor(value) {
        this.usedMethods = [];
        this.previousOrder = 0;
        if (value) this.result = value; else this.result = '';
        this.ELEMENT_METHOD = 1;
        this.ID_METHOD = 2;
        this.CLASS_METHOD = 3;
        this.ATTR_METHOD = 4;
        this.PSEUDO_CLASS_METHOD = 5;
        this.PSEUDO_ELEMENT_METHOD = 6;
    }

    validate(methodId) {
        if (methodId < this.previousOrder && this.result) {
            throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
        } else {
            this.previousOrder = methodId;
        }

        if (this.usedMethods.includes(methodId)
            && [this.ELEMENT_METHOD, this.ID_METHOD, this.PSEUDO_ELEMENT_METHOD].includes(methodId)) {
            throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
        } else {
            this.usedMethods.push(methodId);
        }
    }

    element(value) {
        this.validate(this.ELEMENT_METHOD);
        this.result += value;
        return this;
    }

    id(value) {
        this.validate(this.ID_METHOD);
        this.result += `#${value}`;
        return this;
    }

    class(value) {
        this.validate(this.CLASS_METHOD);
        this.result += `.${value}`;
        return this;
    }

    attr(value) {
        this.validate(this.ATTR_METHOD);
        this.result += `[${value}]`;
        return this;
    }

    pseudoClass(value) {
        this.validate(this.PSEUDO_CLASS_METHOD);
        this.result += `:${value}`;
        return this;
    }

    pseudoElement(value) {
        this.validate(this.PSEUDO_ELEMENT_METHOD);
        this.result += `::${value}`;
        return this;
    }

    stringify() {
        return this.result;
    }
}

class ElementSelector extends BaseSelector {
    constructor(value) {
        super();
        this.element(value);
    }
}

class IdSelector extends BaseSelector {
    constructor(value) {
        super();
        this.id(value);
    }
}

class ClassSelector extends BaseSelector {
    constructor(value) {
        super();
        this.class(value);
    }
}

class AttrSelector extends BaseSelector {
    constructor(value) {
        super();
        this.attr(value);
    }
}

class PseudoClassSelector extends BaseSelector {
    constructor(value) {
        super();
        this.pseudoClass(value);
    }
}

class PseudoElementSelector extends BaseSelector {
    constructor(value) {
        super();
        this.pseudoElement(value);
    }
}

const cssSelectorBuilder = {

    element(value) {
        return new ElementSelector(value);
    },

    id(value) {
        return new IdSelector(value);
    },

    class(value) {
        return new ClassSelector(value);
    },

    attr(value) {
        return new AttrSelector(value);
    },

    pseudoClass(value) {
        return new PseudoClassSelector(value);
    },

    pseudoElement(value) {
        return new PseudoElementSelector(value);
    },

    combine(selector1, combinator, selector2) {
        const combinedResult = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
        return new BaseSelector(combinedResult);
    },
};

module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};
