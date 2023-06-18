import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { IPepOption } from '@pepperi-addons/ngx-lib';
import { PepAddonBlockLoaderService } from '@pepperi-addons/ngx-lib/remote-loader';
import { IConfig } from '../block.model';
import { FiltersBlockService } from '../services/filters-block.service';
import { IFilter } from 'shared';

@Component({
    selector: 'filter-editor',
    templateUrl: './filter-editor.component.html',
    styleUrls: ['./filter-editor.component.scss']
})
export class FilterEditorComponent implements OnInit {
    
    @Input() index: string;
    @Input() filter: IFilter;
    @Input() isOpen: boolean = false;
    @Input() isDraggable = false;
    @Input() showActions = true;

    @Output() filterChange: EventEmitter<IFilter> = new EventEmitter<IFilter>();
    @Output() removeClick: EventEmitter<void> = new EventEmitter();
    @Output() toggle: EventEmitter<boolean> = new EventEmitter();

    dialogRef: MatDialogRef<any>;
    dependsOnOptions: Array<IPepOption> = [];

    constructor(
        private translate: TranslateService,
        private viewContainerRef: ViewContainerRef,
        private addonBlockLoaderService: PepAddonBlockLoaderService,
        private filtersBlockService: FiltersBlockService
    ) { 

    }

    private updateFilter() {
        this.filterChange.emit(this.filter);
    }

    ngOnInit(): void {
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
        this.filter[key] = value;
        this.updateFilter();
    }

    openOptionsSourcePickerDialog() {
        const resource = {};
        const runFlowData = this.filter.optionsSource || {};

        const fields = {};
        if (this.filter.dependsOn.length > 0) {
            const paramsKeys = this.filter.dependsOn.split(';');

            for (let index = 0; index < paramsKeys.length; index++) {
                const paramKey = paramsKeys[index];
                fields[paramKey] = {
                    Type: this.filtersBlockService.pageParameters.get(paramKey)?.Type || 'String'
                }                
            }
        }
        
        resource['runFlowData'] = runFlowData;
        resource['fields'] = fields;

        this.dialogRef = this.addonBlockLoaderService.loadAddonBlockInDialog({
            container: this.viewContainerRef,
            name: 'FlowPicker',
            size: 'large',
            hostObject: resource,
            hostEventsCallback: (event) => {
                if (event.action === 'on-done') {
                    this.filter.optionsSource = event.data || {};
                    this.updateFilter();
                    
                    this.dialogRef.close();
                } else if (event.action === 'on-cancel') {
                    this.dialogRef.close();
                }
            }
        });
    }
}
