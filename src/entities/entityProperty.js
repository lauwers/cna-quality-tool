/**
 * The module for a property of an entity to provide all information needed for the Editor and TOSCA converter
 * @module entities/entityProperty
 */

/**
 * Class representing a Entity property
 * @class
 */
class EntityProperty {

    #key; //string

    #name; //string

    #description; //string

    #example; //string

    #required; //boolean

    #datatype; //constant text, number, boolean, list

    #maxLength; // only needed for datatype number

    #options; // only needed for datatype list: objects {value: string, text: string}

    value;

    /**
     * Create an Entity property
     * @param {key} key The key of the property to be used to uniquely identify it
     * @param {name} name The readable name of the property
     * @param {description} description a description to be used as a help text
     * @param {example} example example value which can be used as a placeholder
     * @param {required} required boolean to indicate whether the property is needed
     * @param {datatype} datatype the type of the property, can be "text" | "number" | "boolean" | "list"
     * @param {maxLength} maxLength only for the "number" type, maximum number of digits
     * @param {options} options only for the "list" type, an array of options to choose from
     * @param {value} value the actual value of this property
     */
    constructor(key, name, description, example, required, datatype, maxLength, options, value) {
        this.#key = key;
        this.#name = name;
        this.#description = description;
        this.#example = example;
        this.#required = required;
        this.#datatype = datatype;
        this.#maxLength = maxLength;
        this.#options = options;
        this.value = value;
    }

    get getKey() {
        return this.#key;
    }

    get getName() {
        return this.#name;
    }

    get getDescription() {
        return this.#description;
    }

    get getExample() {
        return this.#example;
    }

    get getRequired() {
        return this.#required;
    }

    get getDataType() {
        return this.#datatype;
    }

    get getMaxLength() {
        return this.#maxLength;
    }

    get getOptions() {
        return this.#options;
    }

}

export { EntityProperty };