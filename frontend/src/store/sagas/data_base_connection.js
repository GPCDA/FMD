import { call, put } from 'redux-saga/effects';
import { actions as toastrActions } from 'react-redux-toastr';
import api from '../../services/api';
import { Creators } from '../ducks/data_base_connection';

export function* postDataBaseConnectionTest({ data }) {
  try {
    yield put(Creators.dataBaseConnectionInit());
    yield put(Creators.dataBaseConnectionRequest());
    yield call(api.post, 'database-connection/test', data);

    yield put(toastrActions.add({
      type: 'success',
      title: 'Sucesso',
      message: 'Conexão bem sucedida!',
    }));

    yield put(Creators.dataBaseConnectionSuccess());
  } catch (err) {
    yield put(Creators.dataBaseConnectionError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: err?.response?.data?.msg || 'Falha na conexão com banco de dados',
    }));
  }
}

export function* postDataBaseConnectionFields({ data, callback }) {
  try {
    yield put(Creators.dataBaseConnectionInit());
    yield put(Creators.dataBaseConnectionRequest());
    const response = yield call(api.post, 'database-connection/fields', data);

    yield put(Creators.dataBaseConnectionSuccess(response.data));
    callback();
  } catch (err) {
    yield put(Creators.dataBaseConnectionError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: err?.response?.data?.msg || 'Falha na conexão com banco de dados',
    }));
  }
}
