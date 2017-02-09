'use babel';

import React from 'react';
import Item from './Item';
import Progress from './Progress';

export default class ItemList extends React.Component {
  constructor() {
    super();
    this.state = { items: [],
                   completed: [],
                   paused: [],
                   cPercent: 0,
                   pPercent: 0
                  };
    this.addItem = this.addItem.bind(this);
    this.completeItem = this.completeItem.bind(this);
    this.completePaused = this.completePaused.bind(this);
    this.createTasks = this.createTasks.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.deletePaused = this.deletePaused.bind(this);
    this.pauseItem = this.pauseItem.bind(this);
  }

  addItem(e) {
    var i = this.state.items;
    i.push({
      text: this._inputElement.value,
      paused: false,
      key: Date.now()
    });
    this.setState({ items: i });
    e.preventDefault();
    this._inputElement.value = '';
    this._inputElement.focus();
    this.updateProgress();
  }

  completeItem(e) {
    this.deleteItem(e);
    var c = this.state.completed;
    c.push({
      text: e.target.parentNode.parentNode.getElementsByClassName('item-name')[0].innerHTML,
      paused: false,
      key: Date.now()
    });
    this.setState({ completed: c });
    this.updateProgress();
  }

  completePaused(e) {
    this.deletePaused(e);
    var c = this.state.completed;
    c.push({
      text: e.target.parentNode.parentNode.getElementsByClassName('item-name')[0].innerHTML,
      paused: false,
      key: Date.now()
    });
    this.setState({ completed: c });
    this.updateProgress();
  }

  deleteItem(e) {
    var i = this.state.items;
    var result = i.filter(function(obj) {
        return obj.text !== e.target.parentNode.parentNode.getElementsByClassName('item-name')[0].innerHTML;
    });
    this.setState({ items: result }, function() {
      this.updateProgress();
    });
  }

  deletePaused(e) {
    var p = this.state.paused;
    var result = p.filter(function(obj) {
        return obj.text !== e.target.parentNode.parentNode.getElementsByClassName('item-name')[0].innerHTML;
    });
    this.setState({ paused: result }, function() {
      this.updateProgress();
    });
  }

  pauseItem(e) {
    this.deleteItem(e);
    var p = this.state.paused;
    p.push({
      text: e.target.parentNode.parentNode.getElementsByClassName('item-name')[0].innerHTML,
      paused: true,
      key: Date.now()
    });
    this.setState({ paused: p });
    this.updateProgress();
  }

  updateProgress() {
    var completedAmount = this.state.completed.length;
    var pausedAmount = this.state.paused.length;
    var totalAmount = this.state.items.length + completedAmount + pausedAmount;
    var completedPercentage = completedAmount/totalAmount;
    var pausedPercentage = (pausedAmount/totalAmount) + completedPercentage;
    this.setState({ cPercent: completedPercentage,
                    pPercent: pausedPercentage
                  });
  }

  createTasks(item) {
    return <Item text={item.text}
                 paused={item.paused}
                 key={item.key}
                 onComplete={this.completeItem}
                 onDelete={this.deleteItem}
                 onPause={this.pauseItem}
                 onPauseComplete={this.deletePaused}
                 onPauseDelete={this.completePaused}
                 />;
  }

  renderPaused() {
    var pausedItems = this.state.paused.map(this.createTasks);
    if (pausedItems.length > 0) {
      return <div>
        <h2>Do Later</h2>
        {pausedItems}
      </div>;
    }
  }

  render() {
    var listItems = this.state.items.map(this.createTasks);

    return <div className="item-list">
      <Progress completed={this.state.cPercent} paused={this.state.pPercent} />
      <form className="form" onSubmit={this.addItem}>
        <input ref={(a) => this._inputElement = a}
               placeholder="Add new item"
               autoFocus />
        <button type="submit"></button>
      </form>

      {listItems}
      {this.renderPaused()}
    </div>;
  }
}
