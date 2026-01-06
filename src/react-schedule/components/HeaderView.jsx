/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
import React, { createElement,useEffect } from 'react';
import PropTypes from 'prop-types';
import { CellUnit, ViewType } from '../config/default';

const getViewCssClass = (viewType) => {
  switch (viewType) {
    case ViewType.Day:
      return 'view-day';
    case ViewType.Week:
      return 'view-week';
    case ViewType.Month:
      return 'view-month';
    case ViewType.Quarter:
      return 'view-quarter';
    case ViewType.Year:
      return 'view-year';
    case ViewType.Custom:
      return 'view-day';
    case ViewType.Custom1:
      return 'view-month';
    default:
      return 'default-section';
  }
};

const getShiftTimeLabel = (obj) => {
  let timeLabel = '';

  const { start, end } = obj;

  if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
    return timeLabel;
  }

  // Parse hours safely
  const startHour = parseInt(start.split(':')[0], 10);
  const endHour = parseInt(end.split(':')[0], 10);

  if (isNaN(startHour) || isNaN(endHour)) {
    return timeLabel;
  }

  // Convert to 12-hour format with am/pm
  const formatTime = (hour) => {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${adjustedHour}${suffix}`;
  };

  return `(${formatTime(startHour)}-${formatTime(endHour)})`;
};

const HeaderView = ({ schedulerData, nonAgendaCellHeaderTemplateResolver }) => {
  const { headers, cellUnit, config, localeDayjs, viewType } = schedulerData;
  let cellWidth = schedulerData.getUpdatedContentCellWidth();
  const minuteStepsInHour = schedulerData.getMinuteStepsInHour();
  const fontSize = 12;
  const weekDayCount = config.displayWeekend ? 7 : 5;
  const shiftSlots = config.shiftSlots;

  useEffect(() => {
    cellWidth = schedulerData.getUpdatedContentCellWidth();
  }, [schedulerData])

  const shiftColors = {
    0: config.shiftOneBgColor,
    1: config.shiftTwoBgColor,
    2: config.shiftThirdBgColor,
    3: config.noShiftColor,
  };

  let headerList = [];
  let style;

  const totalObjects = headers.length;
  const objectsPerShift = Math.ceil(totalObjects / 3); // forSH

  if (cellUnit === CellUnit.Hour) {

    headers.forEach((item, index) => {
      item.shiftIndex = Math.floor(index / objectsPerShift);

      const currentShift = shiftSlots[item.shiftIndex];
      const isNoShift = !currentShift?.name || currentShift.name.trim() === '';

      if (index % minuteStepsInHour === 0) {
        const datetime = localeDayjs(new Date(item.time));

        const backgroundColor = isNoShift
          ? config.noShiftColor
          : shiftColors[item.shiftIndex] || config.defaultShiftColor;

        style = item.nonWorkingTime
          ? {
            width: cellWidth * minuteStepsInHour,
            color: config.nonWorkingTimeHeadColor,
            backgroundColor: config.nonWorkingTimeHeadBgColor,
          }
          : {
            width: cellWidth * minuteStepsInHour,
            backgroundColor
          };

        if (index === headers.length - minuteStepsInHour) {
          style = item.nonWorkingTime
            ? {
              color: config.nonWorkingTimeHeadColor,
              backgroundColor: config.nonWorkingTimeHeadBgColor,
            } : { backgroundColor };
        }

        const pFormattedList = config.nonAgendaDayCellHeaderFormat.split('|').map((pitem) => datetime.format(pitem));

        let element;

        if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
          element = nonAgendaCellHeaderTemplateResolver(
            schedulerData,
            item,
            pFormattedList,
            style
          );
        } else {
          const pList = pFormattedList.map((formattedItem, pIndex) => (
            <div key={pIndex}>{formattedItem}</div>
          ));

          element = (
            <td
              key={`header-${item.time}`}
              className={`hour-header-section view-day ${getViewCssClass(viewType)}`}
              style={{ ...style, width: cellWidth }}
            >
              {pList}
            </td>
          );
        }
        headerList.push(element);
      }
    });
  } else {
    headerList = headers.map((item, index) => {
      const datetime = localeDayjs(new Date(item.time));

      let backgroundColor = item.isShift
        ? shiftColors[item.shiftIndex] || config.defaultShiftColor : config.noShiftColor;

      if (item.nonWorkingTime) {
        style = {
          width: cellWidth,
          color: config.nonWorkingTimeHeadColor,
          backgroundColor: config.nonWorkingTimeHeadBgColor,
        };
      } else if (viewType === ViewType.Week) {
        style = { backgroundColor };
      } else {
        style = { width: cellWidth, backgroundColor: '#F9FAFB' };
      }

      if (index === headers.length - 1 && viewType !== ViewType.Week) {
        style = item.nonWorkingTime ? {
          width: cellWidth,
          color: config.nonWorkingTimeHeadColor,
          backgroundColor: config.nonWorkingTimeHeadBgColor,
        } : { width: cellWidth, backgroundColor: '#F9FAFB' };
      }
      const cellFormat =
        cellUnit === CellUnit.Week
          ? config.nonAgendaWeekCellHeaderFormat
          : cellUnit === CellUnit.Month
            ? config.nonAgendaMonthCellHeaderFormat
            : cellUnit === CellUnit.Year
              ? config.nonAgendaYearCellHeaderFormat
              : config.nonAgendaOtherCellHeaderFormat;
      const pFormattedList = cellFormat.split('|').map((dateFormatPart) => datetime.format('MMM D, ddd'));
      if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
        return nonAgendaCellHeaderTemplateResolver(
          schedulerData,
          item,
          pFormattedList,
          style
        );
      }

      let pList;
      if (viewType === ViewType.Week) {
        const shiftTimeLabel = getShiftTimeLabel(item.shift);
        pList = <div style={{ display: 'flex', flexDirection: 'column' }} key={index}><span className='shift-name'>{item.shift.name}</span><span className='shift-times'>{shiftTimeLabel}</span> </div>
      } else {
        pList = pFormattedList.map((formattedItem, pIndex) => {
          const parts = formattedItem.split(',');
          const [date, shift] = parts.map(part => part.trim());
          return (
            <div className={`month-shifts-date ${getViewCssClass(viewType)}`} key={pIndex}>
              <span className='month-text'>{date}</span>
              <span className='day-text'>{shift}</span>
            </div>
          );
        });
      }
      const headerKey = item.id ? `header-${item.id}` : `header-${item.time}-${index}`;
      return (
        <td key={headerKey} className={`shift-header-section ${getViewCssClass(viewType)}`} style={{
          ...style, width: cellWidth
        }}>{pList}</td>
      );
    });
  }

  const generateMonthHeaders = () => {
    if (headers.length === 0) return null;

    const headerDates = headers.map(header => new Date(header.time));
    const monthMap = {};
    headerDates.forEach(date => {
      const year = localeDayjs(date).year();
      const monthIndex = localeDayjs(date).month();
      const key = `${year}-${monthIndex}`;
      if (!monthMap[key]) {
        monthMap[key] = {
          monthName: localeDayjs(date).format('MMMM'),
          count: 0,
          year: year,
          monthIndex: monthIndex,
        };
      }
      monthMap[key].count += 1;
    });

    const monthHeaders = Object.values(monthMap).map((month, index) => (
      <td key={`month-${index}`} className={`month-header-new ${getViewCssClass(viewType)}`} colSpan={month.count}
        style={{ textAlign: 'center', width: cellWidth * month.count }}>
        {month.monthName}
      </td>
    ));

    return monthHeaders;
  };

  const generateYearHeaders = () => {
    if (headers.length === 0) return null;

    const headerDates = headers.map(header => new Date(header.time));
    const yearMap = {};

    headerDates.forEach(date => {
      const year = localeDayjs(date).year();
      if (!yearMap[year]) {
        yearMap[year] = {
          year: year,
          count: 0,
        };
      }
      yearMap[year].count += 1;
    });

    const yearHeaders = Object.values(yearMap).map((yearItem, index) => (
      <td key={`year-${index}`} className={`year-header ${getViewCssClass(viewType)}`} colSpan={yearItem.count}
        style={{ textAlign: 'center', width: cellWidth * yearItem.count }}>
        {yearItem.year}
      </td>
    ));

    return <tr style={{ height: 40, fontSize: fontSize }}>{yearHeaders}</tr>;
  };

  const startDate = new Date(headers[0].time);

  const weekDates = Array.from({ length: weekDayCount }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  const formattedWeekDates = weekDates.map(date => localeDayjs(date).format('MMM D, ddd'));

  const getWeekLabel = (weekKey, dates, viewType, colspan) => {
    if (!Array.isArray(dates) || dates.length === 0) return '';

    const weekNumber = weekKey?.split('-')[1]?.replace('W', '') || '';

    switch (viewType) {
      case ViewType.Custom: {
        // Show single date in format: Mon, Jan 1
        const startDate = localeDayjs(dates[0].time).format('ddd, MMM D');
        return startDate;
      }

      case ViewType.Quarter:
      case ViewType.Year: {
        // Only show week number
        return `Week ${weekNumber}`;
      }

      default: {
        // Show full range: Week 47 (03 Nov - 07 Nov)
        const startDate = localeDayjs(dates[0].time).format('DD MMM');
        const endDate = localeDayjs(dates[dates.length - 1].time).format('DD MMM');
        if (colspan < 4) {
          return '';
        }
        return `Week ${weekNumber} (${startDate} - ${endDate})`;
      }
    }
  };

  return (
    <thead>
      {(viewType === ViewType.Quarter || viewType === ViewType.Year) && generateYearHeaders()}

      {headers.length > 0 && (() => {
        const getWeekKey = (time) => {
          const d = localeDayjs(new Date(time));
          return `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, '0')}`;
        };

        const weekGroups = {};
        headers.forEach((header) => {
          const weekKey = getWeekKey(header.time);
          if (!weekGroups[weekKey]) {
            weekGroups[weekKey] = [];
          }
          weekGroups[weekKey].push(header);
        });

        const weekNumberRow = Object.entries(weekGroups).map(
          ([weekKey, group]) => {

            const colspan = viewType == ViewType.Week ? headers.length : group.length;
            const weekNumber = getWeekLabel(weekKey, group, viewType, colspan);
            return (
              <td key={`week-${weekKey}`} colSpan={colspan} style={{ width: cellWidth * colspan }} className={`week-header-section ${getViewCssClass(viewType)}`}>{weekNumber}</td>
            );
          });

        const shiftLabels = shiftSlots.map((shift, shiftIndex) => {
          const shiftTimetext = getShiftTimeLabel(shift);
          return (
            <td key={`shift-label-${shiftIndex}`} style={{ backgroundColor: shift.name.trim() === '' ? shiftColors[3] : shiftColors[shiftIndex] }} colSpan={objectsPerShift} align="center" className={`${getViewCssClass(viewType)}`}>
              <span className='shift-name'>{shift.name || ''} </span> <span className='shift-times'>{shiftTimetext} </span>
            </td>
          )
        });
        return (<>
          {(viewType === ViewType.Custom1 || viewType === ViewType.Month || viewType === ViewType.Quarter || viewType === ViewType.Year) && (
            <tr style={{ height: 40, fontSize: fontSize }}>{generateMonthHeaders()}</tr>)}

          <tr style={{ height: 40, fontSize: fontSize }}>{weekNumberRow}</tr>

          {viewType === ViewType.Custom && (<tr style={{ height: 40, fontSize: fontSize }}>{shiftLabels}</tr>)}
        </>);
      })()}

      {viewType === ViewType.Week && <tr style={{ height: 40 }}>
        {formattedWeekDates.map((dateStr, index) => (
          <td key={`day-header-${index}`} colSpan={3} style={{ textAlign: 'center', fontSize: fontSize }} className={`date-header-section ${getViewCssClass(viewType)}`}>{dateStr}</td>
        ))}
      </tr>}

      {(viewType !== ViewType.Quarter || viewType !== ViewType.Year) && <tr style={{ height: 40 }}>{headerList}</tr>}
    </thead>
  );
};

HeaderView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  nonAgendaCellHeaderTemplateResolver: PropTypes.func,
};

export default HeaderView;
