'use babel';

import React from 'react';
import Date from './components/Date';
import ItemList from './components/ItemList';

export default class Main extends React.Component {
  render() {
    return <div>
      <Date />
      <ItemList />
    </div>;
  }
}
