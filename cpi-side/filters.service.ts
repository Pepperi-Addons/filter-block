import { ICalculatedFilter, IFilter } from "shared";
import { RunFlowBody } from '@pepperi-addons/cpi-node';

class FiltersService {

    private async getOptionsFromFlow(filter: IFilter, parameters: any, eventData: any): Promise<Array<{ Key: string, Title: string }>> {
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
                    dynamicParamsData[param] = parameters[param] || '';
                }
            }
        
            const flowToRun: RunFlowBody = {
                RunFlow: filter.optionsSource,
                Data: dynamicParamsData,
            };

            // TODO: Remove one of the context properties.
            if (eventData.client?.context) {
                flowToRun['context'] = eventData;
                flowToRun['Context'] = eventData;
            }

            // Run the flow and return the options.
            const flowRes = await pepperi.flows.run(flowToRun);
            res.Options = flowRes?.Options || [];
        }

        return res.Options;
    }

    private async getCalculatedFilter(filter: IFilter, parameters: any, eventData: any): Promise<ICalculatedFilter> {
        const calculatedFilter: ICalculatedFilter = {...filter};
        
        // Set the calculated filter options.
        calculatedFilter.options = [];
        const optionsFromFlow: Array<{ Key: string, Title: string }> = await this.getOptionsFromFlow(filter, parameters, eventData);

        // For all option in optionsFromFlow, push it to the calculated filter options.
        for (let index = 0; index < optionsFromFlow.length; index++) {
            const option = optionsFromFlow[index];
            calculatedFilter.options.push({ key: option.Key, value: option.Title });
        }

        // Set other data on the calculated filter.
        const hasOptions = calculatedFilter.options?.length > 0;
        calculatedFilter.disabled = !hasOptions;

        // If this parameter has value in the page parameters and exist in the options, use it.
        if (parameters.hasOwnProperty(filter.pageParameterKey) && hasOptions && calculatedFilter.options.some(option => option.key === parameters[filter.pageParameterKey])) {
            calculatedFilter.value = parameters[filter.pageParameterKey];
        } else if (calculatedFilter.options?.length > 0) {
            // If this parameter has options, use the first option if useFirstValue is true else set it to ''.
            calculatedFilter.value = filter.useFirstValue ? calculatedFilter.options[0].key : '';
        } else {
            calculatedFilter.value = '';
        }

        return calculatedFilter;
    }

    async PrepareFiltersData(eventData: any): Promise<ICalculatedFilter[]> {
        const filters: IFilter[] = eventData.filters || [];
        const parameters: any = eventData.parameters || {};
        
        const calculatedFilters: Array<ICalculatedFilter> = [];
        
        for (let index = 0; index < filters.length; index++) {
            const filter = filters[index];
            const calculatedFilter = await this.getCalculatedFilter(filter, parameters, eventData);
            calculatedFilters.push(calculatedFilter);
        }

        return calculatedFilters;
    }
}
export default FiltersService;