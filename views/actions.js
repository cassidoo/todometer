export const ADD_ITEM = 'ADD_ITEM';
export const UPDATE_ITEM = 'UPDATE_ITEM';
export const DELETE_ITEM = 'DELETE_ITEM';

export const RESET_ALL = 'RESET_ALL';

export const SET_DATE = 'SET_DATE';

export const addItem = item => ({ type: ADD_ITEM, item });
export const updateItem = item => ({ type: UPDATE_ITEM, item });
export const deleteItem = item => ({ type: DELETE_ITEM, item });

export const resetAll = () => ({ type: RESET_ALL });

export const setDate = date => ({ type: SET_DATE, date });
