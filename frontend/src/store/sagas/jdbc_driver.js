import { call, put } from 'redux-saga/effects';
import { actions as toastrActions } from 'react-redux-toastr';
import api from '../../services/api';
import { Creators } from '../ducks/jdbc_driver';

export function* getJDBCDriver() {
  try {
    yield put(Creators.jdbcDriverInit());
    yield put(Creators.jdbcDriverRequest());
    const response = yield call(api.get, 'jdbc-driver');

    yield put(Creators.jdbcDriverSuccess(response.data));
  } catch (err) {
    yield put(Creators.jdbcDriverError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao listar drivers JDBC',
    }));
  }
}
