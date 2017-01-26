'use babel';

import React from 'react';
import Date from './components/Date';
import ItemList from './components/ItemList';
import Progress from './components/Progress';

export default class Main extends React.Component {
  render() {
    return <div>
      <Date />
      <Progress />
      <ItemList />
    </div>;
  }
}
