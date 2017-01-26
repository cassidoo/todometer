'use babel';

import React from 'react';
import Item from './Item';

export default class ItemList extends React.Component {
  constructor() {
    super();
    this.state = { items: [{text: "poop", paused: false, key: 0}] };
    this.addItem = this.addItem.bind(this);
    this.createTasks = this.createTasks.bind(this);
  }

  addItem(e) {
    var i = this.state.items;
    console.log(i);
    i.push({
      text: this._inputElement.value,
      paused: false,
      key: Date.now()
    });
    this.setState({items: i});
    e.preventDefault();
  }

  createTasks(item) {
    return <Item text={item.text} paused={item.paused} key={item.key} />;
  }

  render() {
    var listItems = this.state.items.map(this.createTasks);

    return <div className="item-list">
      <form className="form" onSubmit={this.addItem}>
        <input ref={(a) => this._inputElement = a}
               placeholder="Add new item"
               autoFocus />
        <button type="submit"></button>
      </form>

      <Item text="sample" paused="false" />
      {listItems}
    </div>;
  }
}
