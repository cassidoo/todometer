import { SET_DATE } from '../actions';

// initialize state
const initialState = {
  date: {
    day: '',
    month: '',
    year: '',
    weekday: ''
  }
};

export default function (state = initialState, action) {
  const newState = Object.assign({}, state);
  switch (action.type) {
    case SET_DATE:
      newState.date = action.date;
      break;
    default:
      return state;
  }
  return newState;
}

// selectors
export const getDate = state => {
  return state.date.date;
};


