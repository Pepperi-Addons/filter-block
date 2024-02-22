import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IPepOption } from '@pepperi-addons/ngx-lib';
import { FiltersBlockService } from '../services/filters-block.service';
import { IFilter } from 'shared';
import { IPepMenuItemClickEvent, PepMenuItem } from '@pepperi-addons/ngx-lib/menu';
import { TranslateService } from '@ngx-translate/core';

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
    // dependsOnOptions: Array<IPepOption> = [];
    actionsMenu: Array<PepMenuItem> = [];
        
    optionsSourceHostObject;

    constructor(
        private translate: TranslateService,
        private filtersBlockService: FiltersBlockService
    ) { 

    }

    private prepareOptionsSourceHostObject() {
        this.optionsSourceHostObject = {};
        const runFlowData = this.filter.optionsSource;
        const fields = {};

        this.filtersBlockService.flowDynamicParameters.forEach((value, key) => {
            fields[key] = {
                Type: value || 'String'
            };
        });
        
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

        this.translate.get('DELETE_FILTER').subscribe((res: string) => {
            this.actionsMenu = [
                { key: 'delete', text: this.translate.instant('DELETE_FILTER') }
            ]
        });

        // this.filtersBlockService.dependsOnOptionsSubject$.subscribe((options) => {
        //     this.dependsOnOptions = options;
        // });
    }

    onRemoveClick() {
        this.removeClick.emit();
    }

    onToggle(event) {
        this.toggle.emit(event);
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

    onMenuItemClick(item: IPepMenuItemClickEvent){
        if(item?.source?.key == 'delete'){
            this.removeClick.emit();
        }
    }
}
