const DemoData = {
    resources: [
        // { id: 'r0', name: 'Prod 01' },
        // { id: 'r3', name: 'Prod 02' },
        // { id: 'r4', name: 'Prod 03' }
        // { id: 'r0', name: 'Prod 01' },
        // { id: 'r1', name: 'Equip 01', parentId: 'r0' },
        // { id: 'r2', name: 'Equip 02', parentId: 'r0' },
        // { id: 'r3', name: 'Prod 02' },
        // { id: 'r4', name: 'Prod 03' },
        // { id: 'r5', name: 'Equip 03', parentId: 'r4' },
        // { id: 'r6', name: 'Equip 04', parentId: 'r4' },
        {
            "id": "17256922",
            "name": "Production1"
        },
        {
            "id": "29558720",
            "name": "Production2"
        },
        {
            "id": "39789255",
            "name": "Production3"
        },
        {
            "id": "49451101",
            "name": "Production4"
        },
        {
            "id": "17305978.17256922",
            "name": "Equipment1",
            "parentId": "17256922"
        },
        {
            "id": "21888775.17256922",
            "name": "Equipment2",
            "parentId": "17256922"
        },
        {
            "id": "148862638.17256922",
            "name": "Equipment3",
            "parentId": "17256922"
        },
        {
            "id": "63941073265.17256922",
            "name": "Equipment5",
            "parentId": "17256922"
        },
        {
            "id": "21888775.29558720",
            "name": "Equipment2",
            "parentId": "29558720"
        },
        {
            "id": "63941073265.29558720",
            "name": "Equipment5",
            "parentId": "29558720"
        },
        {
            "id": "148862638.39789255",
            "name": "Equipment3",
            "parentId": "39789255"
        },
        {
            "id": "63941073265.39789255",
            "name": "Equipment5",
            "parentId": "39789255"
        },
        {
            "id": "49390280.49451101",
            "name": "Equipment4",
            "parentId": "49451101"
        },
        {
            "id": "63941073265.49451101",
            "name": "Equipment5",
            "parentId": "49451101"
        }

    ],
    events: [
        {
            "id": "97",
            "start": "Tue Nov 04 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Tue Nov 04 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17256922",
            "title": "Ram Hier-PO-V1",
            "bgColor": "Blue",
            "item": {
                "id": "21955048183985086"
            },
            "resizable": false
        },
        {
            "id": "99",
            "start": "Thu Nov 06 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Thu Nov 06 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17256922",
            "title": "Ram Hier-PO-V2",
            "bgColor": "Teal",
            "item": {
                "id": "21955048183985376"
            },
            "resizable": false
        },
        {
            "id": "627",
            "start": "Tue Nov 04 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Tue Nov 04 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17305978.17256922",
            "title": "Ram Hier-Activity",
            "bgColor": "Blue",
            "item": {
                "id": "21955048184252866"
            },
            "resizable": true
        },
        {
            "id": "628",
            "start": "Thu Nov 06 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Thu Nov 06 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17305978.17256922",
            "title": "Ram Hier-Activity",
            "bgColor": "Teal",
            "item": {
                "id": "21955048184253042"
            },
            "resizable": true
        }

    ],


};

export default DemoData;
