import { createActions, createReducer } from 'reduxsauce';
import Immutable from 'seamless-immutable';

export const { Types, Creators } = createActions({
  jdbcDriverInit: [],
  jdbcDriverRequest: [],
  jdbcDriverSuccess: ['data'],
  jdbcDriverError: ['err'],
  getJdbcDriver: [],
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
  [Types.JDBC_DRIVER_INIT]: init,
  [Types.JDBC_DRIVER_REQUEST]: request,
  [Types.JDBC_DRIVER_SUCCESS]: success,
  [Types.JDBC_DRIVER_ERROR]: error,
});
