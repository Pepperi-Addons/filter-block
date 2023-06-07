
export class IFilter {
    name: string = '';
    pageParameterKey: string = '';
    resource: any = {};
    dependsOn: string = '';
    title: string = '';
    useFirstValue: boolean = false;
    placeholder: string = '';
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
}