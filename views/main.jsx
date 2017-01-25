'use babel';

import React from 'react';
import Close from './components/Close';
import Date from './components/Date';

export default class Main extends React.Component {
  render() {
    return <div>
      <Close />
      <Date />
    </div>;
  }
}
