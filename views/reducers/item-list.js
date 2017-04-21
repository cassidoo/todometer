import { ADD_ITEM, UPDATE_ITEM, DELETE_ITEM } from '../actions';

// initialize state
const initialState = {
  items: []
};

export default function (state = initialState, action) {
  const newState = Object.assign({}, state);

  switch (action.type) {
    case ADD_ITEM:
      newState.items = newState.items.concat(action.item);
      break;
    case UPDATE_ITEM:
      newState.items = newState.items.map((i) => {
        if (i.key === action.item.key) {
          return Object.assign({}, i, {
            status: action.item.status
          });
        } else {
          return i;
        }
      });
      break;
    case DELETE_ITEM:
      newState.items = newState.items.filter((item => item.key !== action.item.key));
      break;
    default:
      return state;
  }
  return newState;
};

// selectors
export const getAllItems = state => {
  return state.itemList.items;
};

export const getPendingItems = state => {
  return state.itemList.items.filter((item) => item.status === 'pending');
};

export const getCompletedItems = state => {
  return state.itemList.items.filter((item) => item.status === 'complete');
};

export const getPausedItems = state => {
  return state.itemList.items.filter((item) => item.status === 'paused');
};
