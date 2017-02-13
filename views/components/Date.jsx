'use babel';

import React from 'react';
import Moment from 'moment';

export default class Date extends React.Component {
  constructor() {
    super();
    this.state = { day: '',
                   month: '',
                   year: '',
                   weekday: ''
                 };
  }

  componentWillMount() {
    this.setDate();
  }

  componentDidMount() {
    window.setInterval(function () {
      if (this.state.day !== Moment.date()) {
        this.setDate();
      }
    }.bind(this), 1000);
  }

  setDate() {
    this.setState({
      day: Moment().date(),
      month: Moment().format('MMM'),
      year: Moment().year(),
      weekday: Moment().format('dddd')
    });
  }

  render() {
    return <div className="date">
      <div className="calendar">
        <div className="day">{this.state.day}</div>
        <div className="my">
          <div className="month">{this.state.month}</div>
          <div className="year">{this.state.year}</div>
        </div>
      </div>
      <div className="today">{this.state.weekday}</div>
    </div>;
  }
}
