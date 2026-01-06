/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { createElement } from 'react';
import PropTypes from 'prop-types';
import { ViewType } from '../config/default';

function BodyView({ schedulerData }) {
  const { renderData, headers, config, behaviors, viewType } = schedulerData;
  const width = schedulerData.getUpdatedContentCellWidth();
  const shiftSlots = config.shiftSlots;

  const shiftColors = {
    0: config.shiftOneBgColor,
    1: config.shiftTwoBgColor,
    2: config.shiftThirdBgColor,
    3: config.noShiftColor
  };

  const totalObjects = headers.length;
  const objectsPerShift = Math.ceil(totalObjects / 3);

  const tableRows = renderData.filter(o => o.render)
    .map(({ slotId, groupOnly, rowHeight }) => {
      const rowCells = headers.map((header, index) => {
        const key = `${slotId}_${header.time}`;
        const style = { width };
        if (viewType == ViewType.Week) {
          if (header.isShift === false && viewType == ViewType.Week) {
            style.backgroundColor = config.noShiftColor;
          } else {
            style.backgroundColor = shiftColors[header.shiftIndex] || config.noShiftColor;
          }
        }

        const shiftIndex = Math.floor(index / objectsPerShift);
        const currentShift = shiftSlots[shiftIndex];
        const isNoShift = !currentShift?.name || currentShift.name.trim() === '';

        if (viewType === ViewType.Custom) {
          style.backgroundColor = isNoShift ? config.noShiftColor : shiftColors[shiftIndex] || config.defaultShiftColor;
        }
        if (header.nonWorkingTime) {
          style.backgroundColor = config.nonWorkingTimeBodyBgColor;
        }
        if (groupOnly) {
          style.backgroundColor = config.groupOnlySlotColor;
        }
        if (behaviors.getNonAgendaViewBodyCellBgColorFunc) {
          const cellBgColor = behaviors.getNonAgendaViewBodyCellBgColorFunc(schedulerData, slotId, header);
          if (cellBgColor) {
            style.backgroundColor = cellBgColor;
          }
        }
        return (
          <td key={key} style={style}>
            <div />
          </td>
        );
      });

      return (
        <tr key={slotId} style={{ height: rowHeight }}>
          {rowCells}
        </tr>
      );
    });

  return <tbody>{tableRows}</tbody>;
}

BodyView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
};

export default BodyView;