'use babel';

import React from 'react';
import Date from './components/Date';
import ItemList from './components/ItemList';
import { DragDropContext } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { reorderItem } from './actions.js';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd({ source, destination }) {
    if (!destination) return;
    this.props.reorderItem(source, destination);
  }

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div>
          <Date />
          <ItemList />
        </div>
      </DragDropContext>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  reorderItem: (source, destination) => dispatch(reorderItem(source, destination)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);

