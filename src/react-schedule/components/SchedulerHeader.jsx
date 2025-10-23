import { LeftOutlined, RightOutlined, ZoomInOutlined, ZoomOutOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Button, Calendar, Col, Popover, Radio, Row, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useState, createElement } from 'react';
import { DATE_FORMAT } from '../config/default';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const SchedulerHeader = React.forwardRef(({
  onViewChange,
  onToggleChange,
  onShiftCountChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  goNext,
  goBack,
  onSelectDate,
  schedulerData,
  leftCustomHeader,
  rightCustomHeader,
  style,
}, ref) => {
  const [viewSpinning, setViewSpinning] = useState(false);
  const [dateSpinning, setDateSpinning] = useState(false);
  const [visible, setVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const { viewType, showAgenda, isEventPerspective, config } = schedulerData;

  const dateLabel = schedulerData.getDateLabel();
  const selectDate = schedulerData.getSelectedDate();
  const calendarLocale = schedulerData.getCalendarPopoverLocale()?.default?.Calendar;
  const displayWeekend = schedulerData.config.displayWeekend;
  const shiftCount = schedulerData.config.shiftCount;
  const defaultValue = `${viewType}${showAgenda ? 1 : 0}${isEventPerspective ? 1 : 0}`;
  const [isToggleChecked, setIsToggleChecked] = useState(displayWeekend);

  const handleToggle = (event) => {
    setIsToggleChecked(!isToggleChecked);
    handleEvents(onToggleChange, true, event)
  };

  const handleEvents = (func, isViewSpinning, funcArg = undefined) => {
    if (isViewSpinning) {
      if (config.viewChangeSpinEnabled) setViewSpinning(true);
    } else if (config.dateChangeSpinEnabled) setDateSpinning(true);

    const coreFunc = () => {
      if (funcArg !== undefined) func(funcArg);
      else func();

      if (isViewSpinning) {
        if (config.viewChangeSpinEnabled) setViewSpinning(false);
      } else if (config.dateChangeSpinEnabled) setDateSpinning(false);
    };

    if (config.viewChangeSpinEnabled || config.dateChangeSpinEnabled) {
      setTimeout(coreFunc, config.schedulerHeaderEventsFuncsTimeoutMs);
    } else {
      coreFunc();
    }
  };

  // Calendar button
  const [tempDate, setTempDate] = useState(dayjs(selectDate));
  const [appliedDate, setAppliedDate] = useState(null);

  // Apply Setting As per Config provided in sheduler instance
  const buttonConfig = config.calenderConfig ?? {};
  const applyButtonText = buttonConfig.applyButtonText?.trim() || 'Apply';
  const applyButtonType = buttonConfig.applyButtonType?.trim() || 'primary';
  const applyButtonAlignment = buttonConfig.applyButtonAlignment?.trim() || 'center';

  const handleDateSelect = (date) => {
    setTempDate(date);
  };

  const handleApply = () => {
    setVisible(false);
    setAppliedDate(tempDate);
    handleEvents(onSelectDate, false, tempDate.format(DATE_FORMAT));
  };

  const popover = (
    <div className="popover-calendar">
      <Calendar
        locale={calendarLocale}
        defaultValue={dayjs(selectDate)}
        fullscreen={false}
        onSelect={handleDateSelect}
      />
      <div style={{
        display: 'flex', borderTop: '0.5px solid rgb(210, 207, 207)',
        paddingTop: '10px', justifyContent: `${applyButtonAlignment}`
      }}>
        <Button type={applyButtonType} onClick={handleApply} >
          {applyButtonText}
        </Button>
      </div>
    </div>
  );

  const settings = (
    <div>
      <div style={{ padding: '10px 0px' }}>
        <span style={{ fontFamily: 'sans-serif' }}>Number of Shifts: </span>
        <span style={{ paddingLeft: '12px' }}>
          <select className="settings-dropdown" defaultValue={shiftCount} onChange={event => handleEvents(onShiftCountChange, true, event)}>
            <option>2</option><option>3</option>
          </select>
        </span>
      </div>
      {config.zoomEnabled && (
        <div style={{ padding: '10px 0px', borderTop: '1px solid #e9e9e9' }}>
          <div style={{ fontFamily: 'sans-serif', marginBottom: '8px' }}>Zoom Controls:</div>
          <Space>
            <Button
              size="small"
              icon={<ZoomOutOutlined />}
              onClick={() => handleEvents(onZoomOut, false)}
              disabled={!schedulerData.canZoomOut()}
              title="Zoom Out"
            />
            <Button
              size="small"
              icon={<FullscreenOutlined />}
              onClick={() => handleEvents(onResetZoom, false)}
              title="Fit to Screen"
            >
              {Math.round(schedulerData.getZoomLevel() * 100)}%
            </Button>
            <Button
              size="small"
              icon={<ZoomInOutlined />}
              onClick={() => handleEvents(onZoomIn, false)}
              disabled={!schedulerData.canZoomIn()}
              title="Zoom In"
            />
          </Space>
        </div>
      )}
    </div>
  );

  const handleSettingsOpenChange = newOpen => {
    setSettingsVisible(newOpen);
  };

  const hideSettings = () => {
    setSettingsVisible(false);
  };

  const radioButtonList = config.views.map(item => (
    <RadioButton
      key={`${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`}
      value={`${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`}
    >
      <span style={{ margin: '0px 8px' }}>{item.viewName}</span>
    </RadioButton>
  ));

  return (
    <Row
      ref={ref}
      gutter={[10, 10]}
      type="flex"
      align="middle"
      justify="space-between"
      style={{ ...style }}
    >
      {leftCustomHeader}
      <Col>
        <div className="header2-text">
          <Space>
            <div>
              <LeftOutlined style={{ marginRight: '8px' }} className="icon-nav" onClick={() => handleEvents(goBack, false)} />
              {config.calendarPopoverEnabled ? (
                <Popover
                  content={popover}
                  placement="bottomLeft"
                  trigger="click"
                  open={visible}
                  onOpenChange={setVisible}
                  overlayClassName="scheduler-header-popover"
                >
                  <span className="header2-text-label" style={{ cursor: 'pointer' }}>
                    {dateLabel}
                  </span>
                </Popover>
              ) : (
                <span className="header2-text-label">{dateLabel}</span>
              )}
              <RightOutlined style={{ marginLeft: '8px' }} className="icon-nav" onClick={() => handleEvents(goNext, false)} />
            </div>
            <Spin spinning={dateSpinning} />
          </Space>
          <Space>
            <Popover
              content={settings}
              placement="bottomLeft"
              trigger="click"
              title="Settings"
              open={settingsVisible}
              onOpenChange={handleSettingsOpenChange}>
              <Button type="primary">Settings</Button>
            </Popover>
          </Space>
        </div>
      </Col>
      <Col>
        <Space>
          <Spin spinning={viewSpinning} />
          <RadioGroup
            buttonStyle="solid"
            defaultValue={defaultValue}
            size="default"
            onChange={event => handleEvents(onViewChange, true, event)} >
            {radioButtonList}
          </RadioGroup>
        </Space>
        <Space>
          <div className="toggle-container">
            <label className="toggle-text">Holidays:</label>
            <label className="toggle-switch">
              <input type="checkbox" checked={isToggleChecked} onChange={event => handleToggle(event)} />
              <span className="slider"></span>
            </label>
          </div>
        </Space>
      </Col>
      {rightCustomHeader}
    </Row>
  );
});

SchedulerHeader.propTypes = {
  onViewChange: PropTypes.func.isRequired,
  onToggleChange: PropTypes.func.isRequired,
  onShiftCountChange: PropTypes.func.isRequired,
  onZoomIn: PropTypes.func,
  onZoomOut: PropTypes.func,
  onResetZoom: PropTypes.func,
  goNext: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  schedulerData: PropTypes.object.isRequired,
  leftCustomHeader: PropTypes.object,
  rightCustomHeader: PropTypes.object,
  style: PropTypes.object,
};

export default SchedulerHeader;
