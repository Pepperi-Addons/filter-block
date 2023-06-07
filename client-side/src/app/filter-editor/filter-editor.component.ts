import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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

    constructor(
        private translate: TranslateService,
    ) { 

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

    private updateFilter() {
        this.filterChange.emit(this.filter);
    }

}
