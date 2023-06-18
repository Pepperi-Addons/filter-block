import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { Page, PageConfiguration, PageConfigurationParameter } from '@pepperi-addons/papi-sdk';
import { IConfig } from '../block.model';
import { PepButton } from '@pepperi-addons/ngx-lib/button';
import { FiltersBlockService } from '../services/filters-block.service';
import { IFilter } from 'shared';

@Component({
    selector: 'page-block-editor',
    templateUrl: './block-editor.component.html',
    styleUrls: ['./block-editor.component.scss'],
    providers: [ FiltersBlockService ]
})
export class BlockEditorComponent implements OnInit {
    @Input()
    set hostObject(value: any) {
        if (value && value.configuration && Object.keys(value.configuration).length > 0) {
            this._configuration = value.configuration
        } else {
            this.loadDefaultConfiguration();
        }

        this.pageParameters = value?.pageParameters;
        this.initPageConfiguration(value?.pageConfiguration);
        this.initPageBlocksData(value?.page);
    }
    
    private _configuration: IConfig;
    get configuration(): IConfig {
        return this._configuration;
    }

    // All the page parameters to set in page configuration when needed (for ScriptPicker addon usage).
    private _pageParameters: any;
    set pageParameters(value: any) {
        this._pageParameters = value;
    }
    get pageParameters(): any {
        return this._pageParameters || {};
    }

    // private consumeAllParameter: PageConfigurationParameter = {
    //     Key: '*',
    //     Type: 'String',
    //     Consume: true,
    //     Produce: true
    // };
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

    private initPageBlocksData(page: Page) {
        if (page?.Blocks?.length > 0) {
            const pageParametersParams = new Map<string, PageConfigurationParameter>();

            // Go over all the blocks in the page.
            for (let index = 0; index < page.Blocks.length; index++) {
                const block = page.Blocks[index];
                
                // Go over all the parameters in the block.
                for (let paramIndex = 0; paramIndex < block.PageConfiguration?.Parameters?.length; paramIndex++) {
                    const param = block.PageConfiguration.Parameters[paramIndex];
                    
                    if (!pageParametersParams.has(param.Key)) {
                        pageParametersParams.set(param.Key, param);
                    }
                }
            }

            // Set the page parameters in the service.
            this.filtersBlockService.pageParameters = pageParametersParams;
        }
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

    private getProduceParametersKeys(): Array<string> {
        const parametersKeys = [];
        for (let index = 0; index < this.configuration.filters.length; index++) {
            const filter = this.configuration.filters[index];
            if (filter.pageParameterKey) {
                parametersKeys.push(filter.pageParameterKey);
            }
        }

        return parametersKeys;
    }

    private getConsumeParametersKeys(): Array<string> {
        const parametersKeys = [];
        for (let index = 0; index < this.configuration.filters.length; index++) {
            const filter = this.configuration.filters[index];
            if (filter.dependsOn.length > 0) {
                parametersKeys.push(...filter.dependsOn.split(','));
            }
        }

        return parametersKeys;
    }

    private addParametersToPageConfiguration(params: string[], isProduce: boolean, isConsume: boolean) {
        // Add the parameters to page configuration.
        for (let index = 0; index < params.length; index++) {
            const parameterKey = params[index];
            
            this._pageConfiguration.Parameters.push({
                Key: parameterKey,
                Type: 'String',
                Consume: isConsume,
                Produce: isProduce
            });
        }
    }

    private updatePageConfigurationObject() {
        this.initPageConfiguration();
        
        // Add the consume all parameter.
        // this._pageConfiguration.Parameters.push(this.consumeAllParameter);

        // Get the produce parameters keys from the filters.
        const produceParametersKeys = this.getProduceParametersKeys();
        this.addParametersToPageConfiguration(produceParametersKeys, true, false);
        
        // Get the consume parameters keys from the filters.
        const consumeParametersKeys = this.getConsumeParametersKeys();
        this.addParametersToPageConfiguration(consumeParametersKeys, false, true);
        
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

        // // Add the consume all parameter if not exist.
        // if (!this._pageConfiguration.Parameters.find(param => param.Key === '*')) {
        //     this._pageConfiguration.Parameters.push(this.consumeAllParameter);
        //     this.emitSetPageConfiguration();
        // }
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
