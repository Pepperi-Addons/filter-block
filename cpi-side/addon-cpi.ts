import '@pepperi-addons/cpi-node'
import { ICalculatedFilter, ICalculatedFiltersEventResult } from 'shared';
import FiltersService from './filters.service';

export async function load(configuration: any) {

    // pepperi.events.intercept("OnClientFiltersBlockLoad" as any, {}, async (data): Promise<ICalculatedFiltersEventResult> => {
    //     // debugger;
    //     let success = true;
    //     let calculatedFilters:Array<ICalculatedFilter> = [];
    //     let error: any;

    //     try {
    //         console.log(`OnClientFiltersBlockLoad -> before`);
            
    //         const service = new FiltersService();
    //         calculatedFilters = await service.PrepareFiltersData(data);

    //         console.log(`OnClientFiltersBlockLoad -> after`);
    //     } catch (err) {
    //         success = false;
    //         error = err;
    //         console.error(`OnClientFiltersBlockLoad -> error: ${err}`);
    //     }

    //     return {
    //         CalculatedFilters: calculatedFilters,
    //         Success: success,
    //         Error: error,
    //     };
    // });

    // pepperi.events.intercept("OnConsumeParameterChange" as any, {}, async (data): Promise<ICalculatedFiltersEventResult> => {
    //     // debugger;
    //     let success = true;
    //     let calculatedFilters:Array<ICalculatedFilter> = [];
    //     let error: any;

    //     try {
    //         console.log(`OnConsumeParameterChange -> before`);
            
    //         const service = new FiltersService();
    //         calculatedFilters = await service.PrepareFiltersData(data);

    //         console.log(`OnConsumeParameterChange -> after`);
    //     } catch (err) {
    //         success = false;
    //         error = err;
    //         console.error(`OnConsumeParameterChange -> error: ${err}`);
    //     }

    //     return {
    //         CalculatedFilters: calculatedFilters,
    //         Success: success,
    //         Error: error,
    //     };
    // });
}

export const router = Router()
// router.get('/test', (req, res) => {
//     res.json({
//         hello: 'World'
//     })
// })

router.post('/on_filter_block_load', async (req, res)=>{
    const state = req.body.State;
    const configuration = req.body.Configuration;
    // const configurationPerScreenSize = req.body.ConfigurationPerScreenSize;

    const service = new FiltersService();

    // Override the filters.
    configuration.filters = await service.PrepareFiltersData(configuration.filters || [], state, req.context);    

    res.json({
        State: state,
        Configuration: configuration,
        ConfigurationPerScreenSize: {
            // Tablet: {
            //     // the blocks configuration
            // },
            Mobile: {
                direction: 'vertical'
            }
        },
    });
});

router.post('/on_filter_block_state_change', async (req, res)=>{
    const state = req.body.State || {};
    const changes = req.body.Changes || {};
    const configuration = req.body.Configuration;
    
    const service = new FiltersService();

    const mergeState = {...state, ...changes};

    // Override the filters.
    configuration.filters = await service.PrepareFiltersData(configuration.filters || [], mergeState, req.context);    

    res.json({
        State: mergeState,
        Configuration: configuration,
    });
});