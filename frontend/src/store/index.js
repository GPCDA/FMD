import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { routerMiddleware } from 'connected-react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import { composeWithDevTools } from 'redux-devtools-extension';
import Immutable from 'seamless-immutable';
import history from '../routes/history';
import rootReducer from './ducks';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware, routerMiddleware(history)];

const configureStore = (initialState) => createStore(
  rootReducer(history),
  Immutable(initialState),
  composeWithDevTools(
    applyMiddleware(...middlewares),
  ),
);

const store = configureStore();

sagaMiddleware.run(rootSaga);

export default store;
