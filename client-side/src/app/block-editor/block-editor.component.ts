import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { PageConfiguration } from '@pepperi-addons/papi-sdk';
import { IConfig, IFilter } from '../block.model';
import { PepButton } from '@pepperi-addons/ngx-lib/button';

@Component({
    selector: 'page-block-editor',
    templateUrl: './block-editor.component.html',
    styleUrls: ['./block-editor.component.scss']
})
export class BlockEditorComponent implements OnInit {
    @Input()
    set hostObject(value: any) {
        if (value && value.configuration && Object.keys(value.configuration).length > 0) {
            this._configuration = value.configuration
        } else {
            this.loadDefaultConfiguration();
        }

        this._pageParameters = value?.pageParameters || {};
        this.initPageConfiguration(value?.pageConfiguration);
    }
    
    private _configuration: IConfig;
    get configuration(): IConfig {
        return this._configuration;
    }

    // All the page parameters to set in page configuration when needed (for ScriptPicker addon usage).
    private _pageParameters: any;
    get pageParameters(): any {
        return this._pageParameters;
    }

    private defaultPageConfiguration: PageConfiguration = { "Parameters": [] };
    private _pageConfiguration: PageConfiguration;
    
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    
    directionTypes: Array<PepButton> = [];
    
    currentFilterIndex = -1;

    constructor(
        private translate: TranslateService
        ) {
    }

    private initPageConfiguration(value: PageConfiguration = null) {
        this._pageConfiguration = value || JSON.parse(JSON.stringify(this.defaultPageConfiguration));
    }

    private getDefaultHostObject(): IConfig {
        return { 
            filters: [], 
            direction: 'horizontal',
            spacing: 'sm',
            limitWidth: true,
            maxWidth: '12',
        };
    }

    private loadDefaultConfiguration() {
        this._configuration = this.getDefaultHostObject();
        this.updateHostObject();
    }

    private updateHostObject() {
        this.hostEvents.emit({
            action: 'set-configuration',
            configuration: this.configuration
        });
    }

    private getParametersKeys(): Array<string> {
        const parametersKeys = [];
        for (let index = 0; index < this.configuration.filters.length; index++) {
            const filter = this.configuration.filters[index];
            if (filter.pageParameterKey) {
                parametersKeys.push(filter.pageParameterKey);
            }
        }

        return parametersKeys;
    }

    private updatePageConfigurationObject() {
        // Get the parameters keys from the filters.
        const parametersKeys = this.getParametersKeys();
        this.initPageConfiguration();

        // Add the parameters to page configuration.
        for (let index = 0; index < parametersKeys.length; index++) {
            const parameterKey = parametersKeys[index];
            
            this._pageConfiguration.Parameters.push({
                Key: parameterKey,
                Type: 'String',
                Consume: false,
                Produce: true
            });
        }

        this.hostEvents.emit({
            action: 'set-page-configuration',
            pageConfiguration: this._pageConfiguration
        });
    }

    ngOnInit(): void {
        this.translate.get('HORIZONTAL').subscribe((res: string) => { 
            this.directionTypes = [
                { key: 'horizontal', value: this.translate.instant('HORIZONTAL')}, //, callback: (event: any) => this.onFieldChange('direction',event) },
                { key: 'vertical', value: this.translate.instant('VERTICAL')}//, callback: (event: any) => this.onFieldChange('direction',event) }
            ]
        });
    }

    ngOnChanges(e: any): void {
    }

    onFilterChange(event: IFilter, index: number) {
        if (event) {
            this._configuration.filters[index] = event;
            this.updateHostObject();
            this.updatePageConfigurationObject();
        }
    }

    addNewFilterClick() {
        let filter = new IFilter();
        this.configuration.filters.push(filter); 
        this.updateHostObject();
    }

    onFilterToggle(event: boolean, index: number) {
        // First toggle the event.
        event = !event;
        this.currentFilterIndex = event ? index : -1;
    }

    onFilterRemoveClick(index: number){
        this.configuration.filters.splice(index, 1);
        this.updateHostObject();
    }

    onFieldChange(key, event){
        const value = event && event.source && event.source.key ? event.source.key : event && event.source && event.source.value ? event.source.value :  event;
        this.configuration[key] = value;
        this.updateHostObject();
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(this.configuration.filters, event.previousIndex, event.currentIndex);
            this.updateHostObject();
        } 
    }

    onDragStart(event: CdkDragStart) {
    }

    onDragEnd(event: CdkDragEnd) {
    }
}
