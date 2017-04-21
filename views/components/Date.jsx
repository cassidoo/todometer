'use babel';

import React from 'react';
import { connect } from 'react-redux';
import { setDate } from '../actions.js';
import { getDate } from '../reducers/date.js';
import Moment from 'moment';

class Date extends React.Component {
  constructor(props) {
    super(props);
    this.setDate = this.setDate.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {
    // window.setInterval(function () {
    //   if (this.state.day !== Moment.date()) {
    //     this.setDate();
    //   }
    // }.bind(this), 1000);
    this.setDate();
  }

  setDate() {
    const date = {
      day: Moment().date(),
      month: Moment().format('MMM'),
      year: Moment().year(),
      weekday: Moment().format('dddd')
    };
    this.props.setDate(date);
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
    </div>;
  }
}

const mapStateToProps = state => ({
  date: getDate(state)
});

const mapDispatchToProps = dispatch => ({
  setDate: (date) => dispatch(setDate(date))
});

export default connect(mapStateToProps, mapDispatchToProps)(Date);
