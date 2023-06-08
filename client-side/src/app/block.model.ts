import { IPepOption } from "@pepperi-addons/ngx-lib";

export class IFilter {
    title: string = '';
    pageParameterKey: string = '';
    dependsOn: string = ''; // list of all page parameters from the page (multi choise)
    optionsSource: any = {};
    useFirstValue: boolean = false;
    placeholder: string = '';
    placeholderWhenNoOptions: string = '';
}

export class ICalculatedFilter extends IFilter {
    // Calculated fields
    options?: Array<IPepOption> = [];
    disabled?: boolean = false;
    value?: string = '';
}

export interface IConfig {
    filters: Array<IFilter>;
    direction: string;
    spacing: string;
    limitWidth: boolean;
    maxWidth: string;
}

export interface IHostObject {
    configuration: IConfig;
    pageConfiguration: any;
    parameters: any;
}