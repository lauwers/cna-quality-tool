import { getEmptyMetaData } from "@/core/common/entityDataTypes";
import { DataAggregate, Endpoint, ExternalEndpoint, Link, RequestTrace, Service, StorageBackingService, System } from "@/core/entities";
import { RelationToDataAggregate } from "@/core/entities/relationToDataAggregate";
import { requestTraceMeasureImplementations } from "@/core/qualitymodel/evaluation/measure-implementations/measureImplementations";
import { getQualityModel } from "@/core/qualitymodel/QualityModelInstance";
import { expect, test } from "vitest";

test("all implementation names refer to an existing measure", () => {
    let measureKeys = getQualityModel().requestTraceMeasures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(requestTraceMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    expect(measureKeys).toEqual(
        expect.arrayContaining(measureImplementationKeys)
      )
})

test("all implemented measure must provide information on the calculation", () => {
    let measures = getQualityModel().requestTraceMeasures;
    let measureKeys = measures.map(measure => measure.getId);
    expect(measureKeys.length).toStrictEqual(new Set(measureKeys).size);

    let measureImplementationKeys = Object.keys(requestTraceMeasureImplementations);
    expect(measureImplementationKeys.length).toStrictEqual(new Set(measureImplementationKeys).size);

    for (const measure of measures) {
        if (measureImplementationKeys.includes(measure.getId)) {
            expect(measure.getCalculationDescription.length, `Implemented measure ${measure.getId} does not provide a calculation description`).toBeGreaterThan(0)
        }
    }
})

test("requestTraceLength", () => {
    let system = new System("testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    let externalEndpointE = new ExternalEndpoint("ex2", "external endpoint 2", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);
    serviceE.addEndpoint(externalEndpointE);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkCD = new Link("l3", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkCD]];
    requestTrace.setExternalEndpoint = externalEndpointA;



    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["requestTraceLength"]({ requestTrace: requestTrace, system: system});
    expect(measureValue).toEqual(3);


})

test("numberOfCyclesInRequestTraces", () => {

    let system = new System("testSystem");

    let serviceA = new Service("s1", "testService", getEmptyMetaData());
    let endpointA = new Endpoint("e1", "endpoint 1", getEmptyMetaData());
    let externalEndpointA = new ExternalEndpoint("ex1", "external endpoint 1", getEmptyMetaData());
    serviceA.addEndpoint(endpointA);
    serviceA.addEndpoint(externalEndpointA);

    let serviceB = new Service("s2", "testService", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint 2", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint 3", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let serviceD = new Service("s4", "testService", getEmptyMetaData());
    let endpointD = new Endpoint("e4", "endpoint 4", getEmptyMetaData());
    serviceD.addEndpoint(endpointD);

    let serviceE = new Service("s5", "testService", getEmptyMetaData());
    let endpointE = new Endpoint("e5", "endpoint 5", getEmptyMetaData());
    let externalEndpointE = new ExternalEndpoint("ex2", "external endpoint 2", getEmptyMetaData());
    serviceE.addEndpoint(endpointE);
    serviceE.addEndpoint(externalEndpointE);

    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBC = new Link("l2", serviceB, endpointC);
    let linkDB = new Link("l4", serviceD, endpointB);
    let linkCD = new Link("l5", serviceC, endpointD);

    let requestTrace = new RequestTrace("rq1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [[linkAB], [linkBC], [linkDB]];
    requestTrace.setExternalEndpoint = externalEndpointA;

    system.addEntities([serviceA, serviceB, serviceC, serviceD, serviceE]);
    system.addEntities([linkAB, linkBC, linkDB, linkCD]);
    system.addEntity(requestTrace);

    let measureValue = requestTraceMeasureImplementations["numberOfCyclesInRequestTraces"]({ requestTrace: requestTrace, system: system});
    expect(measureValue).toEqual(1);

})


test("dataReplicationAlongRequestTrace", () => {
    let system = new System("testSystem");

    let serviceA = new Service("s1", "testService A", getEmptyMetaData());
    let externalEndpoint = new ExternalEndpoint("ee1", "external endpoint", getEmptyMetaData());
    serviceA.addEndpoint(externalEndpoint);

    let serviceB = new Service("s2", "testService B", getEmptyMetaData());
    let endpointB = new Endpoint("e2", "endpoint B", getEmptyMetaData());
    serviceB.addEndpoint(endpointB);

    let serviceC = new Service("s3", "testService C", getEmptyMetaData());
    let endpointC = new Endpoint("e3", "endpoint C", getEmptyMetaData());
    serviceC.addEndpoint(endpointC);

    let dataAggregateA = new DataAggregate("da1", "data aggregate A", getEmptyMetaData());
    let dataAggregateB = new DataAggregate("da2", "data aggregate B", getEmptyMetaData());

    let storageServiceA = new StorageBackingService("sbs1", "storage service A", getEmptyMetaData());
    let endpointSA = new Endpoint("e4", "endpoint SA", getEmptyMetaData());
    storageServiceA.addEndpoint(endpointSA);

    let storageServiceB = new StorageBackingService("sbs2", "storage service B", getEmptyMetaData());
    let endpointSB = new Endpoint("e5", "endpoint SB", getEmptyMetaData());
    storageServiceB.addEndpoint(endpointSB);

   
    let usageAA = new RelationToDataAggregate("r1", getEmptyMetaData());
    usageAA.setPropertyValue("usage_relation", "usage");
    serviceA.addDataAggregateEntity(dataAggregateA, usageAA);

    let usageAB = new RelationToDataAggregate("r2", getEmptyMetaData());
    usageAB.setPropertyValue("usage_relation", "usage");
    serviceA.addDataAggregateEntity(dataAggregateB, usageAB);

    let usageEAA = new RelationToDataAggregate("r3", getEmptyMetaData());
    usageEAA.setPropertyValue("usage_relation", "usage");
    externalEndpoint.addDataAggregateEntity(dataAggregateA, usageEAA);

    let usageEAB = new RelationToDataAggregate("r4", getEmptyMetaData());
    usageEAB.setPropertyValue("usage_relation", "usage");
    externalEndpoint.addDataAggregateEntity(dataAggregateB, usageEAB);


    let usageBA = new RelationToDataAggregate("r5", getEmptyMetaData());
    usageBA.setPropertyValue("usage_relation", "cached-usage");
    serviceB.addDataAggregateEntity(dataAggregateA, usageBA);

    let usageBB = new RelationToDataAggregate("r6", getEmptyMetaData());
    usageBB.setPropertyValue("usage_relation", "cached-usage");
    serviceB.addDataAggregateEntity(dataAggregateB, usageBB);

    let usageEBA = new RelationToDataAggregate("r7", getEmptyMetaData());
    usageEBA.setPropertyValue("usage_relation", "cached-usage");
    endpointB.addDataAggregateEntity(dataAggregateA, usageEBA);

    let usageEBB = new RelationToDataAggregate("r8", getEmptyMetaData());
    usageEBB.setPropertyValue("usage_relation", "cached-usage");
    endpointB.addDataAggregateEntity(dataAggregateB, usageEBB);



    let usageCB = new RelationToDataAggregate("r9", getEmptyMetaData());
    usageCB.setPropertyValue("usage_relation", "cached-usage");
    serviceC.addDataAggregateEntity(dataAggregateB, usageCB);

    let usageECB = new RelationToDataAggregate("r10", getEmptyMetaData());
    usageECB.setPropertyValue("usage_relation", "cached-usage");
    endpointC.addDataAggregateEntity(dataAggregateB, usageECB);


    let usageSAA = new RelationToDataAggregate("r11", getEmptyMetaData());
    usageSAA.setPropertyValue("usage_relation", "persistence");
    storageServiceA.addDataAggregateEntity(dataAggregateA, usageSAA);

    let usageESAA = new RelationToDataAggregate("r12", getEmptyMetaData());
    usageESAA.setPropertyValue("usage_relation", "persistence");
    endpointSA.addDataAggregateEntity(dataAggregateA, usageESAA);


    let usageSBB = new RelationToDataAggregate("r13", getEmptyMetaData());
    usageSBB.setPropertyValue("usage_relation", "persistence");
    storageServiceB.addDataAggregateEntity(dataAggregateB, usageSBB);

    let usageESBB = new RelationToDataAggregate("r14", getEmptyMetaData());
    usageESBB.setPropertyValue("usage_relation", "persistence");
    endpointSB.addDataAggregateEntity(dataAggregateB, usageESBB);


    let linkAB = new Link("l1", serviceA, endpointB);
    let linkBSA = new Link("l2", serviceB, endpointSA);
    let linkBC = new Link("l3", serviceB, endpointC);
    let linkCSB = new Link("l4", serviceC, endpointSB);

    let requestTrace = new RequestTrace("r1", "request trace 1", getEmptyMetaData());
    requestTrace.setLinks = [
        [linkAB],
        [linkBSA, linkBC],
        [linkCSB]
    ]
    requestTrace.setExternalEndpoint = externalEndpoint;

    system.addEntities([dataAggregateA, dataAggregateB]);
    system.addEntities([serviceA, serviceB, serviceC]);
    system.addEntities([storageServiceA, storageServiceB]);
    system.addEntities([linkAB, linkBSA, linkBC, linkCSB]);
    system.addEntities([requestTrace]);


    let measureValue = requestTraceMeasureImplementations["dataReplicationAlongRequestTrace"]({ requestTrace: requestTrace, system: system});
    expect(measureValue).toBeCloseTo(17/24, 5);

})