'use babel';

import React from 'react';
import Date from './components/Date';
import ItemList from './components/ItemList';
import { connect } from 'react-redux';
import { setDate, resetAll } from './actions.js';
import { getDate } from './reducers/date.js';
import moment from 'moment';
import Mousetrap from 'mousetrap';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.setDate = this.setDate.bind(this);
  }

  componentDidMount() {
    this.setDate(moment());
    Mousetrap.bind(['command+left'], (() => this.getNewDate(-1)));
    Mousetrap.bind(['command+right'], (() => this.getNewDate(1)));
  }

  componentWillUnmount() {
    Mousetrap.unbind(['command+left', 'command+right'], this.getNewDate);
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

  getNewDate(num) {
    const { date } = this.props;
    const monthIndex = parseInt(moment(date.month, 'MMM').format('M') -1);
    const newDay = moment([date.year, monthIndex, date.day]).add(num, 'days').format();
    this.setDate(newDay);
  }

  render() {
    return <div>
      <Date getNewDate={(num) => this.getNewDate(num)}/>
      <ItemList getNewDate={(num) => this.getNewDate(num)}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(Main);
