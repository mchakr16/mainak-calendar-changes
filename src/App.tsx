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
          <ReactPlanner events={DemoData.events}/>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Team',
      children: (
        <div className='enable-tab'>
          <ReactPlanner events={DemoData.eventsTab}/>
        </div>
      ),
    }
  ];

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <>
      <Tabs defaultActiveKey="1" destroyOnHidden  items={items} onChange={onChange} />
      {/* <ReactPlanner/> */}
      {/* <NewApp /> */}
    </>
  )
}

export default App
