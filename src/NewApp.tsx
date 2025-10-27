import { Col, Row } from 'antd';
import { useEffect, useReducer, useState, useRef } from 'react';
import { Scheduler, SchedulerData, ViewType, DATE_FORMAT, DnDSource, CellUnit } from './react-schedule/index';
import TaskItem from './TaskItem';
// import TaskList from './TaskList';
import dayjs from 'dayjs';
import DemoData from './sample';
import './react-schedule/css/style.css'
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/en-gb';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isLeapYear);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('en-gb');
dayjs.extend(isoWeek);

export const DnDTypes = { TASK: 'task' };

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

const NewApp = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [taskDndSource, setTaskDndSource] = useState(() =>
        new DnDSource(
            (props) => (props as any).task,
            TaskItem as any,
            true,
            DnDTypes.TASK
        ));

    const plannerRef = useRef<HTMLDivElement>(null);

    const savedDate = sessionStorage.getItem('selectedSchedulerDate');
    const initialDate = savedDate || dayjs().format(DATE_FORMAT);

    const dayStartFrom = 6; // update dayStartFrom props
    const SHIFT_COUNT = 3; // update shift count
    const generatedSlots = generateShiftSlots(SHIFT_COUNT, dayStartFrom);

    useEffect(() => {
        schedulerData = new SchedulerData(initialDate, ViewType.Week,
            false,
            false,
            {
                schedulerWidth: '85%',
                minuteStep: 60,
                schedulerMaxHeight:400,
                dayResourceTableWidth: 150,
                weekResourceTableWidth: 160,
                customResourceTableWidth: 150,
                tableHeaderHeight: 120,
                eventItemHeight: 36,
                eventItemLineHeight: 38,
                nonAgendaSlotMinHeight: 50,
                displayWeekend: false,
                customCellWidth: 35,
                weekCellWidth: '12%',
                monthCellWidth: 40,
                quarterCellWidth: 75,
                defaultExpanded: false,
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
                    const startDate = dayjs(baseDate)
                        .hour(Number(dayStartFrom))
                        .minute(0)
                        .second(0);
                    const endDate = startDate.add(23, 'hour');

                    return { startDate, endDate, cellUnit: CellUnit.Hour };
                },
            }
        );

        schedulerData.localeDayjs.locale('en-gb');
        schedulerData.setResources(DemoData.resources);
        schedulerData.setEvents(DemoData.eventsForTaskView);

        dispatch({ type: 'INITIALIZE', payload: schedulerData });

        setTaskDndSource(
            new DnDSource(
                (props) => (props as any).task,
                TaskItem as any,
                true,
                DnDTypes.TASK
            ));
        return () => { schedulerData = null; };
    }, []);

    const prevClick = (schedulerData) => {
        schedulerData.prev();
        schedulerData.setEvents(DemoData.eventsForTaskView);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const nextClick = (schedulerData) => {
        schedulerData.next();
        schedulerData.setEvents(DemoData.eventsForTaskView);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const onViewChange = (schedulerData, view) => {
        schedulerData.setViewType(
            view.viewType,
            view.showAgenda,
            view.isEventPerspective
        );
        schedulerData.config.creatable = !view.isEventPerspective;
        schedulerData.setEvents(DemoData.eventsForTaskView);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const onSelectDate = (schedulerData, date) => {
        schedulerData.setDate(date);
        sessionStorage.setItem('selectedSchedulerDate', date);
        schedulerData.setEvents(DemoData.eventsForTaskView);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const eventClicked = (_schedulerData, event) => {
        alert(
            `You just clicked an event: {id: ${event.id}, title: ${event.title}}`
        );
    };

    const newEvent = (schedulerData, slotId, _slotName, start, end, type, item) => {
        let newFreshId = 0;
        schedulerData.events.forEach((item) => {
            if (item.id >= newFreshId) newFreshId = item.id + 1;
        });

        let newEvent = {
            id: newFreshId,
            title: 'New event you just created',
            start,
            end,
            resourceId: slotId,
            bgColor: 'purple',
        };

        if (type === DnDTypes.TASK) {
            newEvent = {
                ...newEvent,
                groupId: item.id,
                groupName: item.name,
            } as any;
        }

        schedulerData.addEvent(newEvent);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const updateEventStart = (schedulerData, event, newStart) => {
        schedulerData.updateEventStart(event, newStart);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const updateEventEnd = (schedulerData, event, newEnd) => {
        schedulerData.updateEventEnd(event, newEnd);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
        schedulerData.moveEvent(event, slotId, slotName, start, end);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const subtitleGetter = (schedulerData, event) =>
        schedulerData.isEventPerspective
            ? schedulerData.getResourceById(event.resourceId).name
            : event.groupName;

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
        schedulerData.config.shiftCount = shiftCount;
        schedulerData.config.shiftSlots = generateShiftSlots(shiftCount, dayStartFrom);
        schedulerData.setViewAfterSettingsUpdate();
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    return (
        <div ref={plannerRef}>
            {state.showScheduler && (
                <Row>
                    <Col style={{ width: '85%' }}>
                        <Scheduler
                            schedulerData={state.viewModel}
                            prevClick={prevClick}
                            nextClick={nextClick}
                            onSelectDate={onSelectDate}
                            onViewChange={onViewChange}
                            eventItemClick={eventClicked}
                            updateEventStart={updateEventStart}
                            updateEventEnd={updateEventEnd}
                            moveEvent={moveEvent}
                            newEvent={newEvent}
                            subtitleGetter={subtitleGetter}
                            dndSources={[taskDndSource]}
                            toggleExpandFunc={toggleExpandFunc}
                            onToggleChange={onToggleChange}
                            onShiftCountChange={onShiftCountChange}
                        />
                    </Col>
                    {/* <Col style={{ width: '15%', marginTop: '5%' }}>
                        <TaskList
                            schedulerData={state.viewModel}
                            newEvent={newEvent}
                            taskDndSource={taskDndSource}
                        />
                    </Col> */}
                </Row>
            )}
        </div>
    );
};

export default NewApp;
