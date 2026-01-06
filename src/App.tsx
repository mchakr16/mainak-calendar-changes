import './App.css'
// import NewApp from './NewApp'
import ReactPlanner from './ReactPlanner'

import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import DemoData from './sample';

function App() {

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Schedule',
      children: (
        <div className='enable-tab'>
          <ReactPlanner events={DemoData.events} scheduleType='Schedule' />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Team',
      children: (
        <div className='enable-tab'>
          <ReactPlanner events={DemoData.eventsTab} scheduleType='Team' />
        </div>
      ),
    }
  ];

  const onChange = (key: string) => {
    console.log(key);
    //destroyOnHidden
  };

  return (
    <>
      <Tabs defaultActiveKey="1"  items={items} onChange={onChange} />
      {/* <ReactPlanner/> */}
      {/* <NewApp /> */}
    </>
  )
}

export default App
