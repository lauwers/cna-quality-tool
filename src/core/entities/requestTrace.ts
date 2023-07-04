
import { ExternalEndpoint } from "./externalEndpoint";
import { Link } from "./link";
import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/cna_modeling_tosca_profile'
import { MetaData } from "../common/entityDataTypes";


/**
 * The module for aspects related to a Component quality model Entity.
 * @module entities/requestTrace
 */

const REQUEST_TRACE_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types["cna.qualityModel.entities.RequestTrace"];

/**
 * Class representing a Request Trace entity.
 * @class
 */
class RequestTrace {

    #id: string;

    #name: string;

    #metaData: MetaData;

    #externalEndpoint: ExternalEndpoint;

    #links = new Set<Link>();

    /**
     * Create a Request Trace entity.
     * @param {string} id The unique id for this entity.
     * @param {string} name The name of the Request Trace entity.
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     * @param {ExternalEndpoint} externalEndpoint The {@link ExternalEndpoint} entity for which the Request Trace is being defined.
     * @param {string} linkEntityOrEntities The Id {@link Link} entity or entities that take part in this Request Trace (1...N)
     * @throws {TypeError} If a wrong entity type is being provided
     */
    constructor(id: string, name: string, metaData: MetaData, externalEndpoint: ExternalEndpoint, links: Link[]) {
        for (const linkEntity of links) {
            if (this.#links.has(linkEntity)) {
                return;
            }

            this.#links.add(linkEntity);
        }
        this.#id = id;
        this.#name = name;
        this.#metaData = metaData;
        this.#externalEndpoint = externalEndpoint;
    }

    /**
     * Returns the ID of this RequestTrace entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
    }

    /**
     * Returns the name of this Request Trace entity.
     * @returns {string}
     */
    get getName() {
        return this.#name;
    }


    /**
     * Return the meta data for this node entity.
     * @returns {MetaData}
     */
    get getMetaData() {
        return this.#metaData;
    }

    /**
     * Returns the {@link ExternalEndpoint} of this RequestTrace entity.
     * @returns {ExternalEndpoint}
     */
    get getExternalEndpoint() {
        return this.#externalEndpoint;
    }

    /**
      * Changes the {@link ExternalEndpoint}.
      * @param {ExternalEndpoint} newExternalEndpoint The {@link ExternalEndpoint} for of this RequestTrace entity.
      * @throws {TypeError} If a wrong entity type is being provided
      */
    set setExternalEndpoint(newExternalEndpoint) {
        if (!(newExternalEndpoint instanceof ExternalEndpoint)) {
            const errorMessage = "Wrong entity type provided. Only an ExternalEndpoint entity is allowed. However, the provided entity was: " + Object.getPrototypeOf(newExternalEndpoint) + JSON.stringify(newExternalEndpoint);
            throw new TypeError(errorMessage);
        }

        this.#externalEndpoint = newExternalEndpoint;
    }

    /**
     * Returns the IDs of the {@link Link} entities involved in this RequestTrace entity.
     * @returns {Link[]}
     */
    get getLinks() {
        return this.#links;
    }

    /**
     * Transforms the RequestTrace object into a String. 
     * @returns {string}
     */
    toString() {
        return "RequestTrace " + JSON.stringify(this);
    }
}

export { RequestTrace, REQUEST_TRACE_TOSCA_EQUIVALENT };