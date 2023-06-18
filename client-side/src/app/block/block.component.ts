import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IConfig, IHostObject } from '../block.model';
import { IPepOption, PepAddonService } from '@pepperi-addons/ngx-lib';
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";
import { IFilter, ICalculatedFilter } from 'shared';


@Component({
    selector: 'page-block',
    templateUrl: './block.component.html',
    styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {
    @Input()
    set hostObject(value: IHostObject) {
        const consumeParameterChanged = JSON.stringify(this._parameters) !== JSON.stringify(value.parameters);
        const filtersChanged = JSON.stringify(this._configuration.filters) !== JSON.stringify(value.configuration.filters);
        const isFirstLoad = this._configuration === undefined;

        this._configuration = value?.configuration;
        this._pageConfiguration = value?.pageConfiguration;
        this._pageParameters = value?.pageParameters;
        this._parameters = value?.parameters;
        
        // Load filters only if (!isFirstLoad && filtersChanged), this is for edit mode when can change the editor !!!.
        if (!isFirstLoad && filtersChanged) {
            this.onClientFiltersBlockLoad();
        }

        // Load filters only if (!isFirstLoad && consumeParameterChanged) {
        if (!isFirstLoad && consumeParameterChanged) {
            this.onClientFiltersBlockChange();
        }
    }
    
    private _configuration: IConfig; 
    get configuration(): IConfig {
        return this._configuration;
    }

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    
    private _pageConfiguration: any;

    private _pageParameters: any;
    get pageParameters(): any {
        return this._pageParameters || {};
    }

    private _parameters: any;
    get parameters(): any {
        return this._parameters || {};
    }

    // This subject is for load the calculated filters with the options.
    private _calculateFilters: Array<ICalculatedFilter> = [];
    private _calculateFiltersSubject: BehaviorSubject<Array<ICalculatedFilter>> = new BehaviorSubject<Array<ICalculatedFilter>>([]);
    get calculateFiltersSubject$(): Observable<Array<ICalculatedFilter>> {
        return this._calculateFiltersSubject.asObservable().pipe(distinctUntilChanged());
    }

    constructor(
        private translate: TranslateService,
        private addonService: PepAddonService) {
    }

    private notifyCalculatedFiltersChange(value: Array<ICalculatedFilter>) {
        this._calculateFiltersSubject.next(value);
    }

    private buildCalculatedFilters(eventResult: any) {
        // Refresh all the calculated filters for let the options refresh.
        this.notifyCalculatedFiltersChange(this._calculateFilters);
    }

    private getEventData() {
        return {
            filters: this.configuration.filters,
            parameters: { ...this.pageParameters, ...this.parameters },
        };
    }

    private onClientFiltersBlockLoad() {
        // run the flow.
        this.hostEvents.emit({
            action: 'emit-event',
            eventKey: 'OnClientFiltersBlockLoad',
            eventData: this.getEventData(),
            completion: (eventResult) => {
                this.buildCalculatedFilters(eventResult);
            }
        });
    }

    private onClientFiltersBlockChange() {
        // run the flow.
        this.hostEvents.emit({
            action: 'emit-event',
            eventKey: 'OnConsumeParameterChange',
            eventData: this.getEventData(),
            completion: (eventResult) => {
                this.buildCalculatedFilters(eventResult);
            }
        });
    }


    // private prepareFiltersData() {
    //     this._calculateFilters = [];
        
    //     for (let index = 0; index < this.configuration.filters.length; index++) {
    //         const filter = this.configuration.filters[index];
            
    //         const calculatedFilter: ICalculatedFilter = {...filter};
    //         this.loadFilterOptions(filter, calculatedFilter);
            
    //         this._calculateFilters.push(calculatedFilter);
    //     }

    //     this.notifyCalculatedFiltersChange(this._calculateFilters);
    // }

    // private loadFilterOptions(filter: IFilter, calculatedFilter: ICalculatedFilter) {
    //     calculatedFilter.options = [];

    //     if (filter.optionsSource?.FlowKey?.length > 0) {
    //         const dynamicParamsData = {};
            
    //         if (filter.optionsSource.FlowParams) {
    //             const dynamicParams = [];

    //             // Get all dynamic parameters to set their value on the data property later.
    //             const keysArr = Object.keys(filter.optionsSource.FlowParams);
    //             for (let index = 0; index < keysArr.length; index++) {
    //                 const key = keysArr[index];
                    
    //                 if (filter.optionsSource.FlowParams[key].Source === 'Dynamic') {
    //                     dynamicParams.push(filter.optionsSource.FlowParams[key].Value);
    //                 }
    //             }
                
    //             // Set the dynamic parameters values on the data property.
    //             for (let index = 0; index < dynamicParams.length; index++) {
    //                 const param = dynamicParams[index];
    //                 dynamicParamsData[param] = this.parameters[param] || this.pageParameters[param] || '';
    //             }
    //         }
        
    //         // setTimeout(async () => {
    //             const runFlowData = {
    //                 optionsSource: filter.optionsSource,
    //                 dynamicParamsData: dynamicParamsData
    //             };
                
    //             // run the flow.
    //             this.hostEvents.emit({
    //                 action: 'emit-event',
    //                 eventKey: 'RunFilterFlow',
    //                 eventData: runFlowData,
    //                 completion: (eventResult) => {
    //                     // debugger;
    //                     // Set the filter options
    //                     const options = new Array<IPepOption>();
    //                     for (let index = 0; index < eventResult?.Options?.length; index++) {
    //                         const option = eventResult?.Options[index];
    //                         options.push({ key: option.Key, value: option.Title });
    //                     }
    
    //                     calculatedFilter.options = options;
                        
    //                     this.setCalculatedFilterData(filter, calculatedFilter);

    //                     // Refresh all the calculated filters for let the options refresh.
    //                     this.notifyCalculatedFiltersChange(this._calculateFilters);
    //                 }
    //             });
    //         // }, 0);
    //     } else {
    //         this.setCalculatedFilterData(filter, calculatedFilter);
    //     }
        
    // }

    private setCalculatedFilterData(filter: IFilter, calculatedFilter: ICalculatedFilter) {
        const hasOptions = calculatedFilter.options?.length > 0;
        calculatedFilter.disabled = !hasOptions;

        // If this parameter has value in the page parameters and exist in the options, use it.
        if (this.parameters.hasOwnProperty(filter.pageParameterKey) && hasOptions &&
            calculatedFilter.options.some(option => option.key === this.parameters[filter.pageParameterKey])) {
            calculatedFilter.value = this.parameters[filter.pageParameterKey];
        } else if (calculatedFilter.options?.length > 0) { // If this parameter has options, use the first option if useFirstValue is true else set it to ''.
            calculatedFilter.value = filter.useFirstValue ? calculatedFilter.options[0].key : '';

            if (filter.useFirstValue) {
                this.setPageParameterValue(filter.pageParameterKey, calculatedFilter.value);
            }
        } else {
            calculatedFilter.value = '';
        }
        
    }

    ngOnInit(): void {
        this.onClientFiltersBlockLoad();
    }

    ngOnChanges(e: any): void {

    }

    setPageParameterValue(key: string, value: any) {
        if (key.length > 0) {
            this.hostEvents.emit({
                action: 'set-parameter',
                key: key,
                value: value || ''
            });
        }
    }
}
