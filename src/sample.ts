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
            "start": "Fri Dec 12 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Tue Dec 16 2025 20:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17256922",
            "title": "V1-Test Hier-PO",
            "bgColor": "Blue",
            "item": {
                "id": "21955048183985086"
            },
            "resizable": true,
            isRecurrent: true,
            hasConstraint: true
        },
        {
            "id": "98",
            "start": "Thu Dec 11 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Thu Dec 18 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17256922",
            "title": "V2-Test Hier-PO",
            "bgColor": "Teal",
            "item": {
                "id": "21955048183985376"
            },
            "resizable": true
        },
        {
            "id": "99",
            "start": "Wed Dec 17 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Thu Dec 18 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17256922",
            "title": "V3-Test Hier-PO",
            "bgColor": "Teal",
            "item": {
                "id": "21955048183985376"
            },
            "resizable": true
        },
        {
            "id": "629",
            "start": "Sat Dec 05 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Tue Dec 09 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17305978.17256922",
            "title": "V2-Test Hier-Activity",
            "bgColor": "Red",
            "item": {
                "id": "21955048184252867"
            },
            "resizable": true
        },
        {
            "id": "627",
            "start": "Mon Dec 08 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Tue Dec 09 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17305978.17256922",
            "title": "V1-Test Hier-Activity",
            "bgColor": "Blue",
            "item": {
                "id": "21955048184252866"
            },
            "resizable": true
        },
        {
            "id": "628",
            "start": "Tue Dec 09 2025 05:30:00 GMT+0530 (India Standard Time)",
            "end": "Thu Dec 11 2025 5:29:00 GMT+0530 (India Standard Time)",
            "resourceId": "21888775.17256922",
            "title": "Test Hier-Activity",
            "bgColor": "Teal",
            "item": {
                "id": "21955048184253042"
            },
            "resizable": true
        },
        {
            "id": "97",
            "start": "Fri Jan 09 2026 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Tue Jan 13 2026 20:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17256922",
            "title": "V1-Test Hier-PO",
            "bgColor": "Blue",
            "item": {
                "id": "21955048183985086"
            },
            "resizable": true,
            isRecurrent: true,
            hasConstraint: true
        },
        {
            "id": "98",
            "start": "Thu Jan 08 2026 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Thu Jan 15 2026 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17256922",
            "title": "V2-Test Hier-PO",
            "bgColor": "Teal",
            "item": {
                "id": "21955048183985376"
            },
            "resizable": true
        },

    ],

    eventsTab: [
        {
            "id": "97",
            "start": "Mon Dec 15 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Thu Dec 18 2025 20:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17256922",
            "title": "V1-Test Hier-PO",
            "bgColor": "Blue",
            "item": {
                "id": "21955048183985086"
            },
            "resizable": true,
            isRecurrent: true,
            hasConstraint: true
        },
        {
            "id": "98",
            "start": "Thu Dec 18 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Thu Dec 25 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17256922",
            "title": "V2-Test Hier-PO",
            "bgColor": "Teal",
            "item": {
                "id": "21955048183985376"
            },
            "resizable": true
        }]
};

export default DemoData;
