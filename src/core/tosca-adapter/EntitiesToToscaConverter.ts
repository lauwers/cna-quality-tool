import { TOSCA_Node_Template, TOSCA_Relationship_Template, TOSCA_Requirement_Assignment, TOSCA_Service_Template, TOSCA_Topology_Template } from '@/totypa/tosca-types/template-types';
import * as Entities from '../entities'
import { TwoWayKeyIdMap } from "./TwoWayKeyIdMap";
import { UniqueKeyManager } from "./UniqueKeyManager";
import { flatMetaData } from '../common/entityDataTypes';
import { ENDPOINT_TOSCA_KEY } from '../entities/endpoint';
import { REQUEST_TRACE_TOSCA_KEY } from '../entities/requestTrace';
import { DEPLOYMENT_MAPPING_TOSCA_KEY } from '../entities/deploymentMapping';
import { LINK_TOSCA_KEY } from '../entities/link';
import { EntityProperty } from '../common/entityProperty';
import { TOSCA_Property_Assignment } from '@/totypa/tosca-types/core-types';
import { DATA_AGGREGATE_TOSCA_KEY } from '../entities/dataAggregate';
import { BACKING_DATA_TOSCA_KEY } from '../entities/backingData';
import { INFRASTRUCTURE_TOSCA_KEY } from '../entities/infrastructure';
import { SERVICE_TOSCA_KEY } from '../entities/service';
import { BACKING_SERVICE_TOSCA_KEY } from '../entities/backingService';
import { STORAGE_BACKING_SERVICE_TOSCA_KEY } from '../entities/storageBackingService';
import { COMPONENT_TOSCA_KEY } from '../entities/component';
import { EXTERNAL_ENDPOINT_TOSCA_KEY } from '../entities/externalEndpoint';
import { CnaQualityModelEntitiesEndpoint, CnaQualityModelEntitiesEndpointExternal } from '@/totypa/parsedProfiles/cna_modeling_tosca_profile_ts_types';

const TOSCA_DEFINITIONS_VERSION = "tosca_simple_yaml_1_3"
const MATCH_WHITESPACES = new RegExp(/\s/g);
const MATCH_UNWANTED_CHARACTERS = new RegExp(/[#>\-\.]/g);
const MATCH_MULTIPLE_UNDERSCORES = new RegExp(/_+/g);

class EntitiesToToscaConverter {

    #uniqueKeyManager = new UniqueKeyManager();

    #keyIdMap = new TwoWayKeyIdMap();

    #systemEntity: Entities.System;

    #serviceTemplate: TOSCA_Service_Template;

    constructor(systemEntity: Entities.System, version: string) {
        this.#systemEntity = systemEntity;
        this.#serviceTemplate = {
            tosca_definitions_version: TOSCA_DEFINITIONS_VERSION,
            metadata: {
                template_author: "CNA modeling tool",
                template_name: systemEntity.getSystemName,
                template_version: "0.1.0" // TODO customize
            },
            description: "Service template generated by the CNA modeling tool"
        }
    }

    convert(): TOSCA_Service_Template {

        let topologyTemplate: TOSCA_Topology_Template = {
            description: "Topology template generated by the CNA modeling tool",
            node_templates: {},
            relationship_templates: {}
        };

        for (const [id, dataAggregate] of this.#systemEntity.getDataAggregateEntities.entries()) {
            const nodeKey: string = this.#uniqueKeyManager.ensureUniqueness(this.#transformToYamlKey(dataAggregate.getName));
            let node = this.#createDataAggregateTemplate(dataAggregate);
            this.#keyIdMap.add(nodeKey, id);
            topologyTemplate.node_templates[nodeKey] = node;
        }

        for (const [id, backingData] of this.#systemEntity.getBackingDataEntities.entries()) {
            const nodeKey: string = this.#uniqueKeyManager.ensureUniqueness(this.#transformToYamlKey(backingData.getName));
            let node = this.#createBackingDataTemplate(backingData);
            this.#keyIdMap.add(nodeKey, id);
            topologyTemplate.node_templates[nodeKey] = node;
        }

        for (const [id, infrastructure] of this.#systemEntity.getInfrastructureEntities.entries()) {
            const nodeKey: string = this.#uniqueKeyManager.ensureUniqueness(this.#transformToYamlKey(infrastructure.getName));
            let node = this.#createInfrastructureTemplate(infrastructure);
            if (infrastructure.getBackingDataEntities.length > 0) {
                node.requirements = [];
                for (const usedBackingData of infrastructure.getBackingDataEntities) {
                    const usageRelationshipKey = this.#uniqueKeyManager.ensureUniqueness(`${nodeKey}_uses_${this.#keyIdMap.getKey(usedBackingData.backingData.getId)}`);
                    let backingDataRelationship: TOSCA_Relationship_Template = {
                        type: "cna.qualityModel.relationships.AttachesTo.Data",
                        metadata: flatMetaData(usedBackingData.relation.getMetaData),
                    };

                    if (usedBackingData.relation.getProperties().length > 0) {
                        backingDataRelationship.properties = this.#parsePropertiesForYaml(usedBackingData.relation.getProperties());
                    }

                    topologyTemplate.relationship_templates[usageRelationshipKey] = backingDataRelationship;

                    node.requirements.push({
                        "uses_backing_data": {
                            node: this.#keyIdMap.getKey(usedBackingData.backingData.getId),
                            relationship: usageRelationshipKey
                        }
                    });
                }
            }
            this.#keyIdMap.add(nodeKey, id);
            topologyTemplate.node_templates[nodeKey] = node;
        }


        for (const [id, component] of this.#systemEntity.getComponentEntities.entries()) {
            const nodeKey: string = this.#uniqueKeyManager.ensureUniqueness(this.#transformToYamlKey(component.getName));
            let node = this.#createComponentTemplate(component);

            if (component.getEndpointEntities.length > 0) {
                node.requirements = [];
                for (const endpoint of component.getEndpointEntities) {
                    const endpointNodeKey = this.#uniqueKeyManager.ensureUniqueness(this.#transformToYamlKey(endpoint.getName))
                    let endpointNode = this.#createEndpointTemplate(endpoint);

                    this.#keyIdMap.add(endpointNodeKey, endpoint.getId);
                    topologyTemplate.node_templates[endpointNodeKey] = endpointNode;
                    node.requirements.push({
                        "provides_endpoint": {
                            capability: "tosca.capabilities.Endpoint",
                            node: endpointNodeKey,
                            relationship: {
                                type: "cna.qualityModel.relationships.Provides.Endpoint",
                            }
                        } as TOSCA_Requirement_Assignment
                    });
                }
            }

            if (component.getExternalEndpointEntities.length > 0) {
                if (!node.requirements) {
                    node.requirements = [];
                }
                for (const externalEndpoint of component.getExternalEndpointEntities) {
                    const endpointNodeKey = this.#uniqueKeyManager.ensureUniqueness(this.#transformToYamlKey(externalEndpoint.getName))
                    let endpointNode = this.#createExternalEndpointTemplate(externalEndpoint);

                    this.#keyIdMap.add(endpointNodeKey, externalEndpoint.getId);
                    topologyTemplate.node_templates[endpointNodeKey] = endpointNode;
                    node.requirements.push({
                        "provides_external_endpoint": {
                            capability: "tosca.capabilities.Endpoint.Public",
                            node: endpointNodeKey,
                            relationship: {
                                type: "cna.qualityModel.relationships.Provides.Endpoint",
                            }
                        } as TOSCA_Requirement_Assignment
                    });
                }
            }

            if (component.getDataAggregateEntities.length > 0) {
                if (!node.requirements) {
                    node.requirements = [];
                }
                for (const usedDataAggregate of component.getDataAggregateEntities) {

                    const usageRelationshipKey = this.#uniqueKeyManager.ensureUniqueness(`${nodeKey}_uses_${this.#keyIdMap.getKey(usedDataAggregate.data.getId)}`);
                    let dataAggregateRelationship: TOSCA_Relationship_Template = {
                        type: "cna.qualityModel.relationships.AttachesTo.DataAggregate",
                        metadata: flatMetaData(usedDataAggregate.relation.getMetaData),
                    };

                    if (usedDataAggregate.relation.getProperties().length > 0) {
                        dataAggregateRelationship.properties = this.#parsePropertiesForYaml(usedDataAggregate.relation.getProperties());
                    }
            
                    topologyTemplate.relationship_templates[usageRelationshipKey] = dataAggregateRelationship;

                    node.requirements.push({
                        "uses_data": {
                            node: this.#keyIdMap.getKey(usedDataAggregate.data.getId),
                            relationship: usageRelationshipKey
                        }
                    });
                }
            }

            if (component.getBackingDataEntities.length > 0) {
                if (!node.requirements) {
                    node.requirements = [];
                }
                for (const usedBackingData of component.getBackingDataEntities) {

                    const usageRelationshipKey = this.#uniqueKeyManager.ensureUniqueness(`${nodeKey}_uses_${this.#keyIdMap.getKey(usedBackingData.backingData.getId)}`);
                    let backingDataRelationship: TOSCA_Relationship_Template = {
                        type: "cna.qualityModel.relationships.AttachesTo.BackingData",
                        metadata: flatMetaData(usedBackingData.relation.getMetaData),
                    };

                    if (usedBackingData.relation.getProperties().length > 0) {
                        backingDataRelationship.properties = this.#parsePropertiesForYaml(usedBackingData.relation.getProperties());
                    }

                    topologyTemplate.relationship_templates[usageRelationshipKey] = backingDataRelationship;

                    node.requirements.push({
                        "uses_backing_data": {
                            node: this.#keyIdMap.getKey(usedBackingData.backingData.getId),
                            relationship: usageRelationshipKey
                        }
                    });
                }
            }

            this.#keyIdMap.add(nodeKey, id);
            topologyTemplate.node_templates[nodeKey] = node;
        }

        for (const [id, deploymentMapping] of this.#systemEntity.getDeploymentMappingEntities.entries()) {
            const hostNodeKey = this.#keyIdMap.getKey(deploymentMapping.getUnderlyingInfrastructure.getId);
            const hostedNodeKey = this.#keyIdMap.getKey(deploymentMapping.getDeployedEntity.getId);
            const deploymentRelationshipKey = this.#uniqueKeyManager.ensureUniqueness(`${hostNodeKey}_hosts_${hostedNodeKey}`);

            let relationship: TOSCA_Relationship_Template = {
                type: DEPLOYMENT_MAPPING_TOSCA_KEY
            }

            let properties = this.#parsePropertiesForYaml(deploymentMapping.getProperties());
            if (this.#isNonEmpty(properties)) {
                relationship.properties = properties;
            }

            this.#keyIdMap.add(deploymentRelationshipKey, id);
            topologyTemplate.relationship_templates[deploymentRelationshipKey] = relationship;

            let hostedNodeTemplate = topologyTemplate.node_templates[hostedNodeKey];

            if (!hostedNodeTemplate.requirements) {
                hostedNodeTemplate.requirements = [];
            }

            hostedNodeTemplate.requirements.push({
                "host": {
                    node: hostNodeKey,
                    relationship: deploymentRelationshipKey
                }
            })


        }

        for (const [id, link] of this.#systemEntity.getLinkEntities.entries()) {
            const targetNodeKey = this.#keyIdMap.getKey(link.getTargetEndpoint.getId);
            const sourceNodeKey = this.#keyIdMap.getKey(link.getSourceEntity.getId);
            const linkRelationshipKey = this.#uniqueKeyManager.ensureUniqueness(`${sourceNodeKey}_linksTo_${targetNodeKey}`);

            let relationship: TOSCA_Relationship_Template = {
                type: LINK_TOSCA_KEY
            }

            let properties = this.#parsePropertiesForYaml(link.getProperties());
            if (this.#isNonEmpty(properties)) {
                relationship.properties = properties;
            }

            this.#keyIdMap.add(linkRelationshipKey, id);
            topologyTemplate.relationship_templates[linkRelationshipKey] = relationship;

            let sourceNodeTemplate = topologyTemplate.node_templates[sourceNodeKey];

            if (!sourceNodeTemplate.requirements) {
                sourceNodeTemplate.requirements = [];
            }

            sourceNodeTemplate.requirements.push({
                "endpoint_link": {
                    node: targetNodeKey,
                    relationship: linkRelationshipKey
                }
            })
        }

        for (const [id, requestTrace] of this.#systemEntity.getRequestTraceEntities.entries()) {
            const nodeKey = this.#uniqueKeyManager.ensureUniqueness(this.#transformToYamlKey(requestTrace.getName));
            let node = this.#createRequestTraceTemplate(requestTrace, this.#systemEntity, this.#keyIdMap);

            topologyTemplate.node_templates[nodeKey] = node;
        }

        this.#serviceTemplate.topology_template = topologyTemplate;
        return this.#serviceTemplate;

    }

    #transformToYamlKey(name: string) {

        // 1. no leading or trailing whitespaces 
        // 2. replace whitespaces with underscore
        // 3. replace # > - . with underscore
        // 4. ensure no subsequent underscores

        return name.trim()
            .replace(MATCH_WHITESPACES, "_")
            .replace(MATCH_UNWANTED_CHARACTERS, "_")
            .replace(MATCH_MULTIPLE_UNDERSCORES, "_")
            .toLocaleLowerCase();
    }



    #parsePropertiesForYaml(properties: EntityProperty[]): { [propertyKey: string]: TOSCA_Property_Assignment | string } {
        let yamlProperties: { [propertyKey: string]: TOSCA_Property_Assignment | string } = {};
        for (const property of properties) {
            yamlProperties[property.getKey] = property.value
        }
        return yamlProperties;
    }


    #createDataAggregateTemplate(dataAggregate: Entities.DataAggregate): TOSCA_Node_Template {
        return {
            type: DATA_AGGREGATE_TOSCA_KEY,
            metadata: flatMetaData(dataAggregate.getMetaData),
            capabilities: {
                "provides_data": {}
            }
        }
    }


    #createBackingDataTemplate(backingData: Entities.BackingData): TOSCA_Node_Template {

        let template: TOSCA_Node_Template = {
            type: BACKING_DATA_TOSCA_KEY,
            metadata: flatMetaData(backingData.getMetaData),
            capabilities: {
                "provides_data": {}
            }
        }

        if (backingData.getProperties().length > 0) {
            template.properties = this.#parsePropertiesForYaml(backingData.getProperties());
        }

        return template;
    }

    #createInfrastructureTemplate(infrastructure: Entities.Infrastructure): TOSCA_Node_Template {

        let template: TOSCA_Node_Template = {
            type: INFRASTRUCTURE_TOSCA_KEY,
            metadata: flatMetaData(infrastructure.getMetaData),
        }

        if (infrastructure.getProperties().length > 0) {
            template.properties = this.#parsePropertiesForYaml(infrastructure.getProperties());
        }

        return template;
    }

    #createComponentTemplate(component: Entities.Component): TOSCA_Node_Template {

        let typeKey = (() => {
            switch (component.constructor) {
                case Entities.Service:
                    return SERVICE_TOSCA_KEY;
                case Entities.BackingService:
                    return BACKING_SERVICE_TOSCA_KEY;
                case Entities.StorageBackingService:
                    return STORAGE_BACKING_SERVICE_TOSCA_KEY;
                case Entities.Component:
                default:
                    return COMPONENT_TOSCA_KEY;
            }
        })();

        let template: TOSCA_Node_Template = {
            type: typeKey,
            metadata: flatMetaData(component.getMetaData),
        }

        let properties = this.#parsePropertiesForYaml(component.getProperties());
        if (this.#isNonEmpty(properties)) {
            template.properties = properties;
        }

        return template;
    }


    #createEndpointTemplate(endpoint: Entities.Endpoint): CnaQualityModelEntitiesEndpoint {
        let template: CnaQualityModelEntitiesEndpoint = {
            type: ENDPOINT_TOSCA_KEY,
            metadata: flatMetaData(endpoint.getMetaData),
            capabilities: {}
        };

        template.capabilities.endpoint = {
            properties: this.#parsePropertiesForYaml(endpoint.getProperties())
        }
        return template;
    }

    #createExternalEndpointTemplate(endpoint: Entities.ExternalEndpoint): CnaQualityModelEntitiesEndpointExternal {
        let template: CnaQualityModelEntitiesEndpointExternal = {
            type: EXTERNAL_ENDPOINT_TOSCA_KEY,
            metadata: flatMetaData(endpoint.getMetaData),
            capabilities: {}
        };

        template.capabilities.external_endpoint = {
            properties: this.#parsePropertiesForYaml(endpoint.getProperties())
        }


        return template;
    }

    #createRequestTraceTemplate(requestTrace: Entities.RequestTrace, systemEntity: Entities.System, keyIdMap: TwoWayKeyIdMap): TOSCA_Node_Template {

        let template: TOSCA_Node_Template = {
            type: REQUEST_TRACE_TOSCA_KEY,
            metadata: flatMetaData(requestTrace.getMetaData),
            properties: this.#parsePropertiesForYaml(requestTrace.getProperties())
        }

        // overwrite with keys
        template.properties.referred_endpoint = keyIdMap.getKey(requestTrace.getExternalEndpoint.getId);

        let linkKeys = new Set<string>();
        let nodeKeys = new Set<string>();
        for (const link of requestTrace.getLinks) {
            //template.properties.links.push(keyIdMap.getKey(link.getId));
            linkKeys.add(keyIdMap.getKey(link.getId));
            nodeKeys.add(keyIdMap.getKey(link.getSourceEntity.getId));
            let targetComponent = systemEntity.searchComponentOfEndpoint(link.getTargetEndpoint.getId);
            if (targetComponent) {
                nodeKeys.add(keyIdMap.getKey(targetComponent.getId));
            }
        }
        template.properties.involved_links = [...linkKeys];
        template.properties.nodes = [...nodeKeys];

        return template;
    }

    #isNonEmpty(obj) {
        for (const prop in obj) {
            if (Object.hasOwn(obj, prop) && obj[prop]) {
                return true;
            }
        }
        return false;
    }
}

export { EntitiesToToscaConverter }