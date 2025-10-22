/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { CellUnit, ViewType } from '../config/default';

const HeaderView = ({ schedulerData, nonAgendaCellHeaderTemplateResolver }) => {
  const { headers, cellUnit, config, localeDayjs, viewType } = schedulerData;
  const headerHeight = schedulerData.getTableHeaderHeight();
  const cellWidth = schedulerData.getContentCellWidth();
  const minuteStepsInHour = schedulerData.getMinuteStepsInHour();
  const shiftCount = config.shiftCount;
  const fontSize = 12;

  let headerList = [];
  let style;

  if (cellUnit === CellUnit.Hour) {
    headers.forEach((item, index) => {
      if (index % minuteStepsInHour === 0) {
        const datetime = localeDayjs(new Date(item.time));

        style = item.nonWorkingTime
          ? {
            width: cellWidth * minuteStepsInHour,
            color: config.nonWorkingTimeHeadColor,
            backgroundColor: config.nonWorkingTimeHeadBgColor,
          }
          : {
            width: cellWidth * minuteStepsInHour,
          };

        if (index === headers.length - minuteStepsInHour) {
          style = item.nonWorkingTime
            ? {
              color: config.nonWorkingTimeHeadColor,
              backgroundColor: config.nonWorkingTimeHeadBgColor,
            }
            : {};
        }

        const pFormattedList = config.nonAgendaDayCellHeaderFormat
          .split('|')
          .map((pitem) => datetime.format(pitem));
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
            <th
              key={`header-${item.time}`}
              className="header3-text"
              style={style}>
              {pList}
            </th>
          );
        }
        headerList.push(element);
      }
    });
  } else {
    headerList = headers.map((item, index) => {
      const datetime = localeDayjs(new Date(item.time));
      style = item.nonWorkingTime
        ? {
          width: cellWidth,
          color: config.nonWorkingTimeHeadColor,
          backgroundColor: config.nonWorkingTimeHeadBgColor,
        }
        : { width: cellWidth };
      if (index === headers.length - 1)
        style = item.nonWorkingTime
          ? {
            color: config.nonWorkingTimeHeadColor,
            backgroundColor: config.nonWorkingTimeHeadBgColor,
          }
          : {};
      const cellFormat =
        cellUnit === CellUnit.Week
          ? config.nonAgendaWeekCellHeaderFormat
          : cellUnit === CellUnit.Month
            ? config.nonAgendaMonthCellHeaderFormat
            : cellUnit === CellUnit.Year
              ? config.nonAgendaYearCellHeaderFormat
              : config.nonAgendaOtherCellHeaderFormat;
      const pFormattedList = cellFormat
        .split('|')
        .map((dateFormatPart) => datetime.format(dateFormatPart));

      if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
        return nonAgendaCellHeaderTemplateResolver(
          schedulerData,
          item,
          pFormattedList,
          style
        );
      }

      const pList = pFormattedList.map((formattedItem, pIndex) => (
        <div key={pIndex}>{formattedItem}</div>
      ));

      return (
        <th key={`header-${item.time}`} className="header3-text" style={style}>{pList}</th>
      );
    });
  }

  let shiftList = [];

  if (viewType === ViewType.Week) {
    headers.forEach((_, index) => {
      const shifts = Array.from({ length: shiftCount }, (_, index) => `Shift ${index + 1}`);
      shifts.forEach((shiftName, shiftIndex) => {
        shiftList.push(<td key={`shift-${index}-${shiftIndex}`} style={{ width: 40, fontSize: fontSize }}> {shiftName}</td>
        );
      });
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
          monthName: localeDayjs(date).format('MMMM YYYY'),
          count: 0,
          year: year,
          monthIndex: monthIndex,
        };
      }
      monthMap[key].count += 1;
    });

    const monthHeaders = Object.values(monthMap).map((month, index) => (
      <td key={`month-${index}`} colSpan={month.count} style={{ textAlign: 'center' }}>
        {month.monthName}
      </td>
    ));

    return monthHeaders;
  };

  return (
    <thead>
      {headers.length > 0 &&
        (() => {
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
              const colspan = viewType == ViewType.Week ? shiftCount * headers.length : group.length;
              return (
                <td key={`week-${weekKey}`} colSpan={colspan}> Week {weekNumber}</td>
              );
            });

          const shiftLabels = Array.from({ length: shiftCount }, (_, shiftIndex) => (
            <td key={`shift-label-${shiftIndex}`} colSpan={24 / shiftCount} style={{ textAlign: 'center' }}>
              Shift {shiftIndex + 1}
            </td>
          ));

          return (<>
            {(viewType === ViewType.Month || viewType === ViewType.Quarter || viewType === ViewType.Year) && (
              <tr style={{ height: 40 }}>{generateMonthHeaders()}</tr>
            )}
            <tr style={{ height: 40 }}>{weekNumberRow}</tr>
            {viewType === ViewType.Custom && (<tr style={{ height: 40, fontSize: fontSize }}>{shiftLabels}</tr>)}
          </>);
        })()}

      <tr style={{ height: 40 }}>
        {viewType === ViewType.Week ? headers.map((header, index) => (
          <td key={`day-header-${index}`} colSpan={shiftCount} style={{ textAlign: 'center', fontSize: fontSize }} > {localeDayjs(new Date(header.time)).format('ddd, MM/D')} </td>
        )) : headerList}
      </tr>
      {viewType === ViewType.Week && <tr style={{ height: 40 }}>{shiftList}</tr>}
    </thead>
  );
};

HeaderView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  nonAgendaCellHeaderTemplateResolver: PropTypes.func,
};

export default HeaderView;
