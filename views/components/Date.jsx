'use babel';

import React from 'react';
import Moment from 'moment';

export default class Date extends React.Component {
  render() {
    return <div className="date">
      <div className="calendar">
        <div className="day">{Moment().date()}</div>
        <div className="my">
          <div className="month">{Moment().format('MMM')}</div>
          <div className="year">{Moment().year()}</div>
        </div>
      </div>
      <div className="today">{Moment().format('dddd')}</div>
    </div>;
  }
}
