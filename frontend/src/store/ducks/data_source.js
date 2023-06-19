import { createActions, createReducer } from 'reduxsauce';
import Immutable from 'seamless-immutable';

export const { Types, Creators } = createActions({
  dataSourceInit: [],
  dataSourceRequest: [],
  dataSourceSuccess: ['data', 'currentDatasourceFields'],
  dataSourceError: ['err'],
  getDataSourceFields: ['fileId'],
  getDataSource: [],
  postDataSource: ['data'],
  deleteDataSource: ['id'],
});

/** --------------------------------
 * Variable declarations
 * --------------------------------- */

const INITIAL_STATE = Immutable({
  data: [],
  currentDatasourceFields: [],
  loading: false,
  error: false,
});

/* Reducers */

export const init = (state) => state.merge({ data: [], currentDatasourceFields: null });

export const request = (state) => state.merge({ loading: true });

export const success = (state, { data = state.data, currentDatasourceFields = state.currentDatasourceFields }) => state.merge({
  data,
  currentDatasourceFields,
  error: false,
  loading: false,
});

export const error = (state) => state.merge({ loading: false, error: true });

/* Reducers to types */

export default createReducer(INITIAL_STATE, {
  [Types.DATA_SOURCE_INIT]: init,
  [Types.DATA_SOURCE_REQUEST]: request,
  [Types.DATA_SOURCE_SUCCESS]: success,
  [Types.DATA_SOURCE_ERROR]: error,
});
