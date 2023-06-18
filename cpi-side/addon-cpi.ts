import '@pepperi-addons/cpi-node'
import FiltersService from './filters.service';

export async function load(configuration: any) {

    pepperi.events.intercept("OnClientFiltersBlockLoad" as any, {}, async (data): Promise<any> => {
        console.log(`OnClientFiltersBlockLoad -> before`);
        
        const service = new FiltersService();
        const res = await service.PrepareFiltersData(data);

        console.log(`OnClientFiltersBlockLoad -> after`);

        return res;
    });

    pepperi.events.intercept("OnConsumeParameterChange" as any, {}, async (data): Promise<any> => {
        console.log(`OnConsumeParameterChange -> before`);
        
        const service = new FiltersService();
        const res = await service.PrepareFiltersData(data);

        console.log(`OnConsumeParameterChange -> after`);

        return res;
    });
}

// export const router = Router()
// router.get('/test', (req, res) => {
//     res.json({
//         hello: 'World'
//     })
// })

// router.post("/run_flow", async (req, res) => {
//     let result = {};
    
//     try {
//         const flowToRun = {
//             RunFlow: req.body?.optionsSource,
//             Data: req.body?.dynamicParamsData,
//         };

//         if (req.context) {
//             flowToRun['context'] = req.context;
//             flowToRun['Context'] = req.context;
//         }

//         result = await pepperi.flows.run(flowToRun);
//         result['test'] = true;
//     } catch(exception) {
//         // Handle exception.
//         result['error'] = exception;
//     }

//     res.json(result);
// });
