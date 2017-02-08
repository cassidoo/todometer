'use babel';

import React from 'react';
import ProgressBar from 'react-progressbar.js';

export default class Progress extends React.Component {
  render() {
    var Bar = ProgressBar.Line;
    var options1 = {
      strokeWidth: 2,
      color: '#62DCA5'
    };
    var options2 = {
      strokeWidth: 2,
      color: '#F7F879'
    };

    return <div className="progress">
      <Bar
        progress={this.props.paused}
        options={options2}
        initialAnimate={true}
        containerClassName={'pause-bar'} />
      <Bar
        progress={this.props.completed}
        options={options1}
        initialAnimate={true}
        containerClassName={'complete-bar'} />
    </div>;
  }
}
