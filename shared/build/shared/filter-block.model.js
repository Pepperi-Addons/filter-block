"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICalculatedFilter = exports.IFilter = void 0;
class IFilter {
    constructor() {
        this.title = '';
        this.pageParameterKey = '';
        this.dependsOn = ''; // list of all page parameters from the page (multi choise)
        this.optionsSource = {};
        this.useFirstValue = false;
        this.placeholder = '';
        this.placeholderWhenNoOptions = '';
    }
}
exports.IFilter = IFilter;
class ICalculatedFilter extends IFilter {
    constructor() {
        super(...arguments);
        // Calculated fields
        this.options = [];
        this.disabled = false;
        this.value = '';
    }
}
exports.ICalculatedFilter = ICalculatedFilter;
//# sourceMappingURL=filter-block.model.js.map