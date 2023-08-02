import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { Page, PageConfiguration, PageConfigurationParameter } from '@pepperi-addons/papi-sdk';
import { IEditorConfig, IEditorHostObject } from '../block.model';
import { PepButton } from '@pepperi-addons/ngx-lib/button';
import { FiltersBlockService } from '../services/filters-block.service';
import { IFilter } from 'shared';

@Component({
    selector: 'page-block-editor',
    templateUrl: './block-editor.component.html',
    styleUrls: ['./block-editor.component.scss']
})
export class BlockEditorComponent implements OnInit {
    @Input()
    set hostObject(value: IEditorHostObject) {
        if (value && value.configuration && Object.keys(value.configuration).length > 0) {
            this._configuration = value.configuration
        } else {
            this.loadDefaultConfiguration();
        }

        this.initPageConfiguration(value?.pageConfiguration);
        this._page = value?.page;
        this.filtersBlockService.recalculateEditorData(this._page, this._pageConfiguration);
    }
    
    private _configuration: IEditorConfig;
    get configuration(): IEditorConfig {
        return this._configuration;
    }
    
    private _page: Page;
    get page(): Page {
        return this._page;
    }

    private defaultPageConfiguration: PageConfiguration = { "Parameters": []};

    private _pageConfiguration: PageConfiguration;
    
    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    
    directionTypes: Array<PepButton> = [];
    
    currentFilterIndex = -1;

    constructor(
        private translate: TranslateService,
        private filtersBlockService: FiltersBlockService
        ) {
    }
    
    private initPageConfiguration(value: PageConfiguration = null) {
        this._pageConfiguration = value || JSON.parse(JSON.stringify(this.defaultPageConfiguration));
    }

    private getDefaultHostObject(): IEditorConfig {
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

    private getProduceParametersKeys(): Map<string, string> {
        const parametersKeys = new Map<string, string>();
        for (let index = 0; index < this.configuration.filters.length; index++) {
            const filter = this.configuration.filters[index];
            if (filter.pageParameterKey) {
                parametersKeys.set(filter.pageParameterKey, filter.pageParameterKey);
            }
        }

        return parametersKeys;
    }

    private getConsumeParametersKeys(produceParametersKeys: Map<string, string>): Map<string, string> {
        const parametersKeys = new Map<string, string>();
        for (let index = 0; index < this.configuration.filters.length; index++) {
            const filter = this.configuration.filters[index];
            if (filter.dependsOn.length > 0) {
                const tmpArr = filter.dependsOn.split(';');
                // Check if the parameter is not in the produce parameters keys, then add it.
                for (let paramIndex = 0; paramIndex < tmpArr.length; paramIndex++) {
                    const paramKey = tmpArr[paramIndex];
                    if (!produceParametersKeys.has(paramKey)) {
                        parametersKeys.set(paramKey, paramKey);
                    }
                }
            }
        }

        return parametersKeys;
    }

    private addParametersToPageConfiguration(paramsMap: Map<string, string>, isProduce: boolean, isConsume: boolean) {
        const params = Array.from(paramsMap.values());

        // Add the parameters to page configuration.
        for (let index = 0; index < params.length; index++) {
            const parameterKey = params[index];
            const paramIndex = this._pageConfiguration.Parameters.findIndex(param => param.Key === parameterKey);

            // If the parameter exist, update the consume/produce.
            if (paramIndex >= 0) {
                this._pageConfiguration.Parameters[paramIndex].Consume = this._pageConfiguration.Parameters[paramIndex].Consume || isConsume;
                this._pageConfiguration.Parameters[paramIndex].Produce = this._pageConfiguration.Parameters[paramIndex].Produce || isProduce;
            } else {
                // Add the parameter only if not exist.
                this._pageConfiguration.Parameters.push({
                    Key: parameterKey,
                    Type: 'String',
                    Consume: isConsume,
                    Produce: isProduce
                });
            }
        }
    }

    private updatePageConfigurationObject() {
        this.initPageConfiguration();
        
        // Get the produce parameters keys from the filters.
        const produceParametersKeys = this.getProduceParametersKeys();
        this.addParametersToPageConfiguration(produceParametersKeys, true, true);
        
        // Get the consume parameters keys from the filters.
        const consumeParametersKeys = this.getConsumeParametersKeys(produceParametersKeys);
        this.addParametersToPageConfiguration(consumeParametersKeys, false, true);
        
        // After adding the params to the page configuration need to recalculate the page parameters.
        this.filtersBlockService.recalculateEditorData(this._page, this._pageConfiguration);

        this.emitSetPageConfiguration();
    }

    private emitSetPageConfiguration() {
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
