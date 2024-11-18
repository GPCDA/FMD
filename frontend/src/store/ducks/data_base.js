import { createActions, createReducer } from 'reduxsauce';
import Immutable from 'seamless-immutable';

export const { Types, Creators } = createActions({
  dataBaseInit: [],
  dataBaseRequest: [],
  dataBaseSuccess: ['data'],
  dataBaseError: ['err'],
  getDataBase: [],
  postDataBase: ['data'],
  deleteDataBase: ['id'],
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

export const success = (state, { data }) => state.merge({ data, error: false, loading: false });

export const error = (state) => state.merge({ loading: false, error: true });

/* Reducers to types */

export default createReducer(INITIAL_STATE, {
  [Types.DATA_BASE_INIT]: init,
  [Types.DATA_BASE_REQUEST]: request,
  [Types.DATA_BASE_SUCCESS]: success,
  [Types.DATA_BASE_ERROR]: error,
});
