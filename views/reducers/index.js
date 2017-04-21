import { combineReducers } from 'redux';

import ItemListReducer from './item-list';
import DateReducer from './date';

const rootReducer = combineReducers({
  itemList: ItemListReducer,
  date: DateReducer
});

export default rootReducer;
