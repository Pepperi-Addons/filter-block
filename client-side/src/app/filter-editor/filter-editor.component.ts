import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IPepOption } from '@pepperi-addons/ngx-lib';
import { FiltersBlockService } from '../services/filters-block.service';
import { IFilter } from 'shared';

@Component({
    selector: 'filter-editor',
    templateUrl: './filter-editor.component.html',
    styleUrls: ['./filter-editor.component.scss']
})
export class FilterEditorComponent implements OnInit {
    
    @Input() index: string;
    
    private _filter: IFilter;
    @Input()
    set filter(value: IFilter) {
        this._filter = value;
        this.prepareOptionsSourceHostObject();
    }
    get filter(): IFilter {
        return this._filter;
    }

    @Input() isOpen: boolean = false;
    @Input() isDraggable = false;
    @Input() showActions = true;

    @Output() filterChange: EventEmitter<IFilter> = new EventEmitter<IFilter>();
    @Output() removeClick: EventEmitter<void> = new EventEmitter();
    @Output() toggle: EventEmitter<boolean> = new EventEmitter();

    dialogRef: MatDialogRef<any>;
    pageParameterOptions: Array<IPepOption> = [];
    dependsOnOptions: Array<IPepOption> = [];

    optionsSourceHostObject;

    constructor(
        private filtersBlockService: FiltersBlockService
    ) { 

    }

    private prepareOptionsSourceHostObject() {
        this.optionsSourceHostObject = {};
        const runFlowData = this.filter.optionsSource;
        const fields = {};

        if (runFlowData) {
            this.filtersBlockService.currentProducersMap.forEach((value, key) => {
                fields[key] = {
                    Type: value.Type || 'String'
                };
            });

            if (this.filter.dependsOn.length > 0) {
                const paramsKeys = this.filter.dependsOn.split(';');
                
                for (let index = 0; index < paramsKeys.length; index++) {
                    const paramKey = paramsKeys[index];
                    fields[paramKey] = {
                        Type: 'String'
                    }                
                }
                
            }
        }
        
        this.optionsSourceHostObject['runFlowData'] = runFlowData?.FlowKey ? runFlowData : undefined;
        this.optionsSourceHostObject['fields'] = fields;
    }

    private updateFilter() {
        this.filterChange.emit(this.filter);
        this.prepareOptionsSourceHostObject();
    }

    ngOnInit(): void {
        this.filtersBlockService.pageParameterOptionsSubject$.subscribe((options) => {
            this.pageParameterOptions = options;
        });

        this.filtersBlockService.dependsOnOptionsSubject$.subscribe((options) => {
            this.dependsOnOptions = options;
        });
    }

    onRemoveClick() {
        this.removeClick.emit();
    }

    onToggle() {
        this.toggle.emit(this.isOpen);
    }

    onFilterFieldChange(key, event) {
        const value = event && event.source && event.source.key ? event.source.key : event && event.source && event.source.value ? event.source.value : event;
        
        if (this.filter[key] !== value) {
            this.filter[key] = value;
            this.updateFilter();
        }
    }

    onOptionsSourceChange(flowData: any) {
        this.filter.optionsSource = flowData;
        this.updateFilter();
    }
}
