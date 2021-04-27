const md5 = require('md5');

export default class AdresUtils {
    public static checkIfVersionCanBePublished(
        straatnaamId: string,
        postalCode: string,
        houseNumber: string,
        officiallyAssigned: boolean,
        geometry: string,
        geometryMethod: string,
        geometrySpecification: string,
        addressStatus: string
    ) {
        let versionCanBePublished = true;

        if (straatnaamId === null ||
            postalCode === null ||
            houseNumber === null ||
            officiallyAssigned === false ||
            geometry === null ||
            geometryMethod === null ||
            geometrySpecification === null ||
            addressStatus === null) {
            versionCanBePublished = false;
        }

        return versionCanBePublished;
    }

    public static createObjectHash(addressObject: any){
        return md5(addressObject);
    }

    public static mapAddressStatus(status: string){
        switch(status){

            case "InGebruik":
                return "https://data.vlaanderen.be/id/concept/adresstatus/inGebruik";
            
            case "Gehistoreerd":
                return "https://data.vlaanderen.be/id/concept/adresstatus/gehistoreerd";
                
            case "Voorgesteld":
                return "https://data.vlaanderen.be/id/concept/adresstatus/voorgesteld";
                
            default:
                throw new Error(`[AdresUtils]: address should have a status.`);    
        }
    }

    public static mapGeometryPositionMethod(method: string){
        switch(method){

            case "Geïnterpoleerd":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriemethode/geinterpoleerd";

            case "AangeduidDoorBeheerder":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriemethode/aangeduidDoorBeheerder";
                
            case "AfgeleidVanObject":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriemethode/afgeleidVanObject";
                
            default:
                throw new Error(`[AdresUtils]: address should have a geometry position method.`);    
        }
    }

    public static mapGeometrySpecification(specification: string){
        switch(specification){

            case "Ligplaats":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/ligplaats";

            case "Gebouweenheid":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/gebouweenheid";
                
            case "Ingang":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/ingang";
                
            case "Lot":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/lot";
                
            case "Gemeente":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/gemeente";
                
            case "Perceel":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/perceel";
                
            case "Wegsegment":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/wegsegment";
                
            case "Standplaats":
                return "https://data.vlaanderen.be/id/conceptscheme/geometriespecificatie/standplaats";
                
            default:
                throw new Error(`[AdresUtils]: address should have a geometry specification.`);    
        }
    }

    public static getAddressShaclContext() {
        return {
            "@context": {
                sh: "https://www.w3.org/ns/shacl#",
                xsd: "http://www.w3.org/2001/XMLSchema#",
                skos: "http://www.w3.org/2004/02/skos/core#",
                prov: "http://www.w3.org/ns/prov#",
                dct: "http://purl.org/dc/terms/",
                adms: "http://www.w3.org/ns/adms#",
                adres: "https://data.vlaanderen.be/ns/adres#",
                generiek: "https://data.vlaanderen.be/ns/generiek#",
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                rdfs: "http://www.w3.org/2000/01/rdf-schema#",
                tree: "https://w3id.org/tree#",
                shapeOf: {
                    "@reverse": "tree:shape",
                    "@type": "@id",
                },
                NodeShape: "sh:NodeShape",
                "sh:nodeKind": {
                    "@type": "@id",
                },
                "sh:path": {
                    "@type": "@id",
                },
                "sh:datatype": {
                    "@type": "@id",
                },
            },
        };
    }
    

    public static getAddressContext() {
        return {
            '@context': [
                'https://data.vlaanderen.be/context/adresregister.jsonld',
                'https://data.vlaanderen.be/doc/applicatieprofiel/generiek-basis/zonderstatus/2019-07-01/context/generiek-basis.jsonld',
                {
                    xsd: "http://www.w3.org/2001/XMLSchema#",
                    prov: "http://www.w3.org/ns/prov#",
                    tree: "https://w3id.org/tree#",
                    dct: "http://purl.org/dc/terms/",
                    skos: "http://www.w3.org/2004/02/skos/core#",
                    adms: "http://www.w3.org/ns/adms#",
                    items: "@included",
                    shacl: "@included",
                    eventName: 'http://www.w3.org/ns/adms#versionNotes',
                    generatedAtTime: {
                        '@id': 'prov:generatedAtTime',
                        '@type': 'xsd:dateTime'
                    },
                    'isVersionOf': {
                        '@id': 'dct:isVersionOf',
                        '@type': '@id'
                    },
                    viewOf: {
                        '@reverse': 'tree:view',
                        '@type': '@id'
                    },
                    memberOf: {
                        '@reverse': 'tree:member',
                        '@type': '@id'
                    },
                    'tree:node': {
                        '@type': '@id'
                    },
                    'tree:path': {
                        '@type': '@id'
                    },
                    heeftStraatnaam : {
                        '@id' : 'https://data.vlaanderen.be/ns/adres#heeftStraatnaam',
                        '@type' : '@id'
                    },
                    huisnummer : {
                        "@id" : 'https://data.vlaanderen.be/ns/adres#huisnummer',
                        '@type' : 'xsd:string'
                    },
                    postcode : {
                        "@id" : "Postinfo.postcode",
                        "@type" : "xsd:string"
                    },
                    status : {
                        '@id' : 'Adres.status',
                        '@type' : 'skos:Concept'
                    },
                    gml : {
                        "@id" : "Geometrie.gml",
                        "@type" : "http://www.opengis.net/ont/geosparql#gmlLiteral"
                    }
                }
            ]
        }
    }

    public static getAddressShape() {
        return [
            {
                "sh:path": "dct:isVersionOf",
                "sh:nodeKind": "sh:IRI",
                "sh:minCount": 1,
                "sh:maxCount": 1,
            },
            {
                "sh:path": "prov:generatedAtTime",
                "sh:datatype": "xsd:dateTime",
                "sh:minCount": 1,
                "sh:maxCount": 1,
            },
            {
                "sh:path": "adms:versionNotes",
                "sh:datatype": "xsd:string",
                "sh:minCount": 1,
                "sh:maxCount": 1,
            },
            {
                "sh:path": "adres:heeftStraatnaam",
                "sh:nodeKind": "sh:IRI",
                "sh:minCount": 1,
                "sh:maxCount": 1
            },
            {
                "sh:path": "adres:heeftGemeentenaam",
                "sh:node": {
                    "sh:property": [
                        {
                            "sh:path": "rdfs:label",
                            "sh:datatype": "rdf:langString",
                            "sh:minCount": 1
                        },
                        {
                            "sh:path": "adres:isAfgeleidVan",
                            "sh:nodeKind": "sh:IRI",
                            "sh:minCount": 1,
                            "sh:maxCount": 1
                        }
                    ]
                }
            },
            {
                "sh:path": "adres:heeftPostinfo",
                "sh:node": {
                    "sh:property": {
                        "sh:path": "adres:postcode",
                        "sh:datatype": "xsd:string",
                        "sh:minCount": 1,
                        "sh:maxCount": 1
                    }
                }
            },
            {
                "sh:path": "adres:huisnummer",
                "sh:datatype": "xsd:string",
                "sh:minCount": 1,
                "sh:maxCount": 1
            },
            {
                "sh:path": "adres:busnummer",
                "sh:datatype": "xsd:string",
                "sh:maxCount": 1
            },
            {
                "sh:path": "adres:positie",
                "sh:node": {
                    "sh:property": [
                        {
                            "sh:path": "generiek:default",
                            "sh:datatype": "xsd:boolean",
                            "sh:minCount": 1,
                            "sh:maxCount": 1
                        },
                        {
                            "sh:path": "http://www.w3.org/ns/locn#geometry",
                            "sh:node": {
                                "sh:property": {
                                    "sh:path": "http://www.opengis.net/ont/geosparql#asGML",
                                    "sh:datatype": "http://www.opengis.net/ont/geosparql#gmlLiteral",
                                    "sh:minCount": 1,
                                    "sh:maxCount": 1
                                }
                            },
                            "sh:minCount": 1,
                            "sh:maxCount": 1
                        },
                        {
                            "sh:path": "generiek:methode",
                            "sh:datatype": "skos:Concept",
                            "sh:minCount": 1,
                            "sh:maxCount": 1
                        },
                        {
                            "sh:path": "generiek:specificatie",
                            "sh:datatype": "skos:Concept",
                            "sh:minCount": 1,
                            "sh:maxCount": 1
                        }
                    ]
                }
            },
            {
                "sh:path": "adres:Adres.status",
                "sh:datatype": "skos:Concept",
                "sh:minCount": 1,
                "sh:maxCount": 1
            },
            {
                "sh:path": "adres:officieelToegekend",
                "sh:datatype": "xsd:boolean",
                "sh:minCount": 1,
                "sh:maxCount": 1
            }
        ]
    }
}