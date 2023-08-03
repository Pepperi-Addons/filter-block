export class IFilter {
    title: string = '';
    pageParameterKey: string = '';
    // dependsOn: string = ''; // list of all page parameters from the page (multi choise)
    optionsSource: any = undefined;
    useFirstValue: boolean = false;
    placeholder: string = '';
    hideWhenNoOptions: boolean = false;
    placeholderWhenNoOptions: string = '';
}

export class ICalculatedFilter extends IFilter {
    // Calculated fields
    options?: Array<{ key: string, value: string }> = [];
    hidden?: boolean = false;
    value?: string = '';
}

export interface ICalculatedFiltersEventResult {
    CalculatedFilters: Array<ICalculatedFilter>,
    Success: boolean,
    Error: any
}