import { PapiClient, InstalledAddon, Relation } from '@pepperi-addons/papi-sdk'
import { Client } from '@pepperi-addons/debug-server';

export class RelationsService {

    papiClient: PapiClient
    bundleFileName = '';

    constructor(private client: Client) {
        this.papiClient = new PapiClient({
            baseURL: client.BaseURL,
            token: client.OAuthAccessToken,
            addonUUID: client.AddonUUID,
            addonSecretKey: client.AddonSecretKey,
            actionUUID: client.ActionUUID
        });
        
        this.bundleFileName = `file_${this.client.AddonUUID}`;
    }
    
    // For page block template
    private async upsertRelation(relation): Promise<any> {
        return await this.papiClient.post('/addons/data/relations', relation);
    }

    private async upsertBlockRelation(): Promise<any> {
        const blockRelationName = 'Filter';
        const blockName = 'Block';

        const blockRelation: Relation = {
            RelationName: 'PageBlock',
            Name: blockRelationName,
            Description: `Filter block`,
            Type: "NgComponent",
            SubType: "NG14",
            AddonUUID: this.client.AddonUUID,
            AddonRelativeURL: this.bundleFileName,
            ComponentName: `${blockName}Component`, // This is should be the block component name (from the client-side)
            ModuleName: `${blockName}Module`, // This is should be the block module name (from the client-side)
            ElementsModule: 'WebComponents',
            ElementName: `${blockName.toLocaleLowerCase()}-element-${this.client.AddonUUID}`,
            EditorComponentName: `${blockName}EditorComponent`, // This is should be the block editor component name (from the client-side)
            EditorModuleName: `${blockName}EditorModule`, // This is should be the block editor module name (from the client-side)}
            EditorElementName: `${blockName.toLocaleLowerCase()}-editor-element-${this.client.AddonUUID}`,
            Schema: {
                "Fields": {
                    "filters": {
                        "Type": "Array",
                        "Items": {
                            "Type": "Object",
                            "Fields": {
                                "title": {
                                    "Type": "String",
                                    "ConfigurationPerScreenSize": false,
                                },
                                "pageParameterKey": {
                                    "Type": "String",
                                    "ConfigurationPerScreenSize": false,
                                },
                                "dependsOn": {
                                    "Type": "String",
                                    "ConfigurationPerScreenSize": false,
                                },
                                "optionsSource": {
                                    "Type": "Object"
                                },
                                "useFirstValue": {
                                    "Type": "Boolean",
                                    "ConfigurationPerScreenSize": false,
                                },
                                "placeholder": {
                                    "Type": "String",
                                    "ConfigurationPerScreenSize": false,
                                },
                                "placeholderWhenNoOptions": {
                                    "Type": "String",
                                    "ConfigurationPerScreenSize": false,
                                },
                            }
                        }
                    },
                    "direction": {
                        "Type": "String",
                        "ConfigurationPerScreenSize": false,
                    },
                    "spacing": {
                        "Type": "String",
                        "ConfigurationPerScreenSize": false,
                    },
                    "limitWidth": {
                        "Type": "Boolean",
                        "ConfigurationPerScreenSize": false,
                    },
                    "maxWidth": {
                        "Type": "String",
                        "ConfigurationPerScreenSize": false,
                    },
                }
            }
        };
        
        return await this.upsertRelation(blockRelation);
    }

    async upsertRelations() {
        await this.upsertBlockRelation();
    }
}