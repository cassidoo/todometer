import React from 'react';
import ReactDOM from 'react-dom';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { loadState, saveState } from '../views/local-storage';
import rootReducer from '../views/reducers/index';
import Main from '../views/main.jsx';

const persistedState = loadState();
let store = createStore(rootReducer,
    persistedState,
    composeWithDevTools(
      applyMiddleware(
        createLogger({ collapsed: true })
      )
    )
  );

store.subscribe(() => {
  saveState(store.getState());
});

window.onload = function() {
  ReactDOM.render(
    <Provider store={store}>
      <Main />
    </Provider>, document.getElementById('app'));
};
