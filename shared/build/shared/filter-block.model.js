"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICalculatedFilter = exports.IFilter = void 0;
class IFilter {
    constructor() {
        this.title = '';
        this.pageParameterKey = '';
        // dependsOn: string = ''; // list of all page parameters from the page (multi choise)
        this.optionsSource = undefined;
        this.useFirstValue = false;
        this.placeholder = '';
        this.hideWhenNoOptions = false;
        this.placeholderWhenNoOptions = '';
    }
}
exports.IFilter = IFilter;
class ICalculatedFilter extends IFilter {
    constructor() {
        super(...arguments);
        // Calculated fields
        this.options = [];
        this.hidden = false;
        this.value = '';
    }
}
exports.ICalculatedFilter = ICalculatedFilter;
//# sourceMappingURL=filter-block.model.js.map