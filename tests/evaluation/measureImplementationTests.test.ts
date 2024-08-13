import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { Component, DataAggregate, Endpoint, ExternalEndpoint, Link, Service, StorageBackingService, System } from "@/core/entities";
import { RelationToBackingData } from "@/core/entities/relationToBackingData";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { measureImplementations } from "@/core/qualitymodel/evaluation/measureImplementations";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { beforeAll, expect, test } from "vitest"

var systemToEvaluateA: System = new System("testSystem");

beforeAll(() => {
    systemToEvaluateA = new System("testSystem");

    let serviceA  = new Service("s1", "serviceA", getEmptyMetaData());


    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("protocol", "https");
    serviceA.addEndpoint(externalEndpointA);
    let externalEndpointB = new ExternalEndpoint("ee2", "external endpoint 2", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpointB);

    let serviceB  = new Service("s2", "serviceB", getEmptyMetaData());
    serviceB.setPropertyValue("stateless", false);
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("protocol", "https");
    serviceB.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceB.addEndpoint(endpointD);


    console.log(`serviceB has: ${serviceB.getEndpointEntities.map(endpoint => endpoint.getId)}`)

    let linkAC = new Link("l1", serviceA, endpointC);
    let linkAD = new Link("l2", serviceA, endpointD);

    systemToEvaluateA.addEntities([serviceA, serviceB]);
    systemToEvaluateA.addEntities([linkAC, linkAD]);

    let dataAggregateA = new DataAggregate("da1", "Data A", getEmptyMetaData());
    
    systemToEvaluateA.addEntity(dataAggregateA);
    serviceA.addDataAggregateEntity(dataAggregateA, new RelationToDataAggregate("dar1", getEmptyMetaData()));

    let dataAggregateB = new DataAggregate("da2", "Data B", getEmptyMetaData());
    serviceB.addDataAggregateEntity(dataAggregateB, new RelationToDataAggregate("dar2", getEmptyMetaData()));
    systemToEvaluateA.addEntity(dataAggregateB);

    let storageBackingServiceA = new StorageBackingService("st1", "Storage 1", getEmptyMetaData());
    systemToEvaluateA.addEntity(storageBackingServiceA);
})


test("all implementation names refer to an existing measure", () => {
    let measureKeys = getQualityModel().measures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(measureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    expect(measureKeys).toEqual(
        expect.arrayContaining(measureImplementationKeys)
      )
})

test("all implemented measure must provide information on the calculation", () => {
    let measures = getQualityModel().measures;
    let measureKeys = measures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(measureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    for (const measure of measures) {
        if (measureImplementationKeys.includes(measure.getId)) {
            expect(measure.getCalculationDescription.length, `Implemented measure ${measure.getId} does not provide a calculation description`).toBeGreaterThan(0)
        }
    }
})

test("ratioOfEndpointsSupportingSsl", () => {
    let measureValue = measureImplementations["ratioOfEndpointsSupportingSsl"](systemToEvaluateA);

    expect(measureValue).toEqual(0.5);
})

test("ratioOfExternalEndpointsSupportingTls", () => {
    let measureValue = measureImplementations["ratioOfExternalEndpointsSupportingTls"](systemToEvaluateA);

    expect(measureValue).toEqual(0.5);
})

test("ratioOfSecuredLinks", () => {
    let measureValue = measureImplementations["ratioOfSecuredLinks"](systemToEvaluateA);

    expect(measureValue).toEqual(0.5);
})

test("dataAggregateScope", () => {
    let measureValue = measureImplementations["dataAggregateScope"](systemToEvaluateA);

    expect(measureValue).toEqual(2);
})

test("ratioOfStatefulComponents", () => {
    let measureValue = measureImplementations["ratioOfStatefulComponents"](systemToEvaluateA);

    expect(measureValue).toEqual(2/3);
})

test("ratioOfStatelessComponents", () => {
    let measureValue = measureImplementations["ratioOfStatelessComponents"](systemToEvaluateA);

    expect(measureValue).toEqual(1/3);
})


test("degreeToWhichComponentsAreLinkedToStatefulComponents", () => {
    let measureValue = measureImplementations["degreeToWhichComponentsAreLinkedToStatefulComponents"](systemToEvaluateA);

    expect(measureValue).toEqual(1/3);
})