import { TranslateService } from '@ngx-translate/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IConfig, IHostObject } from '../block.model';
import { IPepOption, PepAddonService } from '@pepperi-addons/ngx-lib';
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";
import { IFilter, ICalculatedFilter, ICalculatedFiltersEventResult } from 'shared';
import { PepDialogData, PepDialogService } from '@pepperi-addons/ngx-lib/dialog';

@Component({
    selector: 'page-block',
    templateUrl: './block.component.html',
    styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {
    @Input()
    set hostObject(value: IHostObject) {
        this.updateData(value);
    }
    
    private _state: any; 
    get state(): any {
        return this._state;
    }

    private _configuration: IConfig; 
    get configuration(): IConfig {
        return this._configuration;
    }

    @Output() hostEvents: EventEmitter<any> = new EventEmitter<any>();
    
    // This subject is for load the calculated filters with the options.
    private _calculatedFiltersSubject: BehaviorSubject<Array<ICalculatedFilter>> = new BehaviorSubject<Array<ICalculatedFilter>>([]);
    get calculatedFiltersSubject$(): Observable<Array<ICalculatedFilter>> {
        return this._calculatedFiltersSubject.asObservable().pipe(distinctUntilChanged());
    }

    protected shouldBeVerticalOnSmallScreenSize: boolean = false;

    constructor(
        private translate: TranslateService,
        private dialogService: PepDialogService) {
    }

    private notifyCalculatedFiltersChange(value: Array<ICalculatedFilter>) {
        this._calculatedFiltersSubject.next(value);
    }

    private updateData(data: IHostObject) {
        if (data) {
            this._state = data.state;
            this._configuration = data.configuration;
            this.setCalculatedFilters(this._configuration);
        }
    }

    private setCalculatedFilters(configuration: IConfig) {
        const calculatedFilters: Array<ICalculatedFilter> = configuration?.filters || [];
        
        // Refresh all the calculated filters for let the options refresh.
        this.notifyCalculatedFiltersChange(calculatedFilters);
    }

    private registerStateChange(data: {state: any, configuration: any}) {
        this.updateData(data);
    }

    private registerScreenSizeChange(data: {state: any, configuration: any}) {
        // If the direction changed from horizontal to vertical because of the screen size, we set the flag to true.
        // When this flag is true, we will set the direction to vertical always.
        if (data.configuration.direction === 'vertical') {
            this.shouldBeVerticalOnSmallScreenSize = true;
        } else {
            this.shouldBeVerticalOnSmallScreenSize = false;
        }
    }

    ngOnInit(): void {
        this.hostEvents.emit({
            action: 'register-state-change',
            callback: this.registerStateChange.bind(this)
        });

        this.hostEvents.emit({
            action: 'register-screen-size-change',
            callback: this.registerScreenSizeChange.bind(this)
        });

        // this.onClientFiltersBlockLoad();
    }

    ngOnChanges(e: any): void {

    }

    setPageParameterValue(key: string, value: any) {
        // if (key.length > 0) {
        //     this.hostEvents.emit({
        //         action: 'set-parameter',
        //         key: key,
        //         value: value || ''
        //     });
        // }

        if (key.length > 0) {
            const changes = {};
            changes[key] = value || '';

            this.hostEvents.emit({
                action: 'state-change',
                changes: changes
            });
        }
    }
}
