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
            "id": "17542634",
            "name": "Production1"
        },
        {
            "id": "22357446",
            "name": "Production2"
        },
        {
            "id": "34036648",
            "name": "Production3"
        },
        {
            "id": "49762690",
            "name": "Production4"
        },
        {
            "id": "14221329",
            "name": "Equipment1",
            "parentId": "17542634"
        },
        {
            "id": "21145027",
            "name": "Equipment2",
            "parentId": "17542634"
        },
        {
            "id": "147449864",
            "name": "Equipment3",
            "parentId": "17542634"
        },
        {
            "id": "63948693230",
            "name": "Equipment5",
            "parentId": "17542634"
        },
        {
            "id": "21145027",
            "name": "Equipment2",
            "parentId": "22357446"
        },
        {
            "id": "63948693230",
            "name": "Equipment5",
            "parentId": "22357446"
        },
        {
            "id": "147449864",
            "name": "Equipment3",
            "parentId": "34036648"
        },
        {
            "id": "63948693230",
            "name": "Equipment5",
            "parentId": "34036648"
        },
        {
            "id": "41617391",
            "name": "Equipment4",
            "parentId": "49762690"
        },
        {
            "id": "63948693230",
            "name": "Equipment5",
            "parentId": "49762690"
        }
    ],
    // events: [
    //     {
    //         id: 10,
    //         start: '2025-10-27 06:00:00',
    //         end: '2025-10-27 18:00:00',
    //         resourceId: 'r1',
    //         title: 'R1 has recurring tasks every week on Tuesday, Friday',
    //         // rrule: 'FREQ=WEEKLY;DTSTART=20221219T013000Z;BYDAY=TU,FR',
    //         bgColor: '#f759ab',
    //     },
    //     {
    //         id: 11,
    //         start: '2025-10-26 18:30:00',
    //         end: '2025-10-26 23:30:00',
    //         resourceId: 'r1',
    //         title: 'R1 has many tasks 3',

    //     },
    //     {
    //         id: 11,
    //         start: '2025-10-30 01:30:00',
    //         end: '2025-10-30 23:30:00',
    //         resourceId: 'r0',
    //         title: 'R1 has many tasks 3',
    //     },
    //     {
    //         id: 12,
    //         start: '2025-10-23 06:30:00',
    //         end: '2025-10-23 22:30:00',
    //         resourceId: 'r0',
    //         title: 'R1 has many tasks 4',
    //     },
    //     {
    //         id: 13,
    //         start: '2022-12-21 18:30:00',
    //         end: '2022-12-24 23:30:00',
    //         resourceId: 'r1',
    //         title: 'R1 has many tasks 5',
    //     },
    //     {
    //         id: 14,
    //         start: '2022-12-23 18:30:00',
    //         end: '2022-12-27 23:30:00',
    //         resourceId: 'r1',
    //         title: 'R1 has many tasks 6',
    //     },
    // ],
    events: [
        {
            "id": "60",
            "start": "Tue Nov 04 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Tue Nov 04 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "17542634",
            "title": "Ram Hierar-Test",
            "bgColor": "Lime",
            "item": {
                "id": "21955048183944600"
            },
             resizable: false,
        },
        {
            "id": "82",
            "start": "Tue Nov 04 2025 06:00:00 GMT+0530 (India Standard Time)",
            "end": "Tue Nov 04 2025 16:00:00 GMT+0530 (India Standard Time)",
            "resourceId": "14221329.17542634",
            "title": "Ram Hier-Activity",
            "bgColor": "",
            "item": {
                "id": "21955048183983229"
            },
             resizable: true,
        }
    ],

    eventsForTaskView: [
        {
            id: 1,
            start: '2022-12-18 09:30:00',
            end: '2022-12-18 23:30:00',
            resourceId: 'r1',
            title: 'I am finished',
            bgColor: '#D9D9D9',
            groupId: 1,
            groupName: 'Task1',
        },
        {
            id: 2,
            start: '2022-12-18 12:30:00',
            end: '2022-12-26 23:30:00',
            resourceId: 'r2',
            title: 'I am not resizable',
            resizable: false,
            groupId: 2,
            groupName: 'Task2',
        },
        {
            id: 3,
            start: '2022-12-19 12:30:00',
            end: '2022-12-20 23:30:00',
            resourceId: 'r3',
            title: 'I am not movable',
            movable: false,
            groupId: 3,
            groupName: 'Task3',
        },
        {
            id: 7,
            start: '2022-12-19 15:40:00',
            end: '2022-12-20 23:30:00',
            resourceId: 'r7',
            title: 'I am exceptional',
            bgColor: '#FA9E95',
            groupId: 4,
            groupName: 'Task4',
        },
        {
            id: 4,
            start: '2022-12-20 14:30:00',
            end: '2022-12-21 23:30:00',
            resourceId: 'r4',
            title: 'I am not start-resizable',
            startResizable: false,
            groupId: 1,
            groupName: 'Task1',
        },
        {
            id: 5,
            start: '2022-12-21 15:30:00',
            end: '2022-12-22 23:30:00',
            resourceId: 'r5',
            title: 'I am not end-resizable',
            endResizable: false,
            groupId: 3,
            groupName: 'Task3',
        },
        {
            id: 9,
            start: '2022-12-21 16:30:00',
            end: '2022-12-21 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks',
            groupId: 4,
            groupName: 'Task4',
        },
        {
            id: 6,
            start: '2022-12-22 15:35:00',
            end: '2022-12-23 23:30:00',
            resourceId: 'r6',
            title: 'I am normal',
            groupId: 1,
            groupName: 'Task1',
        },
        {
            id: 8,
            start: '2022-12-25 15:50:00',
            end: '2022-12-26 23:30:00',
            resourceId: 'r1',
            title: 'I am locked',
            movable: false,
            resizable: false,
            bgColor: 'red',
            groupId: 1,
            groupName: 'Task1',
        },
        {
            id: 10,
            start: '2022-12-26 18:30:00',
            end: '2022-12-26 23:30:00',
            resourceId: 'r2',
            title: 'R2 has many tasks',
            groupId: 4,
            groupName: 'Task4',
        },
        {
            id: 11,
            start: '2022-12-27 18:30:00',
            end: '2022-12-27 23:30:00',
            resourceId: 'r4',
            title: 'R4 has many tasks',
            groupId: 4,
            groupName: 'Task4',
        },
        {
            id: 12,
            start: '2022-12-28 18:30:00',
            end: '2022-12-28 23:30:00',
            resourceId: 'r6',
            title: 'R6 has many tasks',
            groupId: 3,
            groupName: 'Task3',
        },
    ],
    eventsForCustomEventStyle: [
        {
            id: 1,
            start: '2022-12-18 09:30:00',
            end: '2022-12-19 23:30:00',
            resourceId: 'r1',
            title: 'I am finished',
            bgColor: '#D9D9D9',
            type: 1,
        },
        {
            id: 2,
            start: '2022-12-18 12:30:00',
            end: '2022-12-26 23:30:00',
            resourceId: 'r2',
            title: 'I am not resizable',
            resizable: false,
            type: 2,
        },
        {
            id: 3,
            start: '2022-12-19 12:30:00',
            end: '2022-12-20 23:30:00',
            resourceId: 'r3',
            title: 'I am not movable',
            movable: false,
            type: 3,
        },
        {
            id: 4,
            start: '2022-12-19 14:30:00',
            end: '2022-12-20 23:30:00',
            resourceId: 'r4',
            title: 'I am not start-resizable',
            startResizable: false,
            type: 1,
        },
        {
            id: 5,
            start: '2022-12-19 15:30:00',
            end: '2022-12-20 23:30:00',
            resourceId: 'r5',
            title: 'I am not end-resizable',
            endResizable: false,
            type: 2,
        },
        {
            id: 6,
            start: '2022-12-19 15:35:00',
            end: '2022-12-19 23:30:00',
            resourceId: 'r6',
            title: 'I am normal',
            type: 3,
        },
        {
            id: 7,
            start: '2022-12-19 15:40:00',
            end: '2022-12-20 23:30:00',
            resourceId: 'r7',
            title: 'I am exceptional',
            bgColor: '#FA9E95',
            type: 1,
        },
        {
            id: 8,
            start: '2022-12-19 15:50:00',
            end: '2022-12-19 23:30:00',
            resourceId: 'r1',
            title: 'I am locked',
            movable: false,
            resizable: false,
            bgColor: 'red',
            type: 2,
        },
        {
            id: 9,
            start: '2022-12-19 16:30:00',
            end: '2022-12-27 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 1',
            type: 3,
        },
        {
            id: 10,
            start: '2022-12-20 18:30:00',
            end: '2022-12-20 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 2',
            type: 1,
        },
        {
            id: 11,
            start: '2022-12-21 18:30:00',
            end: '2022-12-22 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 3',
            type: 2,
        },
        {
            id: 12,
            start: '2022-12-23 18:30:00',
            end: '2022-12-27 23:30:00',
            resourceId: 'r1',
            title: 'R1 has many tasks 4',
            type: 3,
        },
    ],
};

export default DemoData;
