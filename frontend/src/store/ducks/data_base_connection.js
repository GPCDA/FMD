import { createActions, createReducer } from 'reduxsauce';
import Immutable from 'seamless-immutable';

export const { Types, Creators } = createActions({
  dataBaseConnectionInit: [],
  dataBaseConnectionRequest: [],
  dataBaseConnectionSuccess: ['data'],
  dataBaseConnectionError: ['err'],
  postDataBaseConnectionTest: ['data'],
  postDataBaseConnectionFields: ['data', 'callback'],
});

/** --------------------------------
 * Variable declarations
 * --------------------------------- */

const INITIAL_STATE = Immutable({
  data: [],
  loading: false,
  error: false,
});

/* Reducers */

export const init = (state) => state.merge({ data: [] });

export const request = (state) => state.merge({ loading: true });

export const success = (state, { data = state.data }) => state.merge({ data, error: false, loading: false });

export const error = (state) => state.merge({ loading: false, error: true });

/* Reducers to types */

export default createReducer(INITIAL_STATE, {
  [Types.DATA_BASE_CONNECTION_INIT]: init,
  [Types.DATA_BASE_CONNECTION_REQUEST]: request,
  [Types.DATA_BASE_CONNECTION_SUCCESS]: success,
  [Types.DATA_BASE_CONNECTION_ERROR]: error,
});
