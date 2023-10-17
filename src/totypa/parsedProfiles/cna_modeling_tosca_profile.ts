/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

import { TOSCA_Service_Template } from '../tosca-types/template-types';

export const cna_modeling_tosca_profile: TOSCA_Service_Template = {
  "tosca_definitions_version": "tosca_simple_yaml_1_3",
  "namespace": "http://docs.oasis-open.org/tosca/ns/simple/yaml/1.3",
  "metadata": {
    "template_name": "cna-modeling-tosca-profile",
    "template_author": "Distributed Systems Group",
    "template_version": "0.1.0"
  },
  "description": "This TOSCA definitions document contains the CNA Modeling TOSCA profile",
  "dsl_definitions": "",
  "repositories": {},
  "artifact_types": {},
  "data_types": {},
  "capability_types": {
    "cna.qualityModel.capabilities.DataStorage": {
      "derived_from": "tosca.capabilities.Root",
      "description": "When included, the Node is able to store Data Aggregate entities"
    }
  },
  "interface_types": {},
  "relationship_types": {
    "cna.qualityModel.entities.ConnectsTo.Link": {
      "derived_from": "tosca.relationships.ConnectsTo",
      "description": "Relationship Type to model Link entities",
      "properties": {
        "target_endpoint": {
          "type": "string",
          "required": true,
          "description": "The Endpoint to which the linked Component connects."
        }
      }
    },
    "cna.qualityModel.relationships.Provides.Endpoint": {
      "derived_from": "tosca.relationships.Root",
      "description": "Relationship Type to connect Endpoints to the Components which provide them",
      "valid_target_types": [
        "cna.qualityModel.entities.Endpoint",
        "cna.qualityModel.entities.Endpoint.External"
      ]
    }
  },
  "node_types": {
    "cna.qualityModel.entities.Root.Component": {
      "derived_from": "tosca.nodes.Root",
      "description": "Node Type to model Component entities",
      "properties": {
        "managed": {
          "type": "string",
          "description": "A component is managed if it is operated by a cloud provider.",
          "required": false
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "tosca.capabilities.Compute",
            "relationship": "tosca.relationships.HostedOn",
            "occurrences": [
              1,
              1
            ]
          }
        },
        {
          "provides_endpoint": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "tosca.capabilities.Endpoint.Public",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "cna.qualityModel.relationships.ConnectsTo.Link",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.DataAggregate",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.BackingData",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna.qualityModel.entities.SoftwareComponent.Service": {
      "derived_from": "tosca.nodes.SoftwareComponent",
      "description": "Node Type to model Service entities",
      "requirements": [
        {
          "provides_endpoint": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "tosca.capabilities.Endpoint.Public",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "cna.qualityModel.relationships.ConnectsTo.Link",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.DataAggregate",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.BackingData",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna.qualityModel.entities.BackingService": {
      "derived_from": "tosca.nodes.Root",
      "description": "Node Type to model Backing Service entities",
      "properties": {
        "providedFunctionality": {
          "type": "string",
          "description": "A short description of the provided functionality.",
          "required": false
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "tosca.capabilities.Compute",
            "relationship": "tosca.relationships.HostedOn",
            "occurrences": [
              1,
              1
            ]
          }
        },
        {
          "provides_endpoint": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "tosca.capabilities.Endpoint.Public",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "cna.qualityModel.relationships.ConnectsTo.Link",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.DataAggregate",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.BackingData",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna.qualityModel.entities.Endpoint": {
      "derived_from": "tosca.nodes.Root",
      "description": "Endpoint type to explicitly model endpoints as entities",
      "capabilities": {
        "endpoint": {
          "type": "tosca.capabilities.Endpoint",
          "occurrences": [
            1,
            1
          ]
        }
      }
    },
    "cna.qualityModel.entities.Endpoint.External": {
      "derived_from": "tosca.nodes.Root",
      "description": "Endpoint type to explicitly model endpoints as entities",
      "capabilities": {
        "external_endpoint": {
          "type": "tosca.capabilities.Endpoint.Public",
          "occurrences": [
            1,
            1
          ]
        }
      }
    },
    "cna.qualityModel.entities.Compute.Infrastructure": {
      "derived_from": "tosca.nodes.Compute",
      "description": "Node Type to model Infrastructure entities",
      "requirements": [
        {
          "host": {
            "capability": "tosca.capabilities.Compute",
            "relationship": "tosca.relationships.HostedOn",
            "occurrences": [
              0,
              1
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.BackingData",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna.qualityModel.entities.BackingData": {
      "derived_from": "tosca.nodes.Root",
      "description": "Node Type to model Backing Data entities",
      "properties": {
        "included_data": {
          "type": "map",
          "required": true,
          "key_schema": {
            "type": "string",
            "description": "The name specifying the individual Backing Data element"
          },
          "entry_schema": {
            "type": "string",
            "description": "The value of the individual Backing Data element"
          }
        }
      },
      "capabilities": {
        "provided_data": {
          "type": "tosca.capabilities.Attachment",
          "valid_source_types": [
            "cna.qualityModel.entities.Root.Component",
            "cna.qualityModel.entities.SoftwareComponent.Service",
            "cna.qualityModel.entities.BackingService",
            "cna.qualityModel.entities.DBMS.StorageService",
            "cna.qualityModel.entities.Compute.Infrastructure"
          ],
          "occurrences": [
            1,
            1
          ]
        }
      }
    },
    "cna.qualityModel.entities.DataAggregate": {
      "derived_from": "tosca.nodes.Root",
      "description": "Node Type to model Data Aggregate entities",
      "requirements": [
        {
          "persistence": {
            "capability": "cna.qualityModel.capabilities.DataStorage",
            "node": "cna.qualityModel.entities.DBMS.StorageService",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              1,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "capabilities": {
        "provided_data": {
          "type": "tosca.capabilities.Attachment",
          "valid_source_types": [
            "cna.qualityModel.entities.Root.Component",
            "cna.qualityModel.entities.SoftwareComponent.Service",
            "cna.qualityModel.entities.BackingService",
            "cna.qualityModel.entities.DBMS.StorageService"
          ],
          "occurrences": [
            1,
            1
          ]
        }
      }
    },
    "cna.qualityModel.entities.DBMS.StorageService": {
      "derived_from": "tosca.nodes.DBMS",
      "description": "Node Type to model Storage Backing Service entities",
      "properties": {
        "name": {
          "type": "string",
          "description": "the logical name of the database",
          "required": true
        }
      },
      "requirements": [
        {
          "endpoint_link": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "cna.qualityModel.relationships.ConnectsTo.Link",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.DataAggregate",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.BackingData",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "capabilities": {
        "endpoint": {
          "type": "tosca.capabilities.Endpoint",
          "occurrences": [
            0,
            "UNBOUNDED"
          ]
        },
        "external_endpoint": {
          "type": "tosca.capabilities.Endpoint.Public",
          "occurrences": [
            0,
            "UNBOUNDED"
          ]
        },
        "persist_data": {
          "type": "cna.qualityModel.capabilities.DataStorage",
          "description": "The ability to persist Data Aggregates like Business Objects",
          "valid_source_types": [
            "cna.qualityModel.entities.DataAggregate"
          ],
          "occurrences": [
            1,
            "UNBOUNDED"
          ]
        }
      }
    },
    "cna.qualityModel.entities.RequestTrace": {
      "derived_from": "tosca.nodes.Root",
      "description": "Node Type to model Request Trace entities",
      "properties": {
        "endpoint": {
          "type": "string",
          "required": true
        },
        "nodes": {
          "type": "list",
          "required": false,
          "entry_schema": {
            "description": "An existing Component, Service, Backing Service or Storage Backing Service entity which is part of this Request Trace entity",
            "type": "string"
          }
        },
        "links": {
          "type": "list",
          "required": true,
          "entry_schema": {
            "description": "An existing Link entity which is part of this Request Trace entity",
            "type": "string"
          }
        }
      },
      "requirements": [
        {
          "external_endpoint": {
            "capability": "tosca.capabilities.Endpoint.Public",
            "relationship": "tosca.relationships.ConnectsTo",
            "occurrences": [
              1,
              1
            ]
          }
        }
      ]
    }
  },
  "policy_types": {}
};