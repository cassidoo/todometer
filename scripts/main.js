import React from 'react';
import ReactDOM from 'react-dom';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createLogger } from 'redux-logger';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ItemListReducer from '../views/reducers.js';
import Main from '../views/main.jsx';

let store = createStore(ItemListReducer,
                        composeWithDevTools(
                          applyMiddleware(
                            createLogger({ collapsed: true })
                          )
                        )
                      );

window.onload = function() {
  ReactDOM.render(
    <Provider store={store}>
      <Main />
    </Provider>, document.getElementById('app'));
};
