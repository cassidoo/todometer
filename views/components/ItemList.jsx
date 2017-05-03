'use babel';

import React from 'react';
import { connect } from 'react-redux';
import { addItem, updateItem, deleteItem, resetAll } from '../actions.js';
import { getAllItems, getPendingItems, getCompletedItems, getPausedItems } from '../reducers/item-list.js';
import Item from './Item';
import Progress from './Progress';

class ItemList extends React.Component {
  constructor(props) {
    super(props);
    this.addItem = this.addItem.bind(this);
    this.completeItem = this.completeItem.bind(this);
    this.pauseItem = this.pauseItem.bind(this);
  }

  addItem(e) {
    const newItem = {
      text: this._inputElement.value,
      key: Date.now(),
      status: 'pending'
    };

    if (!!newItem.text.trim()) this.props.addItem(newItem);
    e.preventDefault();
    this._inputElement.value = '';
    this._inputElement.focus();
  }

  completeItem(item) {
    const completedItem = Object.assign({}, item, {
      status: 'complete'
    });
    this.props.updateItem(completedItem);
  }

  pauseItem(item) {
    const pausedItem = Object.assign({}, item, {
      status: 'paused'
    });
    this.props.updateItem(pausedItem);
  }

  renderProgress() {
    const completedAmount = this.props.completedItems.length;
    const pausedAmount = this.props.pausedItems.length;
    const totalAmount = this.props.allItems.length;

    let completedPercentage = completedAmount/totalAmount;
    let pausedPercentage = (pausedAmount/totalAmount) + completedPercentage;

    if (isNaN(completedPercentage)) {
      completedPercentage = 0;
    }

    if (isNaN(pausedPercentage)) {
      pausedPercentage = 0;
    }

    return (
      <Progress completed={completedPercentage} paused={pausedPercentage} />
    );
  }

  renderReset() {
    const completedAmount = this.props.completedItems.length;
    const pausedAmount = this.props.pausedItems.length;

    if (completedAmount > 0 || pausedAmount > 0) {
      return (
        <div className="reset">
          <button onClick={this.props.resetAll}>reset progress</button>
        </div>
      );
    }
  }

  renderPaused() {
    const pausedItems = this.props.pausedItems;
    if (pausedItems !== undefined && pausedItems.length > 0) {
      return (
        <div>
          <h2>Do Later</h2>
          {
            pausedItems && pausedItems.map((item) => {
              return (
                <Item
                  item={item}
                  text={item.text}
                  status={item.status}
                  key={item.key}
                  onComplete={this.completeItem}
                  onDelete={this.props.deleteItem}
                  paused={true}
                />
              );
            })
          }
        </div>
      );
    }
  }

  render() {
    const { pendingItems } = this.props;
    return (
      <div className="item-list">
        {this.renderProgress()}
        <form className="form" onSubmit={this.addItem}>
          <input
            ref={(a) => this._inputElement = a}
            placeholder="Add new item"
            autoFocus
          />
          <button type="submit" />
        </form>
        {
          pendingItems && pendingItems.map((item) => {
            return (
              <Item
                item={item}
                text={item.text}
                status={item.status}
                key={item.key}
                onComplete={this.completeItem}
                onDelete={this.props.deleteItem}
                onPause={this.pauseItem}
              />
            );
          })
        }
        {this.renderPaused()}
        {this.renderReset()}
    </div>
    );
  }
}

const mapStateToProps = state => ({
  allItems: getAllItems(state),
  pendingItems: getPendingItems(state),
  completedItems: getCompletedItems(state),
  pausedItems: getPausedItems(state)
});

const mapDispatchToProps = dispatch => ({
  addItem: (item) => dispatch(addItem(item)),
  updateItem: (item) => dispatch(updateItem(item)),
  deleteItem: (item) => dispatch(deleteItem(item)),
  resetAll: (item) => dispatch(resetAll(item))
});

export default connect(mapStateToProps, mapDispatchToProps)(ItemList);
