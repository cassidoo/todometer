'use babel';

import React from 'react';

export default class Item extends React.Component {
  render() {
    return <div className="item">
      <div className="item-name">{this.props.text}</div>
      <div className="buttons">
        <img src="./assets/x.svg" alt="Delete"/>
        <img src="./assets/pause.svg" alt="Pause"/>
        <img src="./assets/check.svg" alt="Complete"/>
      </div>
    </div>;
  }
}
