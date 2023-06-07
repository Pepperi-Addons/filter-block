import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PepButtonModule } from '@pepperi-addons/ngx-lib/button';
import { PepTextboxModule } from '@pepperi-addons/ngx-lib/textbox';
import { PepCheckboxModule } from '@pepperi-addons/ngx-lib/checkbox';
import { PepSliderModule } from '@pepperi-addons/ngx-lib/slider';
import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';
import { MatTabsModule } from '@angular/material/tabs';
import { PepAddonService, PepNgxLibModule } from '@pepperi-addons/ngx-lib';
import { TranslateModule, TranslateLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { PepGroupButtonsModule } from '@pepperi-addons/ngx-lib/group-buttons';
import { PepGroupButtonsSettingsModule } from '@pepperi-addons/ngx-composite-lib/group-buttons-settings';
import { PepColorModule } from '@pepperi-addons/ngx-lib/color';
import { PepImageModule } from '@pepperi-addons/ngx-lib/image';
import { PepTextareaModule, } from '@pepperi-addons/ngx-lib/textarea';
import { PepPageLayoutModule } from '@pepperi-addons/ngx-lib/page-layout';
import { MatDialogModule } from '@angular/material/dialog';
import { pepIconTextAlignCenter, pepIconTextAlignLeft, pepIconTextAlignRight, pepIconArrowBackRight, pepIconArrowBackLeft, pepIconArrowBack, pepIconArrowLeftAlt,pepIconArrowDown, pepIconArrowUp, PepIconModule, pepIconNumberPlus, PepIconRegistry, pepIconSystemBin, pepIconSystemBolt, pepIconSystemClose, pepIconSystemEdit, pepIconSystemMove } from '@pepperi-addons/ngx-lib/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PepShadowSettingsModule } from '@pepperi-addons/ngx-composite-lib/shadow-settings';
import { PepColorSettingsModule } from '@pepperi-addons/ngx-composite-lib/color-settings';
import { PepNgxCompositeLibModule } from '@pepperi-addons/ngx-composite-lib';
import { config } from '../app.config';

import { FilterEditorModule } from '../filter-editor';

import { BlockEditorComponent } from './block-editor.component';

const pepIcons = [
    pepIconTextAlignCenter, 
    pepIconTextAlignLeft, 
    pepIconTextAlignRight, 
    pepIconArrowBackRight, 
    pepIconArrowBackLeft,
    pepIconArrowBack,
    pepIconSystemClose,
    pepIconNumberPlus,
    pepIconSystemBolt,
    pepIconSystemEdit,
    pepIconSystemMove,
    pepIconSystemBin,
    pepIconArrowLeftAlt,
    pepIconArrowDown,
    pepIconArrowUp
];

@NgModule({
    declarations: [BlockEditorComponent],
    imports: [
        CommonModule,
        PepNgxLibModule,
        PepButtonModule,
        PepTextboxModule,
        PepSelectModule,
        PepSliderModule,
        PepCheckboxModule,
        MatDialogModule,
        PepPageLayoutModule,
        PepGroupButtonsModule,
        PepGroupButtonsSettingsModule,
        MatTabsModule,
        PepColorModule,
        PepImageModule,
        PepTextareaModule,
        DragDropModule,
        PepColorSettingsModule,
        PepNgxCompositeLibModule,
        PepShadowSettingsModule,
        FilterEditorModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (addonService: PepAddonService) => 
                    PepAddonService.createMultiTranslateLoader(config.AddonUUID, addonService, ['ngx-lib', 'ngx-composite-lib']),
                deps: [PepAddonService]
            }, isolate: false
        }),
    ],
    exports: [BlockEditorComponent],
    providers: [
        TranslateStore,
    ]
})
export class BlockEditorModule {
    constructor(
        translate: TranslateService,
        private pepIconRegistry: PepIconRegistry,
        private addonService: PepAddonService,
    ) {
        this.addonService.setDefaultTranslateLang(translate);
        this.pepIconRegistry.registerIcons(pepIcons);
    }
}
