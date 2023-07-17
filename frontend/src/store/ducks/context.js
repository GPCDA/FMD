import { createActions, createReducer } from 'reduxsauce';
import Immutable from 'seamless-immutable';

export const { Types, Creators } = createActions({
  contextInit: [],
  contextRequest: [],
  contextSuccess: ['data'],
  contextError: ['err'],
  getContext: [],
  postContext: ['data', 'callback'],
  putContext: ['data'],
  deleteContext: ['id'],
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
  [Types.CONTEXT_INIT]: init,
  [Types.CONTEXT_REQUEST]: request,
  [Types.CONTEXT_SUCCESS]: success,
  [Types.CONTEXT_ERROR]: error,
});
