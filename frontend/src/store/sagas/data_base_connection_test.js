import { call, put } from 'redux-saga/effects';
import { actions as toastrActions } from 'react-redux-toastr';
import api from '../../services/api';
import { Creators } from '../ducks/data_base_connection_test';

export function* postDataBaseConnectionTest({ data }) {
  try {
    yield put(Creators.dataBaseConnectionTestInit());
    yield put(Creators.dataBaseConnectionTestRequest());
    const response = yield call(api.post, 'database-connection-test', data);

    yield put(toastrActions.add({
      type: 'success',
      title: 'Sucesso',
      message: 'Conexão bem sucedida!',
    }));

    yield put(Creators.dataBaseConnectionTestSuccess(response.data));
  } catch (err) {
    yield put(Creators.dataBaseConnectionTestError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha na conexão com banco de dados',
    }));
  }
}
