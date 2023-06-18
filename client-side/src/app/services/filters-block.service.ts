import { Injectable } from "@angular/core";
import { IPepOption } from "@pepperi-addons/ngx-lib";
import { PageConfigurationParameter } from "@pepperi-addons/papi-sdk";
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";

@Injectable(
//     {
//     providedIn: 'root',
// }
)
export class FiltersBlockService {
    
    // This subject is for load depends on options on the filter editor (Usage only in edit mode).
    private _dependsOnOptionsSubject: BehaviorSubject<Array<IPepOption>> = new BehaviorSubject<Array<IPepOption>>([]);
    get dependsOnOptionsSubject$(): Observable<Array<IPepOption>> {
        return this._dependsOnOptionsSubject.asObservable().pipe(distinctUntilChanged());
    }

    private _pageParameters: Map<string, PageConfigurationParameter> = new Map<string, PageConfigurationParameter>();
    set pageParameters(value: Map<string, PageConfigurationParameter>) {
        this._pageParameters = value;
        this.setDependsOnOptions(value);
    }
    get pageParameters(): Map<string, PageConfigurationParameter> {
        return this._pageParameters;
    }
    
    private setDependsOnOptions(pageParameters: Map<string, PageConfigurationParameter>) {
        const dependsOnOptions = new Array<IPepOption>();
        
        pageParameters.forEach((value, key) => {
            if (key !== '*') {
                dependsOnOptions.push({ key: key, value: key});
            }
        });
        
        this._dependsOnOptionsSubject.next(dependsOnOptions);
    }
    
}