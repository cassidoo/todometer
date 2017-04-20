export const ADD_ITEM = 'ADD_ITEM';
export const UPDATE_ITEM = 'UPDATE_ITEM';
export const DELETE_ITEM = 'DELETE_ITEM';

export const addItem = item => ({ type: ADD_ITEM, item });
export const updateItem = item => ({ type: UPDATE_ITEM, item });
export const deleteItem = item => ({ type: DELETE_ITEM, item });
