export declare class IFilter {
    title: string;
    pageParameterKey: string;
    dependsOn: string;
    optionsSource: any;
    useFirstValue: boolean;
    placeholder: string;
    hideWhenNoOptions: boolean;
    placeholderWhenNoOptions: string;
}
export declare class ICalculatedFilter extends IFilter {
    options?: Array<{
        key: string;
        value: string;
    }>;
    hidden?: boolean;
    value?: string;
}
export interface ICalculatedFiltersEventResult {
    CalculatedFilters: Array<ICalculatedFilter>;
    Success: boolean;
    Error: any;
}
