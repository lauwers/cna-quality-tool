import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { Component, DataAggregate, Endpoint, ExternalEndpoint, Link, Service, StorageBackingService, System } from "@/core/entities";
import { RelationToBackingData } from "@/core/entities/relationToBackingData";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { systemMeasureImplementations } from "@/core/qualitymodel/evaluation/measureImplementations";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { ASYNCHRONOUS_ENDPOINT_KIND, SYNCHRONOUS_ENDPOINT_KIND } from "@/core/qualitymodel/specifications/featureModel";
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
    let measureKeys = getQualityModel().systemMeasures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(systemMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    expect(measureKeys).toEqual(
        expect.arrayContaining(measureImplementationKeys)
      )
})

test("all implemented measure must provide information on the calculation", () => {
    let measures = getQualityModel().systemMeasures;
    let measureKeys = measures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(systemMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    for (const measure of measures) {
        if (measureImplementationKeys.includes(measure.getId)) {
            expect(measure.getCalculationDescription.length, `Implemented measure ${measure.getId} does not provide a calculation description`).toBeGreaterThan(0)
        }
    }
})

test("ratioOfEndpointsSupportingSsl", () => {
    let measureValue = systemMeasureImplementations["ratioOfEndpointsSupportingSsl"](systemToEvaluateA);

    expect(measureValue).toEqual(0.5);
})

test("ratioOfExternalEndpointsSupportingTls", () => {
    let measureValue = systemMeasureImplementations["ratioOfExternalEndpointsSupportingTls"](systemToEvaluateA);

    expect(measureValue).toEqual(0.5);
})

test("ratioOfSecuredLinks", () => {
    let measureValue = systemMeasureImplementations["ratioOfSecuredLinks"](systemToEvaluateA);

    expect(measureValue).toEqual(0.5);
})

test("dataAggregateScope", () => {
    let measureValue = systemMeasureImplementations["dataAggregateScope"](systemToEvaluateA);

    expect(measureValue).toEqual(2);
})

test("ratioOfStatefulComponents", () => {
    let measureValue = systemMeasureImplementations["ratioOfStatefulComponents"](systemToEvaluateA);

    expect(measureValue).toEqual(2/3);
})

test("ratioOfStatelessComponents", () => {
    let measureValue = systemMeasureImplementations["ratioOfStatelessComponents"](systemToEvaluateA);

    expect(measureValue).toEqual(1/3);
})


test("degreeToWhichComponentsAreLinkedToStatefulComponents", () => {
    let measureValue = systemMeasureImplementations["degreeToWhichComponentsAreLinkedToStatefulComponents"](systemToEvaluateA);

    expect(measureValue).toEqual(1/3);
})

test("degreeOfAsynchronousCommunication", () => {

    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(externalEndpointA);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointD);

    system.addEntities([serviceX, serviceY]);

    let measureValue = systemMeasureImplementations["degreeOfAsynchronousCommunication"](system);

    expect(measureValue).toEqual(2/3);
})

test("asynchronousCommunicationUtilization", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    externalEndpointA.setPropertyValue("kind", SYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceX.addEndpoint(externalEndpointA);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    endpointC.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    endpointD.setPropertyValue("kind", ASYNCHRONOUS_ENDPOINT_KIND[0]);
    serviceY.addEndpoint(endpointD);

    let linkYX1 = new Link("l1", serviceY, endpointA);
    let linkYX2 = new Link("l2", serviceY, endpointB);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l3", serviceZ, endpointC);
    let linkZX2 = new Link("l4", serviceZ, endpointD);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkYX1, linkYX2, linkZX1, linkZX2]);

    let measureValue = systemMeasureImplementations["asynchronousCommunicationUtilization"](system);

    expect(measureValue).toEqual(3/4);

})

test("ratioOfServicesThatProvideHealthEndpoints", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    endpointA.setPropertyValue("health_check", true);
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    endpointB.setPropertyValue("readiness_check", true);
    serviceX.addEndpoint(endpointB);
    let externalEndpointA = new ExternalEndpoint("ee1", "external endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(externalEndpointA);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    system.addEntities([serviceX, serviceY]);

    let measureValue = systemMeasureImplementations["ratioOfServicesThatProvideHealthEndpoints"](system);

    expect(measureValue).toEqual(0.5);
})


test("couplingDegreeBasedOnPotentialCoupling", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceY.addEndpoint(endpointB);

    let serviceZ  = new Service("s3", "serviceC", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceZ.addEndpoint(endpointC);

    let linkXY = new Link("l1", serviceX, endpointB);
    let linkYZ = new Link("l2", serviceY, endpointC);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkXY, linkYZ]);

    let measureValue = systemMeasureImplementations["couplingDegreeBasedOnPotentialCoupling"](system);

    expect(measureValue).toEqual(1/3);


})

test("interactionDensityBasedOnComponents", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkYX1 = new Link("l1", serviceY, endpointA);
    let linkYX2 = new Link("l2", serviceY, endpointB);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l3", serviceZ, endpointC);
    let linkZX2 = new Link("l4", serviceZ, endpointD);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkYX1, linkYX2, linkZX1, linkZX2]);

    let measureValue = systemMeasureImplementations["interactionDensityBasedOnComponents"](system);

    expect(measureValue).toEqual(4/3);

})


test("interactionDensityBasedOnLinks", () => {

    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkYX1 = new Link("l1", serviceY, endpointA);
    let linkYX2 = new Link("l2", serviceY, endpointB);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l3", serviceZ, endpointC);
    let linkZX2 = new Link("l4", serviceZ, endpointD);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkYX1, linkYX2, linkZX1, linkZX2]);

    let measureValue = systemMeasureImplementations["interactionDensityBasedOnLinks"](system);

    expect(measureValue).toEqual(1/3);

})

test("systemCouplingBasedOnEndpointEntropy", () => {

    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkYX1 = new Link("l1", serviceY, endpointA);
    let linkYX2 = new Link("l2", serviceY, endpointB);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l3", serviceZ, endpointC);
    let linkZX2 = new Link("l4", serviceZ, endpointD);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkYX1, linkYX2, linkZX1, linkZX2]);

    let measureValue = systemMeasureImplementations["systemCouplingBasedOnEndpointEntropy"](system);

    expect(measureValue).toBeCloseTo(0.602059, 5);
})

test("servicesInterdependenceInTheSystem", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkXY = new Link("l1", serviceX, endpointC);
    let linkYX = new Link("l2", serviceY, endpointA);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX = new Link("l3", serviceZ, endpointC);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkXY, linkYX, linkZX]);

    let measureValue = systemMeasureImplementations["servicesInterdependenceInTheSystem"](system);

    expect(measureValue).toEqual(1);

})

test("aggregateSystemMetricToMeasureServiceCoupling", () => {

    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkXY = new Link("l1", serviceX, endpointC);
    let linkYX = new Link("l2", serviceY, endpointA);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX = new Link("l3", serviceZ, endpointC);

    system.addEntities([serviceX, serviceY, serviceZ]);
    system.addEntities([linkXY, linkYX, linkZX]);

    let measureValue = systemMeasureImplementations["aggregateSystemMetricToMeasureServiceCoupling"](system);

    expect(measureValue).toEqual(0.5);
})

test("degreeOfCouplingInASystem", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkXY = new Link("l1", serviceX, endpointC);
    let linkYX = new Link("l2", serviceY, endpointA);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX = new Link("l3", serviceZ, endpointC);

    let serviceA = new Service("s4", "service A", getEmptyMetaData());

    system.addEntities([serviceX, serviceY, serviceZ, serviceA]);
    system.addEntities([linkXY, linkYX, linkZX]);

    let measureValue = systemMeasureImplementations["degreeOfCouplingInASystem"](system);

    expect(measureValue).toEqual(1/4);
})

test("simpleDegreeOfCouplingInASystem", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());

    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let linkXY = new Link("l1", serviceX, endpointC);
    let linkYX = new Link("l2", serviceY, endpointA);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX = new Link("l3", serviceZ, endpointC);

    let serviceA = new Service("s4", "service A", getEmptyMetaData());

    system.addEntities([serviceX, serviceY, serviceZ, serviceA]);
    system.addEntities([linkXY, linkYX, linkZX]);

    let measureValue = systemMeasureImplementations["simpleDegreeOfCouplingInASystem"](system);

    expect(measureValue).toEqual(3/4);

})

test("directServiceSharing", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l1", serviceZ, endpointA);
    let linkZX2 = new Link("l2", serviceZ, endpointB);

    let serviceA = new Service("s4", "service A", getEmptyMetaData());
    let linkAX = new Link("l3", serviceA, endpointB);

    system.addEntities([serviceX, serviceY, serviceZ, serviceA]);
    system.addEntities([linkZX1, linkZX2, linkAX]);

    let measureValue = systemMeasureImplementations["directServiceSharing"](system);
    expect(measureValue).toBeCloseTo(7/24, 6);
})

test("transitivelySharedServices", () => {
    let system = new System("testSystem");

    let serviceA  = new Service("s1", "serviceA", getEmptyMetaData());

    let serviceB  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceB.addEndpoint(endpointA);

    let serviceC  = new Service("s3", "serviceC", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceC.addEndpoint(endpointB);

    let serviceD = new Service("s4", "service D", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceD.addEndpoint(endpointC);

    let serviceE = new Service("s5", "service E", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceE.addEndpoint(endpointD);
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);


    let linkAB = new Link("l1", serviceA, endpointA);
    let linkAC = new Link("l2", serviceA, endpointB);
    let linkBD = new Link("l3", serviceB, endpointC);
    let LinkBE = new Link("l4", serviceB, endpointD);
    let linkCE = new Link("l5", serviceC, endpointE);

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkAC, linkBD, LinkBE, linkCE]);

    let measureValue = systemMeasureImplementations["transitivelySharedServices"](system);
    expect(measureValue).toEqual(0.5);

})

test("ratioOfSharedNonExternalComponentsToNonExternalComponents", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l1", serviceZ, endpointA);
    let linkZX2 = new Link("l2", serviceZ, endpointB);

    let serviceA = new Service("s4", "service A", getEmptyMetaData());
    let linkAX = new Link("l3", serviceA, endpointB);

    system.addEntities([serviceX, serviceY, serviceZ, serviceA]);
    system.addEntities([linkZX1, linkZX2, linkAX]);

    let measureValue = systemMeasureImplementations["ratioOfSharedNonExternalComponentsToNonExternalComponents"](system);
    expect(measureValue).toEqual(1/4);

})

test("ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies", () => {
    let system = new System("testSystem");

    let serviceX  = new Service("s1", "serviceA", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    serviceX.addEndpoint(endpointA);
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceX.addEndpoint(endpointB);

    let serviceY  = new Service("s2", "serviceB", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceY.addEndpoint(endpointC);
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceY.addEndpoint(endpointD);

    let serviceZ = new Service("s3", "service Z", getEmptyMetaData());
    let linkZX1 = new Link("l1", serviceZ, endpointA);
    let linkZX2 = new Link("l2", serviceZ, endpointB);

    let serviceA = new Service("s4", "service A", getEmptyMetaData());
    let linkAX = new Link("l3", serviceA, endpointB);

    system.addEntities([serviceX, serviceY, serviceZ, serviceA]);
    system.addEntities([linkZX1, linkZX2, linkAX]);

    let measureValue = systemMeasureImplementations["ratioOfSharedDependenciesOfNonExternalComponentsToPossibleDependencies"](system);
    expect(measureValue).toEqual(1/8);


})