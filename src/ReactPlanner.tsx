import { Col, Row } from 'antd';
import { useEffect, useRef, useState, useReducer } from "react";
import { Scheduler, SchedulerData, ViewType, CellUnit, DATE_FORMAT } from "./react-schedule/index";
import EventItem from './react-schedule/components/EventItem';
// import { HTML5Backend } from 'react-dnd-html5-backend'
// import { DndProvider } from 'react-dnd'
import dayjs from "dayjs";
// import './index.css';
import './react-schedule/css/style.css'
// import { ValueStatus } from 'mendix';
// import type { ObjectItem, ValueStatus } from 'mendix';
// import { ReactPlannerContainerProps } from "typings/ReactPlannerProps";
import 'dayjs/locale/en-gb';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import DemoData from './sample';

dayjs.extend(isLeapYear);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('en-gb');
dayjs.extend(isoWeek);

//Default event list
const eventList: any = []

// interface CustomEventItem extends EventItem {
//     click: () => void;
//     item: ObjectItem;
// }

const defaultEventColor = "#ccc"

const initialState = {
    showScheduler: false,
    viewModel: {},
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'INITIALIZE':
            return { showScheduler: true, viewModel: action.payload };
        case 'UPDATE_SCHEDULER':
            return { ...state, viewModel: action.payload };
        default:
            return state;
    }
};

// const generateShiftSlots = (shiftCount, dayStartFrom) => {
//     const slots: any = [];
//     const totalHours = 24;
//     const slotHours = totalHours / shiftCount;

//     let currentStart = dayStartFrom;

//     for (let i = 0; i < shiftCount; i++) {
//         const startHour = currentStart % 24;
//         const endHour = (startHour + slotHours) % 24;

//         const to12 = (h: number) => {
//             const mod = ((h % 24) + 24) % 24;
//             const hour12 = mod % 12 === 0 ? 12 : mod % 12;
//             const suffix = mod < 12 ? 'am' : 'pm';
//             return `${hour12}${suffix}`;
//         };

//         const pad = (h) => (h < 10 ? `0${h}` : `${h}`);
//         slots.push({
//             start: `${pad(startHour)}:00`,
//             end: `${pad(endHour)}:00`,
//             label: `${to12(startHour)}-${to12(endHour)}`
//         });
//         currentStart = (currentStart + slotHours) % 24;
//     }
//     return slots;
// }


const formatShiftSlots = (mxShift) => {
    if (!mxShift.length) return [];

    const formatTime = (date: Date) => date.toISOString().substring(11, 16);

    const sorted = [...mxShift].sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime());

    const slots: any[] = [];

    const DAY_MINUTES = 24 * 60;

    const toMinutes = (date: Date) => date.getUTCHours() * 60 + date.getUTCMinutes();

    for (let i = 0; i < sorted.length; i++) {
        const shift = sorted[i];
        const start = new Date(shift.StartTime);
        const end = new Date(shift.EndTime);

        slots.push({ start: formatTime(start), end: formatTime(end), name: shift.Name });

        const nextShift = sorted[(i + 1) % sorted.length];
        const nextStart = new Date(nextShift.StartTime);

        let gapStartMin = toMinutes(end);
        let gapEndMin = toMinutes(nextStart);

        if (gapEndMin <= gapStartMin) gapEndMin += DAY_MINUTES;

        if (gapEndMin > gapStartMin) {
            const gapStart = new Date(end);
            const gapEnd = new Date(end);
            gapEnd.setUTCMinutes(gapEnd.getUTCMinutes() + (gapEndMin - gapStartMin));

            if (formatTime(gapStart) !== formatTime(gapEnd)) {
                slots.push({ start: formatTime(gapStart), end: formatTime(gapEnd), name: '' });
            }
        }
    }

    slots.sort((a, b) => {
        const [aH, aM] = a.start.split(':').map(Number);
        const [bH, bM] = b.start.split(':').map(Number);
        return aH * 60 + aM - (bH * 60 + bM);
    });

    return slots;
};

let schedulerData: any;

const ReactPlanner = (props: any) => {
    // Early return if viewStart or viewEnd are not available
    // if (props && props.viewStart && props.viewEnd && props.viewStart.status !== ValueStatus.Available && props.viewEnd.status !== ValueStatus.Available) {
    //   return <div />;
    // }

    // State and refs for events, resources, update flag, planner width, and resize timeout
    const [events, setEvents] = useState<EventItem[]>(eventList);

    const plannerRef = useRef<HTMLDivElement>(null);

    const [state, dispatch] = useReducer(reducer, initialState);
    const dayStartFrom = props.dayStartFrom || 6; // update dayStartFrom props
    const SHIFT_COUNT = 3; // update shift count
    // const generatedSlots = generateShiftSlots(SHIFT_COUNT, dayStartFrom);
    const mxShift = [
        {
            "ShiftId": 5,
            "Name": "Shift1",
            "StartTime": "2025-10-10T06:00:00.000Z",
            "EndTime": "2025-10-10T14:00:00.000Z",
            "changedDate": "2025-10-10T04:53:44.298Z",
            "createdDate": "2025-10-10T04:53:17.797Z"
        },
        {
            "ShiftId": 6,
            "Name": "Shift2",
            "StartTime": "2025-10-10T14:00:00.000Z",
            "EndTime": "2025-10-10T22:00:00.000Z",
            "changedDate": "2025-10-10T04:54:32.519Z",
            "createdDate": "2025-10-10T04:54:06.204Z"
        },
        {
            "ShiftId": 7,
            "Name": "Shift3",
            "StartTime": "2025-10-10T22:00:00.000Z",
            "EndTime": "2025-10-11T06:00:00.000Z",
            "changedDate": "2025-10-10T04:54:32.519Z",
            "createdDate": "2025-10-10T04:54:06.204Z"
        }
    ]

    const schedulerDataRef = useRef(null);

    useEffect(() => {
        schedulerData = new SchedulerData(
            dayjs().format(DATE_FORMAT),
            getDefaultView(),
            false,
            false,
            {
                schedulerWidth: '95%',
                minuteStep: 60,
                resourceTableWidth: 180,
                schedulerMaxHeight: window.innerHeight - 200,
                dayResourceTableWidth: 160,
                weekResourceTableWidth: 160,
                customResourceTableWidth: 160,
                quarterResourceTableWidth: 160,
                monthResourceTableWidth: 160,
                tableHeaderHeight: 120,
                eventItemHeight: 36,
                eventItemLineHeight: 38,
                nonAgendaSlotMinHeight: 50,
                displayWeekend: props.showWeekends || false,
                disabledWeekendOnViewsList: [ViewType.Custom],
                weekCellWidth: 50,
                monthCellWidth: 45,
                quarterCellWidth: 75,
                customCellWidth: 40,
                defaultExpanded: false,
                // endHour: 15,
                calenderConfig: {
                    applyButtonText: 'Apply',
                    applyButtonType: 'primary',
                    applyButtonAlignment: 'center',
                },
                shiftSlots: formatShiftSlots(mxShift),
                // [
                //     { start: '06:00', end: '14:00', name: 'Shift 1' },
                //     { start: '14:00', end: '22:00', name: 'Shift 2' },
                //     { start: '22:00', end: '06:00', name: 'Shift 3' },
                // ],
                shiftCount: SHIFT_COUNT,
                views: [
                    { viewName: 'Day', viewType: ViewType.Custom, showAgenda: false, isEventPerspective: false },
                    { viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false, },
                    { viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
                    { viewName: 'Quarter', viewType: ViewType.Quarter, showAgenda: false, isEventPerspective: false },
                    { viewName: 'Year', viewType: ViewType.Year, showAgenda: false, isEventPerspective: false },
                ],
            },
            {
                isNonWorkingTimeFunc: (_schedulerData, time) => {
                    const day = dayjs(time).day();
                    return day === 0 || day === 6;
                },
                getCustomDateFunc: (_schedData, num, baseDate) => {
                    const base = baseDate ? dayjs(baseDate) : dayjs(_schedData.startDate || dayjs());
                    const startDate = dayjs(base).add(num, 'day').hour(Number(dayStartFrom)).minute(0).second(0);
                    const endDate = startDate.add(23, 'hour');
                    return { startDate, endDate, cellUnit: CellUnit.Hour };
                },
            }
        );

        schedulerData.localeDayjs.locale('en-gb');
        schedulerDataRef.current = schedulerData;
        console.log(formatShiftSlots(mxShift))
        dispatch({ type: 'INITIALIZE', payload: schedulerData });
    }, []);


    /**
     * Returns the list of views to show in the scheduler based on props.
     */
    // const getViews = (): View[] => {
    //     const views: View[] = [];
    //     if (props.showDay)
    //         views.push({ viewName: 'Day', viewType: ViewType.Day, showAgenda: false, isEventPerspective: false });
    //     if (props.showWeek)
    //         views.push({ viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false });
    //     if (props.showMonth)
    //         views.push({ viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false });
    //     if (props.showYear)
    //         views.push({ viewName: 'Year', viewType: ViewType.Year, showAgenda: false, isEventPerspective: false });
    //     return views;
    // };

    /**
     * Returns the default view type for the scheduler based on props.
     */
    function getDefaultView() {
        // if (props.defaultView === "Day")
        //     return ViewType.Day
        // else if (props.defaultView === "Week")
        //     return ViewType.Week
        // else if (props.defaultView === "Month")
        return ViewType.Month
        // else if (props.defaultView === "Year")
        //     return ViewType.Year
    }
    /**
     * Updates the view start and end dates in the Mendix state.
     */
    function updateViewStartEnd(schedulerData: SchedulerData) {
        let start = schedulerData.getViewStartDate();
        let end = schedulerData.getViewEndDate();
        props.viewStart?.setValue(start.toDate());
        props.viewEnd?.setValue(end.toDate());
    }

    // Effect: Update events from Mendix data when eventData changes
    useEffect(() => {
        // const newEventList: EventItem[] = [];
        const newEventList = props.eventData?.items?.map((item) => {
            newEventList.push({
                id: props.eventIdAttr.get(item).value?.toString()!,
                start: props.eventStartAttr.get(item).value?.toString()!,
                end: props.eventEndAttr.get(item).value?.toString()!,
                resourceId: props.eventResourceAttr.get(item).value?.toString()!,
                title: props.eventTitleAttr.get(item).value?.toString()!,
                bgColor: props.eventColorAttr ? props.eventColorAttr.get(item).value : defaultEventColor,
                click: () => onItemClick(item),
                item: item,
                resizable: props.eventResourceAttr.get(item).value?.includes('.')
            });
        });
        setEvents(DemoData.events);
        schedulerData.setEvents(DemoData.events);
        if (props.eventSelection && newEventList.length > 0) {
            const firstEvent = newEventList[0];
            props.eventSelection.setSelection(firstEvent.item);

            if (props.newEventStart?.setValue) {
                props.newEventStart.setValue(new Date(firstEvent.start));
            }
            if (props.newEventEnd?.setValue) {
                props.newEventEnd.setValue(new Date(firstEvent.end));
            }
            if (props.newEventResourceId?.setValue) {
                props.newEventResourceId.setValue(firstEvent.resourceId);
            }
        }
    }, [props.eventData]);

    // Effect: Update resources from Mendix data when resourceData changes
    useEffect(() => {
        // const newResourceList: any[] = [];
        // props.resourceData?.items?.forEach(item => {
        //     newResourceList.push({
        //         id: props.resourceIdAttr.get(item).value?.toString()!,
        //         name: props.resourceNameAttr.get(item).value?.toString()!
        //     });
        // });
        // setResources(DemoData.resources);

        const newResourceList: any[] = DemoData.resources?.map((item) => {
            const id = item.id?.toString();
            const name = item.name?.toString();
            const parentId = item.parentId?.toString();
            const hasRealParent = parentId != null && parentId !== '' && parentId !== '0';
            return { id, name, ...(hasRealParent ? { parentId } : {}) };
        }) ?? [];
        schedulerData.setResources(newResourceList);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    }, [props.resourceData, schedulerData, props.resourceIdAttr, props.resourceNameAttr]);

    /**
     * Handler for clicking the "previous" button in the scheduler.
     * Moves the view to the previous time period and updates events.
     */
    const prevClick = (schedulerData) => {
        schedulerData.prev();
        updateViewStartEnd(schedulerData)
        // props.eventData.reload();
        schedulerData.setEvents(events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    /**
     * Handler for clicking the "next" button in the scheduler.
     * Moves the view to the next time period and updates events.
     */
    const nextClick = (schedulerData) => {
        schedulerData.next();
        updateViewStartEnd(schedulerData)
        // props.eventData.reload();
        schedulerData.setEvents(events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    /**
     * Handler for selecting a date in the scheduler.
     * Updates the scheduler's date and reloads events.
     */
    const onSelectDate = (_schedulerData: SchedulerData, date: string) => {
        _schedulerData.setDate(date);
        updateViewStartEnd(schedulerData)
        // props.eventData.reload();
        schedulerData.setEvents(events);
        sessionStorage.setItem('selectedSchedulerDate', date);
        // forceUpdateSchedulerData(schedulerData);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    /**
     * Handler for changing the view type (Day, Week, Month, Year) in the scheduler.
     * Updates the view and reloads events.
     */
    const onViewChange = (_schedulerData: SchedulerData, view: any) => {
        _schedulerData.setViewType(view.viewType);
        // updateSchedulerWidth();
        updateViewStartEnd(_schedulerData)
        // props.eventData.reload();
        _schedulerData.setEvents(events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: _schedulerData });
    };

    /**
     * Handler for clicking an event item in the scheduler.
     * Sets the selected event in Mendix and executes any selection action.
     */
    const onItemClick = (_item: EventItem) => {
        // props.eventSelection.setSelection(item);
        // if (props.onEventSelection)
        //   props.onEventSelection?.execute();
    }

    /**
     * Handler for creating a new event in the scheduler.
     * Sets the new event's resource, start, and end in Mendix and executes any new event action.
     */
    const onNewEvent = (resourceId: string, start: string, end: string) => {
        props.newEventResourceId.setValue(resourceId);
        props.newEventStart.setValue(new Date(start));
        props.newEventEnd.setValue(new Date(end));
        if (props.newEventAction)
            props.newEventAction.execute()
    }

    // Show loading state if event or resource data is not available
    // if (!props.eventData || props.eventData.status !== ValueStatus.Available
    //   || !props.resourceData || props.resourceData.status !== ValueStatus.Available) {
    //   return <div />
    // }

    const moveEvent = (schedulerData: SchedulerData, event: EventItem, slotId: string, slotName: string, start: string, end: string) => {
        try {
            schedulerData.moveEvent(event, slotId, slotName, start, end);

            const customEvent = event as EventItem;
            const item = customEvent.item;

            props.eventSelection.setSelection(item);
            props.newEventResourceId.setValue(slotId);
            props.newEventStart.setValue(new Date(start));
            props.newEventEnd.setValue(new Date(end));

            // 🔹 Let Mendix microflow/nanoflow handle updating attributes & commit
            if (props.onDragUpdate?.canExecute) {
                props.onDragUpdate.execute();
            }

            dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
        } catch (e) {
            console.error("moveEvent error:", e);
        }
    };

    // 🔹 Called when user resizes the start of an event
    const updateEventStart = (_schedulerData: SchedulerData<EventItem>, event: any, newStart: string) => {
        try {
            console.log("resizeStarted:", newStart, event);

            props.eventSelection.setSelection(event.item);
            props.newEventResourceId.setValue(event.item.id);
            props.newEventStart.setValue(new Date(newStart));
            props.newEventEnd.setValue(new Date(event.end));

            if (props.onResizeUpdate?.canExecute) {
                props.onResizeUpdate.execute();
            }

            dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
        } catch (e) {
            console.error("updateEventStart error:", e);
        }
    };

    // 🔹 Called when user resizes the end of an event
    const updateEventEnd = (_schedulerData: SchedulerData<EventItem>, event: any, newEnd: string) => {
        try {
            console.log("resizeEnded:", newEnd, event);
            props.eventSelection.setSelection(event.item);
            props.newEventResourceId.setValue(event.item.id);
            props.newEventStart.setValue(new Date(event.start));
            props.newEventEnd.setValue(new Date(newEnd));
            if (props.onResizeUpdate?.canExecute) {
                props.onResizeUpdate.execute();
            }
            dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
        } catch (e) {
            console.error("updateEventEnd error:", e);
        }
    };

    const toggleExpandFunc = (schedulerData, slotId) => {
        schedulerData.toggleExpandStatus(slotId);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const onToggleChange = (schedulerData) => {
        schedulerData.config.displayWeekend = !schedulerData.config.displayWeekend;
        schedulerData.setViewAfterSettingsUpdate();
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });

    };

    const onShiftCountChange = (schedulerData, shiftCount) => {
        schedulerData.config.shiftCount = Number(shiftCount);
        // schedulerData.config.shiftSlots = [
        //     { start: '06:00', end: '14:00', label: 'Shift 1' },
        //     { start: '14:00', end: '22:00', label: 'Shift 2' },
        //     { start: '22:00', end: '06:00', label: 'Shift 3' },
        // ];
        // schedulerData.config.endHour = (8 * shiftCount) - 1;
        // const behaviors = schedulerData?.behaviors;
        // if (behaviors) {
        // const baseDate = new Date();
        // schedulerData.behaviors.getCustomDateFunc(schedulerData, 0, baseDate);
        // }
        schedulerData.setViewAfterSettingsUpdate();
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const onEventItemDoubleClick = (schedulerData: SchedulerData<EventItem>, event: any) => {
        console.log("double cliked", event, schedulerData, event.id);
    }

    const onEventItemClick = (schedulerData: SchedulerData<EventItem>, event: any) => {
        console.log("clicked", event, schedulerData, event.id);
    }

    const eventItemIconClick = (schedulerData: SchedulerData<EventItem>, event: any, iconType: any) => {
        console.log('You clciked on event icon==>', iconType) // need to call mendix based on iconType
        console.log("event data eventItemIconClick", event, schedulerData, event.id, iconType);
    }

    // Render the planner and scheduler
    return (
        <div ref={plannerRef} >
            {state.showScheduler && (
                <Row>
                    <Col style={{ width: '100%' }}>
                        <Scheduler
                            schedulerData={state.viewModel}
                            prevClick={prevClick}
                            nextClick={nextClick}
                            onSelectDate={onSelectDate}
                            onViewChange={onViewChange}
                            eventItemClick={onEventItemClick}
                            newEvent={(_, slotId, __, start, end) => { onNewEvent(slotId, start, end) }}
                            eventItemPopoverTemplateResolver={(_schedulerData: SchedulerData, event: any) => {
                                return (<div>{props.popoverContent?.get(event.item)}</div>);
                            }}
                            toggleExpandFunc={toggleExpandFunc}
                            moveEvent={moveEvent}

                            updateEventStart={updateEventStart}
                            updateEventEnd={updateEventEnd}
                            onToggleChange={onToggleChange}
                            onShiftCountChange={onShiftCountChange}
                            eventItemDoubleClick={onEventItemDoubleClick}
                            eventItemIconClick={eventItemIconClick}
                        />
                    </Col>
                </Row>
            )}

        </div>
    );
}

export default ReactPlanner;
