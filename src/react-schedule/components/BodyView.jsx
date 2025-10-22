/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import PropTypes from 'prop-types';
import { ViewType } from '../config/default';

function BodyView({ schedulerData }) {
  const { renderData, headers, config, behaviors, viewType } = schedulerData;
  const fullWidth = schedulerData.getContentCellWidth();

  const subCellsPerHeader = viewType === ViewType.Week ? config.shiftCount : 1;
  const widthPerSubCell = fullWidth / subCellsPerHeader;

  const tableRows = renderData
    .filter((o) => o.render).map(({ slotId, groupOnly, rowHeight }) => {
      const rowCells = [];

      headers.forEach((header) => {
        for (let i = 0; i < subCellsPerHeader; i++) {
          const key = `${slotId}_${header.time}_${i}`;
          const style = {
            width: widthPerSubCell,
            border: '1px solid #e9e9e9',
            boxSizing: 'border-box',
            textAlign: 'center',
          };

          if (header.nonWorkingTime) {
            style.backgroundColor = config.nonWorkingTimeBodyBgColor;
          }
          if (groupOnly) {
            style.backgroundColor = config.groupOnlySlotColor;
          }
          if (behaviors.getNonAgendaViewBodyCellBgColorFunc) {
            const cellBgColor = behaviors.getNonAgendaViewBodyCellBgColorFunc(
              schedulerData,
              slotId,
              header
            );
            if (cellBgColor) {
              style.backgroundColor = cellBgColor;
            }
          }

          rowCells.push(
            <td key={key} style={style}>
              <div />
            </td>
          );
        }
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
