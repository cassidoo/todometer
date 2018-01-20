'use babel';

import React from 'react';
import { connect } from 'react-redux';
import { setDate, resetAll } from '../actions.js';
import { getDate } from '../reducers/date.js';

class Date extends React.Component {
  render() {
    const { props } = this;
    return <div className="date">
      <div className="calendar">
        <div className="day">{props.date.day}</div>
        <div className="my">
          <div className="month">{props.date.month}</div>
          <div className="year">{props.date.year}</div>
        </div>
      </div>
      <div className="today">{props.date.weekday}</div>
      <div className="buttons">
        <button className="previous" onClick={() => props.getNewDate(-1)}>&larr;</button>
        <button className="next" onClick={() => props.getNewDate(+1)}>&rarr;</button>
      </div>
    </div>;
  }
}

const mapStateToProps = state => ({
  date: getDate(state)
});

export default connect(mapStateToProps, null)(Date);
