
import { useEffect, useRef, useState } from "react";
import { Scheduler, SchedulerData, ViewType, CellUnit, DATE_FORMAT } from "./react-schedule/index";
import EventItem from './react-schedule/components/EventItem';
// import { HTML5Backend } from 'react-dnd-html5-backend'
// import { DndProvider } from 'react-dnd'
import dayjs from "dayjs";
import './index.css';
import './react-schedule/css/style.css'
// import { ObjectItem, ValueStatus } from "mendix";
// import { ReactPlannerContainerProps } from "typings/ReactPlannerProps";
import 'dayjs/locale/en-gb';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isLeapYear);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('en-gb');
dayjs.extend(isoWeek);

interface Resource {
    id: string;
    name: string;
    groupOnly: boolean;
    parentId?: undefined;
}

//Default resource list
const resourceList: any = [
    { id: 'r0', name: 'Resource0' },
    { id: 'r1', name: 'Resource1' },
    { id: 'r2', name: 'Resource2', parentId: 'r0' },
    { id: 'r3', name: 'Resource3', parentId: 'r4' },
    { id: 'r4', name: 'Resource4', parentId: 'r2' },
];

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
        start: '2025-10-14 14:30:00',
        end: '2025-10-14 23:30:00',
        resourceId: 'r2',
        title: 'I am not start-resizable'
    }
]

// interface CustomEventItem extends EventItem {
//   click: () => void;
//   item: ObjectItem;
// }

const defaultEventColor = "#ccc"

/**
 * Waits until the Scheduler DOM element exists and has a non-zero width, then calls the callback.
 * Used to ensure measurements are only taken when the Scheduler is fully rendered and sized.
 */
function waitForSchedulerWidth(cb: () => void) {
    function check() {
        const el = document.getElementById('RBS-Scheduler-root');
        if (el && el.offsetWidth > 0) {
            cb();
        } else {
            requestAnimationFrame(check);
        }
    }
    check();
}

const ReactPlanner = (props: any) => {
    // Early return if viewStart or viewEnd are not available
    // if (props && props.viewStart && props.viewEnd && props.viewStart.status !== ValueStatus.Available && props.viewEnd.status !== ValueStatus.Available) {
    //   return <div />;
    // }

    // State and refs for events, resources, update flag, planner width, and resize timeout
    const [events, setEvents] = useState<EventItem[]>(eventList);
    const [resources, setResources] = useState<Resource[]>(resourceList);
    const [updateFlag, setUpdateFlag] = useState(0);
    const plannerRef = useRef<HTMLDivElement>(null);
    const [plannerWidth, setPlannerWidth] = useState<number>(0);
    // const resizeTimeout = useRef<NodeJS.Timeout | null>(null);

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

    const savedDate = sessionStorage.getItem('selectedSchedulerDate');
    const initialDate = savedDate || dayjs().format(DATE_FORMAT);

    // SchedulerData instance and configuration
    const schedulerDataRef = useRef(new SchedulerData(initialDate, getDefaultView(),
    ));

    // Set initial configuration for the schedulerData instance
    const schedulerData = schedulerDataRef.current;
    schedulerData.config.views = [
        { viewName: "Day", viewType: ViewType.Custom, showAgenda: false, isEventPerspective: false },
        { viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false, },
        { viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false, },
        { viewName: 'Quarter', viewType: ViewType.Quarter, showAgenda: false, isEventPerspective: false, },
        { viewName: 'Year', viewType: ViewType.Year, showAgenda: false, isEventPerspective: false, },
    ];
    schedulerData.setSchedulerLocale('en-gb');
    schedulerData.setCalendarPopoverLocale('en-gb');
    schedulerData.config.schedulerMaxHeight = 500;
    schedulerData.config.customCellWidth = 40;
    schedulerData.config.minuteStep = 60;
    schedulerData.config.displayWeekend = true;
    schedulerData.config.shiftCount = 2;
    schedulerData.config.shiftSlots = [
        { start: '06:00', end: '18:00' },
        // { start: '14:00', end: '22:00' },
        { start: '18:00', end: '06:00' },
    ];
    schedulerData.config.responsiveByParent = true;
    schedulerData.config.tableHeaderHeight = 120;
    schedulerData.config.nonAgendaSlotMinHeight = 60;
    schedulerData.config.eventItemHeight = 36;
    schedulerData.config.eventItemLineHeight = 38;
    schedulerData.config.weekCellWidth = schedulerData.config.displayWeekend ? 140 : 160;

    schedulerData.behaviors.isNonWorkingTimeFunc = (_schedulerData, time) => {
        const day = dayjs(time).day();
        return day === 0 || day === 6;
    }

    const dayStartFrom = props.dayStartFrom || 6; // update dayStartFrom props
    // const dayStopTo = props.dayStopTo || 30; // update dayStopTo props

    schedulerData.behaviors.getCustomDateFunc = (_schedData, _num, baseDate) => {
        const startDate = dayjs(baseDate).hour(Number(dayStartFrom)).minute(0).second(0);
        const endDate = startDate.add(24, 'hour');

        return { startDate, endDate, cellUnit: CellUnit.Hour };
    };

    // Force update the schedulerData to reflect changes
    const forceUpdateSchedulerData = (sd: SchedulerData) => {
        const newSchedulerData = new SchedulerData(
            sd.startDate,
            sd.viewType,
            sd.showAgenda,
            sd.isEventPerspective,
            {
                ...sd.config,
            },
            sd.behaviors
        );
        newSchedulerData.setResources(sd.resources);
        newSchedulerData.setEvents(sd.events);
        newSchedulerData.setSchedulerLocale("en-gb");
        newSchedulerData.setCalendarPopoverLocale("en-gb");
        schedulerDataRef.current = newSchedulerData;
        setUpdateFlag(f => f + 1);
    };
    /**
     * Updates the view start and end dates in the Mendix state.
     */
    function updateViewStartEnd(schedulerData: SchedulerData) {
        let start = schedulerData.getViewStartDate();
        let end = schedulerData.getViewEndDate();
        props.viewStart?.setValue(start.toDate());
        props.viewEnd?.setValue(end.toDate());
    }

    /**
     * Updates the scheduler's documentWidth property and triggers a re-render.
     * Also accounts for the right margin of the scheduler root element.
     */
    const updateSchedulerWidth = () => {
        let schedulerItem = document.getElementById('RBS-Scheduler-root');
        let rightMargin: string | number = 0;
        if (schedulerItem) {
            rightMargin = window.getComputedStyle(schedulerItem).marginRight;
            rightMargin = parseInt(rightMargin.substring(0, rightMargin.length - 2));
        }
        schedulerData.documentWidth = schedulerData.documentWidth + (isNaN(rightMargin as number) ? 0 : (rightMargin as number));
        setUpdateFlag(f => f + 1);
    };

    /**
     * Updates the plannerWidth state with the current width of the planner container.
     */
    const updateWidth = () => {
        if (plannerRef.current) {
            setPlannerWidth(plannerRef.current.offsetWidth);
        }
    };

    // Effect: Debounced window resize handler, updates width 200ms after resize stops
    // useEffect(() => {
    //   const handleResize = () => {
    //     if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    //     resizeTimeout.current = setTimeout(() => {
    //       updateWidth();
    //     }, 200);
    //   };

    //   updateWidth();
    //   window.addEventListener('resize', handleResize);
    //   return () => {
    //     window.removeEventListener('resize', handleResize);
    //     if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    //   };
    // }, []);

    // Effect: Wait for Scheduler DOM to be rendered and sized, then update width
    useEffect(() => {
        // If already present and has width, update immediately
        const el = document.getElementById('RBS-Scheduler-root');
        if (el && el.offsetWidth > 0) {
            updateWidth();
            return;
        }
        waitForSchedulerWidth(updateWidth);
    }, []);

    // Effect: Update scheduler width when plannerWidth or schedulerData changes
    useEffect(() => {
        let animationFrame: number | null = null;
        if (plannerWidth > 0) {
            animationFrame = window.requestAnimationFrame(updateSchedulerWidth);
        } else {
            updateSchedulerWidth();
        }
        return () => {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
        };
    }, [plannerWidth, schedulerData]);

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
        setEvents(eventList);
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
        setResources(resourceList);
        schedulerData.setResources(resourceList);
        setUpdateFlag(f => f + 1);
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
        setUpdateFlag(f => f + 1);
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
        setUpdateFlag(f => f + 1);
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
        setUpdateFlag(f => f + 1);
    };

    /**
     * Handler for changing the view type (Day, Week, Month, Year) in the scheduler.
     * Updates the view and reloads events.
     */
    const onViewChange = (_schedulerData: SchedulerData, view: any) => {
        schedulerData.setViewType(view.viewType);
        updateSchedulerWidth();
        updateViewStartEnd(schedulerData)
        // props.eventData.reload();
        forceUpdateSchedulerData(schedulerData);
        setUpdateFlag(f => f + 1);
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

    // Set events and resources on the schedulerData instance
    schedulerData.setEvents(events);
    schedulerData.setResources(resources);
    console.debug(`Update flag: ${updateFlag}, plannerWidth: ${plannerWidth}`);

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

            setUpdateFlag(f => f + 1);
        } catch (e) {
            console.error("moveEvent error:", e);
        }
    };

    // 🔹 Called when user resizes the start of an event
    const updateEventStart = (
        _schedulerData: SchedulerData<EventItem>,
        event: any,
        newStart: string) => {
        try {
            console.log("resizeStarted:", newStart, event);

            // ✅ Tell Mendix which object this resize belongs to
            props.eventSelection.setSelection(event.item);

            // ✅ Store updated values in widget attributes
            props.newEventResourceId.setValue(event.item.id);
            props.newEventStart.setValue(new Date(newStart));
            props.newEventEnd.setValue(new Date(event.end));

            // ✅ Trigger Mendix microflow/nanoflow
            if (props.onResizeUpdate?.canExecute) {
                props.onResizeUpdate.execute();
            }

            setUpdateFlag(f => f + 1);
        } catch (e) {
            console.error("updateEventStart error:", e);
        }
    };

    // 🔹 Called when user resizes the end of an event
    const updateEventEnd = (_schedulerData: SchedulerData<EventItem>, event: any, newEnd: string) => {
        try {
            console.log("resizeEnded:", newEnd, event);

            // ✅ Tell Mendix which object this resize belongs to
            props.eventSelection.setSelection(event.item);

            // ✅ Store updated values in widget attributes
            props.newEventResourceId.setValue(event.item.id);
            props.newEventStart.setValue(new Date(event.start));
            props.newEventEnd.setValue(new Date(newEnd));

            // ✅ Trigger Mendix microflow/nanoflow
            if (props.onResizeUpdate?.canExecute) {
                props.onResizeUpdate.execute();
            }

            setUpdateFlag(f => f + 1);
        } catch (e) {
            console.error("updateEventEnd error:", e);
        }
    };

    // Render the planner and scheduler
    return (
        <div className="react-planner" ref={plannerRef} >
            {/* <DndProvider backend={HTML5Backend}> */}
            <Scheduler
                schedulerData={schedulerData}
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
                toggleExpandFunc={(_schedulerData: SchedulerData<EventItem>, slotId: string) => {
                    schedulerData.toggleExpandStatus(slotId);
                    setUpdateFlag(f => f + 1);
                }}
                moveEvent={moveEvent}
                updateEventStart={updateEventStart}
                updateEventEnd={updateEventEnd}
            />
            {/* </DndProvider> */}
        </div>
    );
}

export default ReactPlanner;
