import { ADD_ITEM, UPDATE_ITEM, DELETE_ITEM, REORDER_ITEM, RESET_ALL } from '../actions';

// initialize state
const initialState = {
  items: []
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
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
      newState.items = reorder(newState.items, action.startIndex, action.endIndex);
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
