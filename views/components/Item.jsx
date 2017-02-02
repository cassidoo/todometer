'use babel';

import React from 'react';

export default class Item extends React.Component {
  render() {
    return <div className="item">
      <div className="item-name">{this.props.text}</div>
      <div className="buttons">
        <button className="delete"></button>
        <button className="pause"></button>
        <button className="complete"></button>
      </div>
    </div>;
  }
}
