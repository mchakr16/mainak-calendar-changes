import React, { createElement } from 'react';
import { MinusOutlined, PlusOutlined, PlusCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { ScheduleType, IconType } from '../config/default';

function ResourceView({ schedulerData, contentScrollbarHeight, slotClickedFunc, slotItemTemplateResolver, toggleExpandFunc, slotItemIconClick }) {
  const { renderData, config } = schedulerData;
  const width = schedulerData.config.resourceTableWidth;
  const isPhaseIII = config.isPhaseIII;

  const paddingBottom = contentScrollbarHeight;
  const displayRenderData = renderData.filter(o => o.render);

  const handleToggleExpand = item => {
    if (toggleExpandFunc) {
      toggleExpandFunc(schedulerData, item.slotId);
    }
  };

  const handleSlotItemIconClick = (schedulerData, item, iconType) => {
    if (slotItemIconClick) slotItemIconClick(schedulerData, item, iconType);
  };

  const renderSlotItem = (item, indents) => {
    let indent = <span key={`es${item.indent}`} className="expander-space" />;

    const { key, ...restIconProps } = {
      key: `es${item.indent}`, onClick: () => handleToggleExpand(item),
    };

    if (item.hasChildren) {
      indent = item.expanded
        ? <MinusOutlined className='icon' key={key} {...restIconProps} />
        : <PlusOutlined className='icon' key={key} {...restIconProps} />;
    }

    indents.push(indent);
    const slotCell = slotClickedFunc ? (
      <span className="slot-cell">
        {indents}
        <button type="button" style={{ cursor: 'pointer', width: item.parentId ? width - 60 : width - 40 }} className="slot-text txt-btn-dis resource-slot" onClick={() => slotClickedFunc(schedulerData, item)}>
          {item.slotName}
        </button>
      </span>
    ) : (
      <span className="slot-cell">
        {indents}
        <button type="button" className="slot-text txt-btn-dis resource-slot" style={{ cursor: slotClickedFunc === undefined ? undefined : 'pointer', width: item.parentId ? width - 60 : width - 40 }}>
          {item.slotName}
        </button>
      </span>
    );

    let slotItem = (
      <div title={item.slotTitle || item.slotName} className="overflow-text header2-text" style={{ textAlign: 'left' }}>
        {slotCell}
      </div>
    );

    if (slotItemTemplateResolver) {
      const resolvedTemplate = slotItemTemplateResolver(schedulerData, item, slotClickedFunc, width, 'overflow-text header2-text');
      if (resolvedTemplate) {
        slotItem = resolvedTemplate;
      }
    }

    const tdStyle = {
      height: item.rowHeight,
      backgroundColor: item.groupOnly ? schedulerData.config.groupOnlySlotColor : undefined,
    };

    return (
      <tr key={item.slotId}>
        <td data-resource-id={item.slotId} style={tdStyle} className="slot-item">
          {slotItem}
          {config.scheduleType === ScheduleType.Team && isPhaseIII && (
            <span className="icons">
              {!item.parentId ? <PlusCircleFilled onClick={(e) => { e.stopPropagation(); handleSlotItemIconClick(schedulerData, item, IconType.Add) }} />
                : (<>
                  <MinusCircleFilled onClick={(e) => { e.stopPropagation(); handleSlotItemIconClick(schedulerData, item, IconType.Remove) }} />
                  {/* <DeleteOutlined onClick={(e) => { e.stopPropagation(); handleSlotItemIconClick(schedulerData, item, IconType.Delete) }} /> */}
                </>
                )}
            </span>
          )}
        </td>
      </tr>
    );
  };

  const resourceList = displayRenderData.map(item => {
    const indents = [];
    for (let i = 0; i < item.indent; i += 1) {
      indents.push(<span key={`es${i}`} className="expander-space" />);
    }

    return renderSlotItem(item, indents);
  });

  return (
    <div style={{ paddingBottom }}>
      <table className="resource-table">
        <tbody>{resourceList}</tbody>
      </table>
    </div>
  );
}

ResourceView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  contentScrollbarHeight: PropTypes.number.isRequired,
  slotClickedFunc: PropTypes.func,
  slotItemTemplateResolver: PropTypes.func,
  toggleExpandFunc: PropTypes.func,
  slotItemIconClick: PropTypes.func,
};

export default ResourceView;
