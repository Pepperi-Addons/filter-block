import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

import { PepAddonService, PepNgxLibModule } from '@pepperi-addons/ngx-lib';

import { BlockComponent } from './index';

import { config } from '../app.config';
import { PepSelectModule } from '@pepperi-addons/ngx-lib/select';
import { PepDialogModule } from '@pepperi-addons/ngx-lib/dialog';

export const routes: Routes = [
    {
        path: '',
        component: BlockComponent
    }
];

@NgModule({
    declarations: [BlockComponent],
    imports: [
        CommonModule,
        PepSelectModule,
        PepNgxLibModule,
        PepDialogModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: (addonService: PepAddonService) => 
                    PepAddonService.createMultiTranslateLoader(config.AddonUUID, addonService, ['ngx-lib', 'ngx-composite-lib']),
                deps: [PepAddonService]
            }, isolate: false
        }),
        RouterModule.forChild(routes)
    ],
    exports: [BlockComponent],
    providers: [
        TranslateStore,
        // Add here all used services.
    ]
})
export class BlockModule {
    constructor(
        translate: TranslateService,
        private pepAddonService: PepAddonService
    ) {
        this.pepAddonService.setDefaultTranslateLang(translate);
    }
}
