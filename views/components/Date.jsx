'use babel';

import React from 'react';
import { connect } from 'react-redux';
import { setDate, resetAll } from '../actions.js';
import { getDate } from '../reducers/date.js';
import moment from 'moment';

class Date extends React.Component {
  constructor(props) {
    super(props);
    this.setDate = this.setDate.bind(this);
  }

  componentDidMount() {
    this.setDate(moment());
  }

  setDate(newDate) {
    const date = {
      day: moment(newDate).date(),
      month: moment(newDate).format('MMM'),
      year: moment(newDate).year(),
      weekday: moment(newDate).format('dddd'),
      full: moment(newDate).format('LLL')
    };

    const local = localStorage.getItem('date');
    this.checkDate(local);
    this.props.setDate(date);
  }

  checkDate(local) {
    if (local !== null && moment(local).isBefore(moment().format('MM-DD-YYYY'))) {
      this.props.resetAll();
    }
    localStorage.setItem('date', moment().format('MM-DD-YYYY'));
  }

  onClick(num) {
    const { date } = this.props;
    const monthIndex = parseInt(moment(date.month, 'MMM').format('M') -1);
    const newDay = moment([date.year, monthIndex, date.day]).add(num, 'days').format();
    this.setDate(newDay);
  }

  render() {
    return <div className="date">
      <div className="calendar">
        <div className="day">{this.props.date.day}</div>
        <div className="my">
          <div className="month">{this.props.date.month}</div>
          <div className="year">{this.props.date.year}</div>
        </div>
      </div>
      <div className="today">{this.props.date.weekday}</div>
      <div className="buttons">
        <button className="previous" onClick={() => this.onClick(-1)}>&larr;</button>
        <button className="next" onClick={() => this.onClick(+1)}>&rarr;</button>
      </div>
    </div>;
  }
}

const mapStateToProps = state => ({
  date: getDate(state)
});

const mapDispatchToProps = dispatch => ({
  setDate: (date) => dispatch(setDate(date)),
  resetAll: (item) => dispatch(resetAll(item))
});

export default connect(mapStateToProps, mapDispatchToProps)(Date);
