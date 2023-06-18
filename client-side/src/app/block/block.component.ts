import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IConfig, IHostObject } from '../block.model';
import { IPepOption, PepAddonService } from '@pepperi-addons/ngx-lib';
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";
import { IFilter, ICalculatedFilter, ICalculatedFiltersEventResult } from 'shared';

@Component({
    selector: 'page-block',
    templateUrl: './block.component.html',
    styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {
    @Input()
    set hostObject(value: IHostObject) {
        const isFirstLoad = this._configuration === undefined;
        const consumeParameterChanged = JSON.stringify(this._parameters) !== JSON.stringify(value.parameters);
        const filtersChanged = JSON.stringify(this._configuration?.filters) !== JSON.stringify(value.configuration?.filters);

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
    private _calculatedFiltersSubject: BehaviorSubject<Array<ICalculatedFilter>> = new BehaviorSubject<Array<ICalculatedFilter>>([]);
    get calculatedFiltersSubject$(): Observable<Array<ICalculatedFilter>> {
        return this._calculatedFiltersSubject.asObservable().pipe(distinctUntilChanged());
    }

    constructor(
        private translate: TranslateService,
        private addonService: PepAddonService) {
    }

    private notifyCalculatedFiltersChange(value: Array<ICalculatedFilter>) {
        this._calculatedFiltersSubject.next(value);
    }

    private setCalculatedFiltersFromEvent(eventResult: ICalculatedFiltersEventResult) {
        if (eventResult?.Success && eventResult.CalculatedFilters?.length > 0) {
            const calculatedFilters: Array<ICalculatedFilter> = eventResult.CalculatedFilters;
            
            for (let index = 0; index < calculatedFilters.length; index++) {
                const calculatedFilter = calculatedFilters[index];
                if (calculatedFilter.useFirstValue) {
                    this.setPageParameterValue(calculatedFilter.pageParameterKey, calculatedFilter.value);
                }
            }

            // Refresh all the calculated filters for let the options refresh.
            this.notifyCalculatedFiltersChange(calculatedFilters);
        } else {
            // TODO: Show error message.
        }
    }

    private getEventData() {
        const res = {
            filters: this.configuration.filters,
            parameters: { ...this.pageParameters, ...this.parameters },
        };
        return res;
    }

    private onClientFiltersBlockLoad() {
        if (this.configuration?.filters?.length > 0) {
            this.hostEvents.emit({
                action: 'emit-event',
                eventKey: 'OnClientFiltersBlockLoad',
                eventData: this.getEventData(),
                completion: (eventResult: ICalculatedFiltersEventResult) => {
                    this.setCalculatedFiltersFromEvent(eventResult);
                }
            });
        } else {
            this.notifyCalculatedFiltersChange([]);
        }
    }

    private onClientFiltersBlockChange() {
        if (this.configuration?.filters?.length > 0) {
            this.hostEvents.emit({
                action: 'emit-event',
                eventKey: 'OnConsumeParameterChange',
                eventData: this.getEventData(),
                completion: (eventResult: ICalculatedFiltersEventResult) => {
                    this.setCalculatedFiltersFromEvent(eventResult);
                }
            });
        } else {
            this.notifyCalculatedFiltersChange([]);
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
