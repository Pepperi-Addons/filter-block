import { Injectable } from "@angular/core";
import { IPepOption } from "@pepperi-addons/ngx-lib";
import { Page, PageConfiguration, PageConfigurationParameter, SchemeFieldType } from "@pepperi-addons/papi-sdk";
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class FiltersBlockService {
    // This subjects is for currentProducersMap (Usage only in edit mode).
    private _currentProducersMap = new Map<string, PageConfigurationParameter>();
    get currentProducersMap(): ReadonlyMap<string, PageConfigurationParameter> {
        return this._currentProducersMap;
    }

    // This subject is for load page parameter options on the filter editor (Usage only in edit mode).
    private _pageParameterOptionsSubject: BehaviorSubject<Array<IPepOption>> = new BehaviorSubject<Array<IPepOption>>([]);
    get pageParameterOptionsSubject$(): Observable<Array<IPepOption>> {
        return this._pageParameterOptionsSubject.asObservable().pipe(distinctUntilChanged());
    }

    // This subjects is for dependsOnMap (Usage only in edit mode).
    private _dependsOnMap = new Map<string, SchemeFieldType>();
    get dependsOnMapMap(): ReadonlyMap<string, SchemeFieldType> {
        return this._dependsOnMap;
    }
    // This subject is for load depends on options on the filter editor (Usage only in edit mode).
    private _dependsOnOptionsSubject: BehaviorSubject<Array<IPepOption>> = new BehaviorSubject<Array<IPepOption>>([]);
    get dependsOnOptionsSubject$(): Observable<Array<IPepOption>> {
        return this._dependsOnOptionsSubject.asObservable().pipe(distinctUntilChanged());
    }

    private setCurrentProucersMap(currentPageConfiguration: PageConfiguration): void {
        // Get all the produce parameters keys from currentPageConfiguration (this filter block).
        this._currentProducersMap = new Map(currentPageConfiguration.Parameters.map(param => {
            if (param.Produce) {
                return [param.Key, param];
            }
        }));
    }

    private setPageParameterOptions(page: Page): void {
        const pageParameterOptions: IPepOption[] = [];
        
        for (let index = 0; index < page?.Parameters?.length; index++) {
            const param = page.Parameters[index];
            pageParameterOptions.push({ key: param.Key, value: param.Key});
        }
        
        this._pageParameterOptionsSubject.next(pageParameterOptions);
    }

    private setDependsOnOptions(): void {
        const dependsOnOptions: IPepOption[] = [];

        this.dependsOnMapMap.forEach((value, key) => {
            if (!this._currentProducersMap.has(key)) {
                dependsOnOptions.push({ key: key, value: key});
            }
        });
        
        this._dependsOnOptionsSubject.next(dependsOnOptions);
    }

    private setDependsOn(page: Page, currentPageConfiguration: PageConfiguration): void {
        const dependsOnMap = new Map<string, SchemeFieldType>();

        // Go over all the blocks in the page.
        for (let index = 0; index < page?.Blocks?.length; index++) {
            const block = page.Blocks[index];
            
            // Go over all the parameters in the block.
            for (let paramIndex = 0; paramIndex < block.PageConfiguration?.Parameters?.length; paramIndex++) {
                const param = block.PageConfiguration.Parameters[paramIndex];
                
                // Set only the parameters that are not in the current producers and not with Key = '*'.
                if (!this.currentProducersMap.has(param.Key) && param.Key !== '*') {
                    dependsOnMap.set(param.Key, param.Type as SchemeFieldType);
                }
            }
        }

        // Go over all the parameters in the page.
        for (let index = 0; index < page?.Parameters?.length; index++) {
            const param = page.Parameters[index];
            dependsOnMap.set(param.Key, param.Type);
        }

        this._dependsOnMap = dependsOnMap;
        this.setDependsOnOptions();
    }

    /***********************************************************************************************/
    /*                                  Public functions
    /***********************************************************************************************/

    recalculateEditorData(page: Page, currentPageConfiguration: PageConfiguration): void {
        this.setCurrentProucersMap(currentPageConfiguration);
        this.setPageParameterOptions(page);
        this.setDependsOn(page, currentPageConfiguration);
    }
}