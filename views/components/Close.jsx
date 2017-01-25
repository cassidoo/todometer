'use babel';

import React from 'react';

export default class Close extends React.Component {
  render() {
    return <div>
      <a id="close" href="javascript:window.close()">x</a>
    </div>;
  }
}
