import { Page } from "@pepperi-addons/papi-sdk";
import { ICalculatedFilter, IFilter } from "shared";

export interface ICommonConfig {
    direction: 'horizontal' | 'vertical';
    spacing: 'sm' | 'md' | 'lg';
    limitWidth: boolean;
    maxWidth: string;
}

export interface IConfig extends ICommonConfig {
    filters: Array<ICalculatedFilter>;
}

export interface IHostObject {
    state: any;
    configuration: IConfig;
}

export interface IEditorConfig extends ICommonConfig {
    filters: Array<IFilter>;
}
export interface IEditorHostObject {
    state: any;
    configuration: IEditorConfig;
    pageConfiguration: any;
    page: Page
}