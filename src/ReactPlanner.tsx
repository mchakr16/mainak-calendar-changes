import { Col, Row } from 'antd';
import { useEffect, useRef, useState, useReducer } from "react";
import { Scheduler, SchedulerData, ViewType, CellUnit, DATE_FORMAT } from "./react-schedule/index";
import EventItem from './react-schedule/components/EventItem';
// import { HTML5Backend } from 'react-dnd-html5-backend'
// import { DndProvider } from 'react-dnd'
import dayjs from "dayjs";
// import './index.css';
import './react-schedule/css/style.css'
// import { ObjectItem, ValueStatus } from "mendix";
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
const eventList: any = [
    {
        id: 1,
        start: '2025-06-20 09:30:00',
        end: '2025-06-20 13:30:00',
        resourceId: 'r1',
        title: 'I am finished',
        bgColor: '#D9D9D9',
    },
    {
        id: 2,
        start: '2022-12-18 12:30:00',
        end: '2022-12-26 23:30:00',
        resourceId: 'r2',
        title: 'I am not resizable',
        resizable: false,
    },
    {
        id: 3,
        start: '2022-12-19 12:30:00',
        end: '2022-12-20 23:30:00',
        resourceId: 'r3',
        title: 'I am not movable',
        movable: false,
    },
    {
        id: 4,
        start: '2022-12-19 14:30:00',
        end: '2022-12-20 23:30:00',
        resourceId: 'r1',
        title: 'I am not start-resizable',
        startResizable: false,
    },
    {
        id: 5,
        start: '2022-12-19 10:30:00',
        end: '2022-12-19 13:30:00',
        resourceId: 'r2',
        title: 'R2 has recurring tasks every week on Tuesday, Friday',
        rrule: 'FREQ=WEEKLY;DTSTART=20221219T013000Z;BYDAY=TU,FR',
        bgColor: '#f759ab',
    },
    {
        id: 6,
        start: '2025-10-17 14:30:00',
        end: '2025-10-17 23:30:00',
        resourceId: 'r0',
        title: 'I am not start-resizable',
    }
]

// interface CustomEventItem extends EventItem {
//   click: () => void;
//   item: ObjectItem;
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

const generateShiftSlots = (shiftCount, dayStartFrom) => {
    const slots: any = [];
    const totalHours = 24;
    const slotHours = totalHours / shiftCount;

    let currentStart = dayStartFrom;

    for (let i = 0; i < shiftCount; i++) {
        const startHour = currentStart % 24;
        const endHour = (startHour + slotHours) % 24;

        const pad = (h) => (h < 10 ? `0${h}` : `${h}`);
        slots.push({
            start: `${pad(startHour)}:00`,
            end: `${pad(endHour)}:00`,
            label: `Shift ${i + 1}`
        });
        currentStart = (currentStart + slotHours) % 24;
    }
    return slots;
}


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
    const generatedSlots = generateShiftSlots(SHIFT_COUNT, dayStartFrom);

    useEffect(() => {
        schedulerData = new SchedulerData(
            dayjs().format(DATE_FORMAT),
            ViewType.Week,
            false,
            false,
            {
                schedulerWidth: '95%',
                minuteStep: 60,
                schedulerMaxHeight: 400,
                dayResourceTableWidth: 150,
                weekResourceTableWidth: 160,
                customResourceTableWidth: 150,
                quarterResourceTableWidth: 150,
                monthResourceTableWidth: 150,
                tableHeaderHeight: 120,
                eventItemHeight: 36,
                eventItemLineHeight: 38,
                nonAgendaSlotMinHeight: 50,
                displayWeekend: props.showWeekends || false,
                weekCellWidth: '12%',
                monthCellWidth: 40,
                quarterCellWidth: 75,
                defaultExpanded: false,
                calenderConfig: {
                    applyButtonText: 'Apply',
                    applyButtonType: 'primary',
                    applyButtonAlignment: 'center',
                },
                shiftCount: SHIFT_COUNT,
                shiftSlots: generatedSlots,
                views: [
                    {
                        viewName: 'Day',
                        viewType: ViewType.Custom,
                        showAgenda: false,
                        isEventPerspective: false,
                    },
                    {
                        viewName: 'Week',
                        viewType: ViewType.Week,
                        showAgenda: false,
                        isEventPerspective: false,
                    },
                    {
                        viewName: 'Month',
                        viewType: ViewType.Month,
                        showAgenda: false,
                        isEventPerspective: false,
                    },
                    { viewName: 'Quarter', viewType: ViewType.Quarter, showAgenda: false, isEventPerspective: false },
                    {
                        viewName: 'Year',
                        viewType: ViewType.Year,
                        showAgenda: false,
                        isEventPerspective: false,
                    },
                ],
            },
            {
                isNonWorkingTimeFunc: (_schedulerData, time) => {
                    const day = dayjs(time).day();
                    return day === 0 || day === 6;
                },
                getCustomDateFunc: (_schedData, _num, baseDate) => {
                    const startDate = dayjs(baseDate).hour(Number(dayStartFrom)).minute(0).second(0);
                    const endDate = startDate.add(23, 'hour');

                    return {
                        startDate,
                        endDate,
                        cellUnit: CellUnit.Hour,
                    };
                },
            }
        );

        schedulerData.localeDayjs.locale('en-gb');
        // schedulerData.setResources(DemoData.resources);
        // schedulerData.setEvents(eventList);

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
        const newEventList: EventItem[] = [];
        props.eventData?.items?.forEach(item => {
            newEventList.push({
                id: props.eventIdAttr.get(item).value?.toString()!,
                start: props.eventStartAttr.get(item).value?.toString()!,
                end: props.eventEndAttr.get(item).value?.toString()!,
                resourceId: props.eventResourceAttr.get(item).value?.toString()!,
                title: props.eventTitleAttr.get(item).value?.toString()!,
                bgColor: props.eventColorAttr ? props.eventColorAttr.get(item).value : defaultEventColor,
                click: () => onItemClick(item),
                item: item
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
        const newResourceList: any[] = [];
        props.resourceData?.items?.forEach(item => {
            newResourceList.push({
                id: props.resourceIdAttr.get(item).value?.toString()!,
                name: props.resourceNameAttr.get(item).value?.toString()!
            });
        });
        // setResources(DemoData.resources);
        schedulerData.setResources(DemoData.resources);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    }, [props.resourceData, schedulerData, props.resourceIdAttr, props.resourceNameAttr]);

    /**
     * Handler for clicking the "previous" button in the scheduler.
     * Moves the view to the previous time period and updates events.
     */
    const prevClick = () => {
        schedulerData.prev();
        updateViewStartEnd(schedulerData)
        // props.eventData.reload();
        schedulerData.setEvents(events);
        // forceUpdateSchedulerData(schedulerData);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    /**
     * Handler for clicking the "next" button in the scheduler.
     * Moves the view to the next time period and updates events.
     */
    const nextClick = () => {
        schedulerData.next();
        updateViewStartEnd(schedulerData)
        // props.eventData.reload();
        schedulerData.setEvents(events);
        // forceUpdateSchedulerData(schedulerData);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    /**
     * Handler for selecting a date in the scheduler.
     * Updates the scheduler's date and reloads events.
     */
    const onSelectDate = (_schedulerData: SchedulerData, date: string) => {
        schedulerData.setDate(date);
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
        schedulerData.setViewType(view.viewType);
        // updateSchedulerWidth();
        updateViewStartEnd(schedulerData)
        // props.eventData.reload();
        schedulerData.setEvents(events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
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
        schedulerData.config.shiftSlots = generateShiftSlots(shiftCount, dayStartFrom);
        schedulerData.setViewAfterSettingsUpdate();

        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    // Render the planner and scheduler
    return (
        <div ref={plannerRef} >
            {state.showScheduler && (
                <Row>
                    <Col style={{ width: '95%' }}>
                        <Scheduler
                            schedulerData={state.viewModel}
                            prevClick={prevClick}
                            nextClick={nextClick}
                            onSelectDate={onSelectDate}
                            onViewChange={onViewChange}
                            eventItemClick={(_schedulerData: SchedulerData<EventItem>, event: any) => {
                                event.click();
                            }}
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
                        />
                    </Col>
                </Row>
            )}

        </div>
    );
}

export default ReactPlanner;
