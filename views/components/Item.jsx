'use babel';

import React from 'react';

export default class Item extends React.Component {
  render() {
    return <div className="item">
      <div className="item-name">{this.props.text}</div>
      <div className="buttons">
        <button className="delete" onClick={this.props.onDelete}></button>
        <button className="pause" onClick={this.props.onPause}></button>
        <button className="complete" onClick={this.props.onComplete}></button>
      </div>
    </div>;
  }
}
