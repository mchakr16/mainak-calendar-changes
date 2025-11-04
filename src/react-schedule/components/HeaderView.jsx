/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
import React, { createElement } from 'react';
import PropTypes from 'prop-types';
import { CellUnit, ViewType } from '../config/default';

const HeaderView = ({ schedulerData, nonAgendaCellHeaderTemplateResolver }) => {
  const { headers, cellUnit, config, localeDayjs, viewType } = schedulerData;
  // const headerHeight = schedulerData.getTableHeaderHeight();
  const cellWidth = schedulerData.getContentCellWidth();
  const minuteStepsInHour = schedulerData.getMinuteStepsInHour();
  // const shiftCount = config.shiftCount;
  const fontSize = 12;
  const weekDayCount = config.displayWeekend ? 7 : 5;
  const shiftSlots = config.shiftSlots;

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
      const isNoShift = !currentShift?.label || currentShift.label.trim() === '';

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
              className="header3-text"
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
        style = { width: cellWidth };
      }

      if (index === headers.length - 1 && viewType !== ViewType.Week) {
        style = item.nonWorkingTime
          ? {
            width: cellWidth,
            color: config.nonWorkingTimeHeadColor,
            backgroundColor: config.nonWorkingTimeHeadBgColor,
          } : { width: cellWidth };
      }
      const cellFormat =
        cellUnit === CellUnit.Week
          ? config.nonAgendaWeekCellHeaderFormat
          : cellUnit === CellUnit.Month
            ? config.nonAgendaMonthCellHeaderFormat
            : cellUnit === CellUnit.Year
              ? config.nonAgendaYearCellHeaderFormat
              : config.nonAgendaOtherCellHeaderFormat;
      const pFormattedList = cellFormat.split('|').map((dateFormatPart) => datetime.format(dateFormatPart));

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
        pList = <div key={index}>{item.shift.label}</div>
      } else {
        pList = pFormattedList.map((formattedItem, pIndex) => (
          <div key={pIndex}>{formattedItem}</div>
        ));
      }

      const headerKey = item.id ? `header-${item.id}` : `header-${item.time}-${index}`;
      return (
        <td key={headerKey} className="header3-text" style={{
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
      <td key={`month-${index}`} colSpan={month.count}
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
      <td key={`year-${index}`} colSpan={yearItem.count}
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

  const formattedWeekDates = weekDates.map(date => localeDayjs(date).format('ddd, MM/D'));

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
            const weekNumber = weekKey.split('-W')[1];
            const colspan = viewType == ViewType.Week ? headers.length : group.length;
            return (
              <td key={`week-${weekKey}`} colSpan={colspan} style={{ width: cellWidth * colspan }}> Week {weekNumber}</td>
            );
          });

        const shiftLabels = shiftSlots.map((shift, shiftIndex) => (
          <td key={`shift-label-${shiftIndex}`} colSpan={objectsPerShift} align="center">
            {shift.label || ''}
          </td>
        ));

        return (<>
          {(viewType === ViewType.Month || viewType === ViewType.Quarter || viewType === ViewType.Year) && (
            <tr style={{ height: 40, fontSize: fontSize }}>{generateMonthHeaders()}</tr>)}

          <tr style={{ height: 40, fontSize: fontSize }}>{weekNumberRow}</tr>

          {viewType === ViewType.Custom && (<tr style={{ height: 40, fontSize: fontSize }}>{shiftLabels}</tr>)}
        </>);
      })()}

      {viewType === ViewType.Week && <tr style={{ height: 40 }}>
        {formattedWeekDates.map((dateStr, index) => (
          <td key={`day-header-${index}`} colSpan={3} style={{ textAlign: 'center', fontSize: fontSize }}>{dateStr}</td>
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
