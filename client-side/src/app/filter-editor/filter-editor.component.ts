import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PepAddonBlockLoaderService } from '@pepperi-addons/ngx-lib/remote-loader';
import { IConfig, IFilter } from '../block.model';

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
    dependsOnOptions: Array<{key: string, value: string}> = [];

    constructor(
        private translate: TranslateService,
        private viewContainerRef: ViewContainerRef,
        private addonBlockLoaderService: PepAddonBlockLoaderService
    ) { 

    }

    private updateFilter() {
        this.filterChange.emit(this.filter);
    }

    ngOnInit(): void {
        
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
        const resource = this.filter.optionsSource || {};

        this.dialogRef = this.addonBlockLoaderService.loadAddonBlockInDialog({
            container: this.viewContainerRef,
            name: 'FlowPicker',
            size: 'large',
            hostObject: resource,
            hostEventsCallback: (event) => { 
                if (event.action === 'on-save') {
                    this.filter.optionsSource = event.data || {};
                    this.updateFilter();
                    
                    this.dialogRef.close();
                } else if (event.action === 'close') {
                    this.dialogRef.close();
                }
            }
        });
    }
}
