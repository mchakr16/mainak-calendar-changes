import { Col, Row } from 'antd';
import { useEffect, useReducer, useState, useRef } from 'react';
import { Scheduler, SchedulerData, ViewType, DATE_FORMAT, DnDSource, CellUnit } from './react-schedule/index';
import TaskItem from './TaskItem';
import TaskList from './TaskList';
import dayjs from 'dayjs';
import DemoData from './sample';
import './react-schedule/css/style.css'
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { getDateLabel } from './react-schedule/helper/behaviors';
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

    const dayStartFrom = 7; // update dayStartFrom props

    useEffect(() => {
        schedulerData = new SchedulerData(
            dayjs().format(DATE_FORMAT),
            ViewType.Week,
            false,
            false,
            {
                schedulerWidth: '85%',
                minuteStep: 60,
                dayResourceTableWidth: 150,
                weekResourceTableWidth: 160,
                customResourceTableWidth: 150,
                tableHeaderHeight: 120,
                eventItemHeight: 36,
                eventItemLineHeight: 38,
                nonAgendaSlotMinHeight: 50,
                customCellWidth: 35,
                displayWeekend: true,
                shiftCount: 3,
                shiftSlots: [
                    { start: '06:00', end: '14:00' },
                    { start: '14:00', end: '22:00' },
                    { start: '22:00', end: '06:00' },
                ],
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
                    const endDate = startDate.add(24, 'hour');

                    return {
                        startDate,
                        endDate,
                        cellUnit: CellUnit.Hour,
                    };
                },
                getDateLabelFunc: getDateLabel,
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
            )
        );
        return () => {
            schedulerData = null;
        };
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

    const onToggleChange = (schedulerData, e) => {
        schedulerData.config.displayWeekend = !schedulerData.config.displayWeekend;
        schedulerData.setViewAfterSettingsUpdate();
        //schedulerData.setEvents(DemoData.eventsForTaskView);
        dispatch({ type: 'UPDATE_SCHEDULER', payload: schedulerData });
    };

    const onShiftCountChange = (schedulerData, e) => {
        schedulerData.config.shiftCount = e;
        if (e === 2) {
            schedulerData.config.shiftSlots = [
                    { start: '06:00', end: '18:00' },
                    { start: '18:00', end: '06:00' },
                ];
        } else {
            if (e === 3) {
            schedulerData.config.shiftSlots = [
                    { start: '06:00', end: '14:00' },
                    { start: '14:00', end: '22:00' },
                    { start: '22:00', end: '06:00' },
                ];
        }
        }
        schedulerData.setViewAfterSettingsUpdate();
        //schedulerData.setEvents(DemoData.eventsForTaskView);
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
                            onToggleChange={onToggleChange}
                            onShiftCountChange={onShiftCountChange}
                            eventItemClick={eventClicked}
                            updateEventStart={updateEventStart}
                            updateEventEnd={updateEventEnd}
                            moveEvent={moveEvent}
                            newEvent={newEvent}
                            subtitleGetter={subtitleGetter}
                            dndSources={[taskDndSource]}
                            toggleExpandFunc={toggleExpandFunc}
                        />
                    </Col>
                    <Col style={{ width: '15%', marginTop: '5%' }}>
                        <TaskList
                            schedulerData={state.viewModel}
                            newEvent={newEvent}
                            taskDndSource={taskDndSource}
                        />
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default NewApp;
