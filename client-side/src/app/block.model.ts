import { IFilter } from "shared";

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
    pageParameters: any;
    parameters: any;
}