'use babel';

import React from 'react';

export default class Item extends React.Component {
  renderButtons() {
    if (!this.props.paused) {
      return (
        <div className="buttons">
          <button className="delete" onClick={() => this.props.onDelete(this.props.item)}></button>
          <button className="pause" onClick={() => this.props.onPause(this.props.item)}></button>
          <button className="complete" onClick={() => this.props.onComplete(this.props.item)}></button>
        </div>
      );
    }
    return (
      <div className="buttons">
        <button className="delete" onClick={() => this.props.onDelete(this.props.item)}></button>
        <button className="complete" onClick={() => this.props.onComplete(this.props.item)}></button>
      </div>
      );
  }

  render() {
    return (
      <div className="item">
        <div className="item-name">{this.props.text}</div>
        {this.renderButtons()}
      </div>
    );
  }
}
