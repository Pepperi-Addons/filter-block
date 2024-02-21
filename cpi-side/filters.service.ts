import { ICalculatedFilter, IFilter } from "shared";
import { RunFlowBody } from '@pepperi-addons/cpi-node';
import { IContext } from "@pepperi-addons/cpi-node/build/cpi-side/events";

class FiltersService {

    private async getOptionsFromFlow(filter: IFilter, state: any, context: IContext | undefined): Promise<Array<{ Key: string, Title: string }>> {
        const res: any = { Options: [] };

        if (filter.optionsSource?.FlowKey?.length > 0) {
            const dynamicParamsData: any = {};
            
            if (filter.optionsSource?.FlowParams) {
                const dynamicParams: any = [];

                // Get all dynamic parameters to set their value on the data property later.
                const keysArr = Object.keys(filter.optionsSource.FlowParams);
                for (let index = 0; index < keysArr.length; index++) {
                    const key = keysArr[index];
                    
                    if (filter.optionsSource.FlowParams[key].Source === 'Dynamic') {
                        dynamicParams.push(filter.optionsSource.FlowParams[key].Value);
                    }
                }
                
                // Set the dynamic parameters values on the dynamicParamsData property.
                for (let index = 0; index < dynamicParams.length; index++) {
                    const param = dynamicParams[index];
                    dynamicParamsData[param] = state[param] || '';
                }
            }
        
            const flowToRun: RunFlowBody = {
                RunFlow: filter.optionsSource,
                Data: dynamicParamsData,
                context: context
            };

            // Run the flow and return the options.
            const flowRes = await pepperi.flows.run(flowToRun);
            res.Options = flowRes?.Options || [];
        }

        return res.Options;
    }

    private async getCalculatedFilter(filter: IFilter, state: any, context: IContext | undefined): Promise<ICalculatedFilter> {
        const calculatedFilter: ICalculatedFilter = {...filter};
        
        // Set the calculated filter options.
        calculatedFilter.options = [];
        const optionsFromFlow: Array<{ Key: string, Title: string }> = await this.getOptionsFromFlow(filter, state, context);

        // For all option in optionsFromFlow, push it to the calculated filter options.
        for (let index = 0; index < optionsFromFlow.length; index++) {
            const option = optionsFromFlow[index];
            calculatedFilter.options.push({ key: option.Key, value: option.Title });
        }

        // Set other data on the calculated filter.
        const hasOptions = calculatedFilter.options?.length > 0;
        calculatedFilter.hidden = !hasOptions;
        calculatedFilter.value = '';

        // If filter has options.
        if (hasOptions) {
            // If filter.pageParameterKey exist in the state and this parameter (from state) has value and it exist in the options, use it.
            if (state.hasOwnProperty(filter.pageParameterKey) && calculatedFilter.options.some(option => option.key === state[filter.pageParameterKey])) {
                calculatedFilter.value = state[filter.pageParameterKey];
            } else if (filter.useFirstValue) {
                // If filter.useFirstValue is true, use the first option and set it to the state.
                calculatedFilter.value = calculatedFilter.options[0].key;
                state[filter.pageParameterKey] = calculatedFilter.value;
            }
        }

        return calculatedFilter;
    }

    // async PrepareFiltersData(eventData: any): Promise<ICalculatedFilter[]> {
    //     const filters: IFilter[] = eventData.filters || [];
    //     const parameters: any = eventData.parameters || {};
        
    //     const calculatedFilters: Array<ICalculatedFilter> = [];
        
    //     for (let index = 0; index < filters.length; index++) {
    //         const filter = filters[index];
    //         const calculatedFilter = await this.getCalculatedFilter(filter, parameters, eventData);

    //         // If filter has no 
    //         calculatedFilters.push(calculatedFilter);
    //     }

    //     return calculatedFilters;
    // }
    
    async setUserTranslations(filter: IFilter): Promise<void> {
        filter.title = await pepperi.translations.translate({ key: filter.title });
        filter.placeholder = await pepperi.translations.translate({ key: filter.placeholder });
        filter.placeholderWhenNoOptions = await pepperi.translations.translate({ key: filter.placeholderWhenNoOptions });
    }

    async PrepareFiltersData(filters: IFilter[], state: any, context: IContext | undefined): Promise<ICalculatedFilter[]> {
        const calculatedFilters: Array<ICalculatedFilter> = [];
        
        for (let index = 0; index < filters.length; index++) {
            const filter = filters[index];
            const calculatedFilter = await this.getCalculatedFilter(filter, state, context);

            // Set translations;
            this.setUserTranslations(filter);

            // If filter has no 
            calculatedFilters.push(calculatedFilter);
        }

        return calculatedFilters;
    }
}
export default FiltersService;