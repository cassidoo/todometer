import { ADD_ITEM, UPDATE_ITEM, DELETE_ITEM, REORDER_ITEM, RESET_ALL } from '../actions';

// initialize state
const initialState = {
  items: []
};

const getListIndex = (list, destStatus, targetFilteredIndex) => {
  const filtered = list
    .map((e, i) => Object.assign(e, {originalIndex: i }))
    .filter(e => e.status === destStatus);
  return filtered[targetFilteredIndex].originalIndex;
}

const reorder = (list, source, destination) => {
  const destStatus = destination.droppableId
  const srcStatus = source.droppableId

  // Get the index of the moving element within the array
  // The index passed in is the index of it within the array
  // of either pending or paused items
  const srcIndex = getListIndex(list, srcStatus, source.index);

  // Remove the moving element and set it's new status
  const [removed] = list.splice(srcIndex, 1);
  removed.status = destStatus;

  // Split the remaining list up
  const destList = list.filter(e => e.status === destStatus);
  const otherList = list.filter(e => e.status !== destStatus);

  // Put the moving element into the destination list
  destList.splice(destination.index, 0, removed);

  // Return the combined list
  const res = [...otherList, ...destList];
  return res;
};

export default function(state = initialState, action) {
  const newState = Object.assign({}, state);

  switch (action.type) {
    case ADD_ITEM:
      newState.items = newState.items.concat(action.item);
      break;
    case UPDATE_ITEM:
      newState.items = newState.items.map(i => {
        if (i.key === action.item.key) {
          return Object.assign({}, i, {
            status: action.item.status
          });
        }
        return i;
      });
      break;
    case DELETE_ITEM:
      newState.items = newState.items.filter((item => item.key !== action.item.key));
      break;
    case REORDER_ITEM:
      newState.items = reorder(newState.items, action.source, action.destination);
      break;
    case RESET_ALL:
      newState.items = newState.items.filter(item => item.status !== 'complete').map(i => {
        if (i.status === 'paused') {
          return Object.assign({}, i, {
            status: 'pending'
          });
        }
        return i;
      });
      break;
    default:
      return state;
  }
  return newState;
}

// selectors
export const getAllItems = state => {
  return state.itemList.items;
};

export const getPendingItems = state => {
  return state.itemList.items.filter(item => item.status === 'pending');
};

export const getCompletedItems = state => {
  return state.itemList.items.filter(item => item.status === 'complete');
};

export const getPausedItems = state => {
  return state.itemList.items.filter(item => item.status === 'paused');
};
