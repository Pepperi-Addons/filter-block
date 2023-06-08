import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ICalculatedFilter, IConfig, IFilter, IHostObject } from '../block.model';
import { IPepOption } from '@pepperi-addons/ngx-lib';

@Component({
    selector: 'page-block',
    templateUrl: './block.component.html',
    styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {
    @Input()
    set hostObject(value: IHostObject) {
        this._configuration = value?.configuration;
        this._pageConfiguration = value?.pageConfiguration;
        this._parameters = value?.parameters || {};
        
        this.prepareFiltersData();
    }
    
    private _configuration: IConfig; 
    get configuration(): IConfig {
        return this._configuration;
    }

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    
    private _pageConfiguration: any;
    private _parameters: any;
    protected calculateFilters: Array<ICalculatedFilter> = [];

    constructor(private translate: TranslateService) {
    }

    private prepareFiltersData() {
        this.calculateFilters = [];
        for (let index = 0; index < this.configuration.filters.length; index++) {
            const filter = this.configuration.filters[index];
            
            const calculatedFilter: ICalculatedFilter = {...filter};
            calculatedFilter.options = this.getFilterOptions(filter);
            calculatedFilter.disabled = !(calculatedFilter.options && calculatedFilter.options.length > 0);

            // If this parameter has value in the page parameters, use it. Otherwise, use the first value.
            if (this._parameters.hasOwnProperty(filter.pageParameterKey)) {
                calculatedFilter.value = this._parameters[filter.pageParameterKey];
            } else if (calculatedFilter.options && calculatedFilter.options.length > 0) {
                calculatedFilter.value = filter.useFirstValue ? calculatedFilter.options[0].key : '';

                if (filter.useFirstValue) {
                    this.setPageParameterValue(filter.pageParameterKey, calculatedFilter.value);
                }
            } else {
                calculatedFilter.value = '';
            }
            
            this.calculateFilters.push(calculatedFilter);
        }
    }

    private getFilterOptions(filter: IFilter) {
        // TODO: Get the filter options
        const options = new Array<IPepOption>();
        options.push({ key: '1', value: 'Option 1' });
        options.push({ key: '2', value: 'Option 2' });
        return options;
    }

    ngOnInit(): void {
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
