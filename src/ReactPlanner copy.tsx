import { Col, Row } from 'antd';
import { useEffect, useRef, useState, useReducer } from "react";
import { Scheduler, SchedulerData, ViewType, CellUnit, DATE_FORMAT, IconType } from "./react-schedule";
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
import {
    getResourcesBasedOnMultiSelection, transformResourceDataTreeStucture, formatShiftSlots, setActiveView, getExpandCollapseState
} from './utility';

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

const defaultEventColor = "#ccc";

const viewTypes = ["Day", "Week", "Month", "Quarter", "Year"];

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

let schedulerData: any;

const ReactPlanner = (props: any) => {
    // Early return if viewStart or viewEnd are not available
    // if (props && props.viewStart && props.viewEnd && props.viewStart.status !== ValueStatus.Available && props.viewEnd.status !== ValueStatus.Available) {
    //   return <div />;
    // }

    // State and refs for events, resources, update flag, planner width, and resize timeout
    const [events, setEvents] = useState<EventItem[]>(eventList);

    const plannerRef = useRef<HTMLDivElement>(null);
    const [resourceInit, setResourcesInit] = useState<any[]>([]);
    const [state, dispatch] = useReducer(reducer, initialState);
    const dayStartFrom = props.dayStartFrom || 6; // update dayStartFrom props
    const SHIFT_COUNT = 3; // update shift count
    // const generatedSlots = generateShiftSlots(SHIFT_COUNT, dayStartFrom);
    const mxShift = [
        {
            "ShiftId": 5,
            "Name": "Early Shift",
            "StartTime": "2025-10-10T06:00:00.000Z",
            "EndTime": "2025-10-10T14:00:00.000Z",
            "changedDate": "2025-10-10T04:53:44.298Z",
            "createdDate": "2025-10-10T04:53:17.797Z"
        },
        {
            "ShiftId": 6,
            "Name": "Mid Shift",
            "StartTime": "2025-10-10T14:00:00.000Z",
            "EndTime": "2025-10-10T22:00:00.000Z",
            "changedDate": "2025-10-10T04:54:32.519Z",
            "createdDate": "2025-10-10T04:54:06.204Z"
        },
        {
            "ShiftId": 7,
            "Name": "Late Shift",
            "StartTime": "2025-10-10T22:00:00.000Z",
            "EndTime": "2025-10-11T06:00:00.000Z",
            "changedDate": "2025-10-10T04:54:32.519Z",
            "createdDate": "2025-10-10T04:54:06.204Z"
        }
    ];

    const [_selectedEvent, setSelectedEvent] = useState<any>(null);;

    const initialDate = dayjs().format(DATE_FORMAT);
    const schedulerDataRef = useRef(null);
    const scheduleType = 'Schedule';

    //for default view

    const defaultsRef = useRef<any>(null);

    // const propsDefaultView = props.propsDefault;

    const propsDefaultView = {
        Day: false, defaultDay: dayjs().format(DATE_FORMAT),
        Week: false, defaultWeek: dayjs().format(DATE_FORMAT),
        Month: false, defaultMonth: dayjs().format(DATE_FORMAT),
        Quarter: false, defaultQuarter: dayjs().format(DATE_FORMAT),
        Year: false, defaultYear: dayjs().format(DATE_FORMAT),
    }

    const initDefaultsIfNeeded = () => {
        if (!defaultsRef.current) {
            const today = dayjs().format(DATE_FORMAT);
            defaultsRef.current = propsDefaultView || {
                Day: false, defaultDay: today,
                Week: false, defaultWeek: today,
                Month: false, defaultMonth: today,
                Quarter: false, defaultQuarter: today,
                Year: false, defaultYear: today,
            };
        }
    };

    // const viewMap = {
    //     [ViewType.Custom]: 'Day',
    //     [ViewType.Week]: 'Week',
    //     [ViewType.Month]: 'Month',
    //     [ViewType.Quarter]: 'Quarter',
    //     [ViewType.Year]: 'Year'
    // };

    const viewMap = {
        [ViewType.Custom]: { flag: 'Day', dateKey: 'defaultDay' },
        [ViewType.Week]: { flag: 'Week', dateKey: 'defaultWeek' },
        [ViewType.Month]: { flag: 'Month', dateKey: 'defaultMonth' },
        [ViewType.Quarter]: { flag: 'Quarter', dateKey: 'defaultQuarter' },
        [ViewType.Year]: { flag: 'Year', dateKey: 'defaultYear' },
    }

    const getValueFromMicroFlow = (schedulerData) => {
        try {
            // const returnedValue = await callMendixMicroflow("ShopFloor.GET_Default_View_ScheduleType");
            // console.log(returnedValue);
            const returnedValue: any = '[{"DefaultSchedulerView":"Day2093.7746689254721","SchedulerType":"Schedule347.62244823325616"},{"DefaultSchedulerView":"Day1427.0466862602205","SchedulerType":"Schedule434.25185377619646"},{"DefaultSchedulerView":"Day3653.519917833774","SchedulerType":"Schedule811.1694724477561"},{"DefaultSchedulerView":"Month","SchedulerType":"Schedule"}]';
            const formattedReturnValue = returnedValue.replace(/,(\s*])/g, '$1');
            const match = JSON.parse(formattedReturnValue).find(v => typeof v.SchedulerType === "string" && v.SchedulerType === scheduleType);
            const view = match ? match.DefaultSchedulerView : 'Month';
            console.log(view);
            updateViewStartEnd(schedulerData);
            return match;
        } catch (error) {
            console.warn('Failed to apply scheduler date from microflow', error);
        }
    }

    useEffect(() => {
        initDefaultsIfNeeded();
        const showWeekend = !!props.showWeekends;
        const pdfPrintFlag = false;
        const initializeScheduler = async () => {
            schedulerData = new SchedulerData(initialDate, ViewType.Month, false, false,
                {
                    schedulerWidth: '95%',
                    minuteStep: 60,
                    resourceTableWidth: 160,
                    schedulerMaxHeight: pdfPrintFlag ? 'auto' : Math.round(window.innerHeight * 0.75),
                    schedulerContentHeight: pdfPrintFlag ? 'auto' : Math.round(window.innerHeight * 0.70),
                    headerEnabled: pdfPrintFlag ? false : true,
                    weekResourceTableWidth: 160,
                    customResourceTableWidth: 160,
                    quarterResourceTableWidth: 160,
                    monthResourceTableWidth: 160,
                    tableHeaderHeight: 120,
                    eventItemHeight: 36,
                    eventItemLineHeight: 38,
                    nonAgendaSlotMinHeight: 50,
                    displayWeekend: showWeekend || false,
                    weekCellWidth: showWeekend ? '4.3%' : '6%',
                    monthCellWidth: '3.5%',
                    quarterCellWidth: '5%',
                    yearCellWidth: '5%',
                    customCellWidth: '3.75%',
                    defaultExpanded: true,
                    customNavDirection: '',
                    customCountDays: 1,
                    disabledWeekendOnViewsList: [ViewType.Custom],
                    calenderConfig: {
                        applyButtonText: 'Apply',
                        applyButtonType: 'primary',
                        applyButtonAlignment: 'center',
                    },
                    resourceFilterConfig: {
                        label: 'Resource Name',
                        options: [],
                        visible: pdfPrintFlag ? false : true
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
                        { viewName: 'Custom', viewType: ViewType.Custom1, showAgenda: false, isEventPerspective: false },
                    ],
                    scheduleType: SHIFT_COUNT
                },
                {
                    isNonWorkingTimeFunc: (_schedulerData, time) => {
                        const day = dayjs(time).day();
                        return day === 0 || day === 6;
                    },
                    getCustomDateFunc: (_schedData, num, baseDate) => {

                        const currentViewType = _schedData.viewType;
                        const base = baseDate ? dayjs(baseDate) : (dayjs(_schedData.startDate) || dayjs());

                        console.log("base  ===>", base.toDate());
                        if (currentViewType === ViewType.Custom) {
                            const startDate = dayjs(base).add(num, 'day').hour(Number(dayStartFrom)).minute(0).second(0);
                            const endDate = startDate.add(23, 'hour');
                            return { startDate, endDate, cellUnit: CellUnit.Hour };
                        }
                        // This is custome code for custom month view for day wise increment in month view
                        if (currentViewType === ViewType.Custom1 ) {
                            const showWeekend = schedulerData?.config?.displayWeekend ?? false;

                            
                            const customCountDays = schedulerData?.config?.customCountDays ?? 1;
                            const anchorDay = base.date();
                            const anchorMonth = dayjs(base).startOf('month').add(num, 'month');

                            const clampToMonth = (month, day) => {
                                const dim = month.daysInMonth();
                                const safeDay = Math.min(Math.max(1, day), dim);
                                return month.date(safeDay);
                            };

                            // Helper to move one working day forward/backward (skips Sat/Sun)
                            const shiftToNextWorkingDay = (d, direction) => {
                                // direction: +1 or -1
                                let candidate = d.add(direction, 'day');
                                // while candidate is weekend, move further in the same direction
                                while (candidate.day() === 0 || candidate.day() === 6) {
                                    candidate = candidate.add(direction, 'day');
                                }
                                return candidate;
                            };

                            // decide dayShift based on navigation direction (num < 0 => Prev)
                           // const dayShift = num < 0 ? - customCountDays : customCountDays;

                            const dayShift = schedulerData.config.navDirecgtionClick ===''? 0:  schedulerData.config.navDirecgtionClick === 'right'? 1 : - 1;// num < 0 ? -1 : 1;

                            // compute start anchor (clamped) and then shift by 1 day or to next working day
                            const startAnchor = clampToMonth(anchorMonth, anchorDay).startOf('day');
                            const startDate = showWeekend
                                ? startAnchor.add(dayShift, 'day')
                                : shiftToNextWorkingDay(startAnchor, dayShift).startOf('day');

                            // compute end anchor in next month, then shift similarly and make it endOf('day')
                            const nextMonth = anchorMonth.add(1, 'month');
                            const endAnchor = clampToMonth(nextMonth, anchorDay).endOf('day');
                            const endDate = showWeekend
                                ? endAnchor.add(dayShift, 'day').endOf('day')
                                : shiftToNextWorkingDay(endAnchor, dayShift).endOf('day');

                            return { startDate, endDate, cellUnit: CellUnit.Day };
                        }
                    },
                }
            );

            schedulerData.localeDayjs.locale('en-gb');
            schedulerDataRef.current = schedulerData;
            // console.log(formatShiftSlots(mxShift))
            const defaultValue = await getValueFromMicroFlow(schedulerData);
            defaultsRef.current = setActiveView(defaultsRef.current, defaultValue, viewTypes);
            schedulerData.setViewType(getDefaultView(defaultsRef.current));
            schedulerData.config.setDefaultViewValue = getDefaultViewValue(defaultsRef.current);
            setEvents(props.events);
            schedulerData.setEvents(props.events);
            dispatch({ type: 'INITIALIZE', payload: schedulerData });
        };

        initializeScheduler();
    }, []);


    const getDefaultViewValue = (views) => {
        return viewTypes.some(k => !!views[k]);
    };

    const setDefaultViewValue = (views) => {
        const viewKeys = viewTypes;
        return viewKeys.find(k => Boolean(views[k])) ?? null;
    };
    /**
     * Returns the default view type for the scheduler based on props.
     */
    function getDefaultView(propsDefault) {
        const defaultView = setDefaultViewValue(propsDefault);
        switch (defaultView) {
            case "Day":
                schedulerData.config.defaultExpanded = true;
                return ViewType.Custom;
            case "Week":
                schedulerData.config.defaultExpanded = true;
                return ViewType.Week;
            case "Month":
                schedulerData.config.defaultExpanded = false;
                return ViewType.Month;
            case "Quarter":
                schedulerData.config.defaultExpanded = false;
                return ViewType.Quarter;
            case "Year":
                schedulerData.config.defaultExpanded = false;
                return ViewType.Year;
            default:
                schedulerData.config.defaultExpanded = false;
                return ViewType.Month;
        }
    }
    /**
     * Updates the view start and end dates in the Mendix state.
     */
    const updateViewStartEnd = (schedulerData: SchedulerData) => {
        const start = schedulerData.getViewStartDate();
        const end = schedulerData.getViewEndDate();
        props.viewStartDate?.setValue(start.toDate());
        props.viewEndDate?.setValue(end.toDate());
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
                resizable: Boolean(props.eventResizableAttr.get(item)?.value),
            });
        });
        setEvents(props.events);
        schedulerData.setEvents(props.events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
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
        // setResourcesInit(DemoData.resources);

        const newResourceList: any[] = DemoData.resources?.map((item) => {
            const id = item.id?.toString();
            const name = item.name?.toString();
            const parentId = item.parentId?.toString();
            const hasRealParent = parentId != null && parentId !== '' && parentId !== '0';
            return { id, name, ...(hasRealParent ? { parentId } : {}) };
        }) ?? []

        schedulerData.setResources(newResourceList);
        // Code  added for  Option filter
        setResourcesInit(newResourceList);
        sessionStorage.setItem("selectedResourceType", '');
        schedulerData.config.resourceFilterConfig.options = transformResourceDataTreeStucture(newResourceList);
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
        updateViewStartEnd(schedulerData);
        // props.eventData.reload();
        schedulerData.setEvents(events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    /**
     * Handler for changing the view type (Day, Week, Month, Year) in the scheduler.
     * Updates the view and reloads events.
     */
    const onViewChange = (_schedulerData: SchedulerData, view: any) => {
        _schedulerData.setViewType(view.viewType);
        updateViewStartEnd(_schedulerData);
        _schedulerData.config.defaultExpanded = getExpandCollapseState(view.viewType);

        const propsDefault = defaultsRef.current // propsDefaultView; // need to update based on props
        updateDefaultViewValue(_schedulerData, propsDefault);
        _schedulerData.setEvents(events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: _schedulerData });
    };

    // const updateDefaultViewValue = (_schedulerData, propsDefault) => {
    //     const key = viewMap[_schedulerData.viewType];
    //     const isChecked = Boolean(key && propsDefault?.[key]);
    //     _schedulerData.config = { ..._schedulerData.config, setDefaultViewValue: isChecked };
    // };

    const updateDefaultViewValue = (schedulerData, propsDefault) => {
        const mapping = viewMap[schedulerData.viewType];
        const isChecked = !!(mapping && propsDefault[mapping.flag]);

        if (isChecked) {
            const dateValue = propsDefault[mapping.dateKey];
            if (dateValue != null) schedulerData.setDate(dateValue);
        }
        schedulerData.config = { ...schedulerData.config, setDefaultViewValue: isChecked };
    }

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

        const isActivity = schedulerData.resources.some(resource => resource.id === resourceId && resource.parentId != null);
        if (isActivity)
            props.newEventAction.execute()
    }

    // Show loading state if event or resource data is not available
    // if (!props.eventData || props.eventData.status !== ValueStatus.Available
    //   || !props.resourceData || props.resourceData.status !== ValueStatus.Available) {
    //   return <div />
    // }

    const moveEvent = (schedulerData: SchedulerData, event: EventItem, slotId: string, slotName: string, start: string, end: string) => {
        const customEvent = event as EventItem;
        const item = customEvent.item;

        props.eventSelection.setSelection(item);
        props.newEventResourceId.setValue(slotId);
        props.newEventStart.setValue(new Date(start));
        props.newEventEnd.setValue(new Date(end));

        if (props.onDragUpdate?.canExecute) {
            props.onDragUpdate.execute();
        }
        schedulerData.moveEvent(event, slotId, slotName, start, end);
        schedulerData.setEvents(events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    // 🔹 Called when user resizes the start of an event
    const updateEventStart = (schedulerData: SchedulerData<EventItem>, event: any, newStart: string) => {
        console.log("resizeStarted:", newStart, event);
        // props.eventSelection.setSelection(event.item);
        // props.newEventResourceId.setValue(event.item.id);
        // props.newEventStart.setValue(new Date(newStart));
        // props.newEventEnd.setValue(new Date(event.end));

        // if (props.onResizeUpdate?.canExecute) {
        //     props.onResizeUpdate.execute();
        // }
        schedulerData.updateEventStart(event, newStart);
        schedulerData.setEvents(events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const updateEventEnd = (schedulerData: SchedulerData<EventItem>, event: any, newEnd: string) => {
        console.log("resizeEnded:", newEnd, event);
        // props.eventSelection.setSelection(event.item);
        // props.newEventResourceId.setValue(event.item.id);
        // props.newEventStart.setValue(new Date(event.start));
        // props.newEventEnd.setValue(new Date(newEnd));
        // if (props.onResizeUpdate?.canExecute) {
        //     props.onResizeUpdate.execute();
        // }
        schedulerData.updateEventEnd(event, newEnd);
        schedulerData.setEvents(events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    }

    const toggleExpandFunc = (schedulerData, slotId) => {
        schedulerData.toggleExpandStatus(slotId);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const onToggleChange = (schedulerData) => {
        schedulerData.config.displayWeekend = !schedulerData.config.displayWeekend;
        schedulerData.config.weekCellWidth = schedulerData.config.displayWeekend ? '4.3%' : '6%';
        schedulerData.setViewAfterSettingsUpdate();
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const onDefaultChange = (schedulerData, isChecked) => {
        initDefaultsIfNeeded();
        schedulerData.config = { ...schedulerData.config, setDefaultViewValue: isChecked };
        const { viewType, startDate } = schedulerData;
        const formattedStart = dayjs(startDate).format(DATE_FORMAT);
        const formattedNow = dayjs().format(DATE_FORMAT);

        const mapping = viewMap[viewType];
        if (!mapping) return { ...defaultsRef.current };

        if (isChecked) {
            defaultsRef.current = Object.fromEntries(Object.entries(defaultsRef.current).map(([k, v]) => [k, typeof v === 'boolean' ? false : v]));
            defaultsRef.current[mapping.flag] = isChecked;
            defaultsRef.current[mapping.dateKey] = isChecked ? formattedStart : formattedNow;
        } else {
            defaultsRef.current[mapping.flag] = false;
        }
        const next = { ...defaultsRef.current };
        console.log(next);
        // return next;
    };

    const onShiftCountChange = (schedulerData, shiftCount) => {
        schedulerData.config.shiftCount = Number(shiftCount);
        // schedulerData.config.endHour = (8 * shiftCount) - 1;
        // const behaviors = schedulerData?.behaviors;
        // if (behaviors) {
        // const baseDate = new Date();
        // schedulerData.behaviors.getCustomDateFunc(schedulerData, 0, baseDate);
        // }
        const BASE_SHIFTS = [
            {
                ShiftId: 5,
                Name: "Early Shift",
                StartTime: "2025-10-10T06:00:00.000Z",
                EndTime: "2025-10-10T14:00:00.000Z",
                changedDate: "2025-10-10T04:53:44.298Z",
                createdDate: "2025-10-10T04:53:17.797Z"
            },
            {
                ShiftId: 6,
                Name: "Mid Shift",
                StartTime: "2025-10-10T14:00:00.000Z",
                EndTime: "2025-10-10T22:00:00.000Z",
                changedDate: "2025-10-10T04:54:32.519Z",
                createdDate: "2025-10-10T04:54:06.204Z"
            }
        ];

        const EXTRA_SHIFTS = [
            {
                ShiftId: 7,
                Name: "late Shift",
                StartTime: "2025-10-10T22:00:00.000Z",
                EndTime: "2025-10-11T06:00:00.000Z",
                changedDate: "2025-10-10T04:54:32.519Z",
                createdDate: "2025-10-10T04:54:06.204Z"
            }
        ];

        const shifts = Number(shiftCount) === 2 ? BASE_SHIFTS : [...BASE_SHIFTS, ...EXTRA_SHIFTS];
        schedulerData.config.shiftSlots = formatShiftSlots(shifts);

        schedulerData.behaviors.getCustomDateFunc(schedulerData, 1, null);
        schedulerData.setViewAfterSettingsUpdate();
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });

    };

    const onEventItemDoubleClick = (schedulerData: SchedulerData<EventItem>, event: any) => {
        console.log("double cliked", event, schedulerData, event.id);
    }

    const onEventItemClick = (schedulerData: SchedulerData<EventItem>, event: any) => {
        console.log("clicked", event, schedulerData, event.id);
        setSelectedEvent(event);
    }

    const eventItemIconClick = (schedulerData: SchedulerData<EventItem>, event: any, iconType: any) => {
        console.log('You clciked on event icon==>', iconType) // need to call mendix based on iconType
        // console.log("event data eventItemIconClick", event, schedulerData, event.id, iconType);
        if (iconType === IconType.Constraint) {
            console.log("event data eventItemIconClick", event, schedulerData, event.id, iconType);
            setSelectedEvent(event);
        }
    }

    const onResourceChange = (schedulerData: any, resourceType: any) => {
        let filterData: any[] = [];
        if (resourceType.length === 0) {
            filterData = resourceInit;
        } else {
            const dataTest = getResourcesBasedOnMultiSelection(resourceInit, resourceType);
            filterData = dataTest;
        }
        schedulerData.setResources(filterData);
    }

    // const onScrollRight = (_schedulerData: any) => {
    //     // schedulerData.next();
    //     // updateViewStartEnd(schedulerData);
    //     // schedulerData.setEvents(events);
    //     // dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    // }


    // const customDayChange = (type) => {
    //     schedulerData.update();
    //     schedulerData.setEvents(events);
    //     dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    // }

    const customNavArrowClick = (schedulerData, value) => {
        if (value === 'right') {
            schedulerData.config.customNavDirection = 'right';
          //  customDayChange('right');

        } else {
            schedulerData.config.customNavDirection = 'left';
          //  customDayChange('left');

        }
        schedulerData.update();
        schedulerData.setEvents(events);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
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
                            onDefaultChange={onDefaultChange}
                            onResourceChange={onResourceChange}
                            customNavArrowClick={customNavArrowClick}
                        />
                    </Col>
                </Row>
            )}

        </div>
    );
}

export default ReactPlanner;
