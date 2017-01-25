'use babel';

import React from 'react';

export default class Date extends React.Component {
  render() {
    return <div className="date">
      <div className="calendar">
        <div className="day">24</div>
        <div className="month">Jan</div>
        <div className="year">2017</div>
      </div>
      <div className="today">Wednesday</div>
    </div>;
  }
}
