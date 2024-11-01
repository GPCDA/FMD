import { call, put } from 'redux-saga/effects';
import { actions as toastrActions } from 'react-redux-toastr';
import api from '../../services/api';
import { Creators } from '../ducks/data_base';

export function* getDataBase() {
  try {
    yield put(Creators.dataBaseRequest());
    const response = yield call(api.get, 'data-base');

    yield put(Creators.dataBaseSuccess(response.data));
  } catch (err) {
    yield put(Creators.dataBaseError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao listar bancos de dados',
    }));
  }
}

export function* postDataBase({ data }) {
  try {
    yield put(Creators.dataBaseInit());
    yield put(Creators.dataBaseRequest());
    const response = yield call(api.post, 'data-base', data);

    yield put(toastrActions.add({
      type: 'success',
      title: 'Sucesso',
      message: 'Banco de dados criado com sucesso!',
    }));

    yield put(Creators.dataBaseSuccess(response.data));
  } catch (err) {
    yield put(Creators.dataBaseError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao salvar banco de dados',
    }));
  }
}

export function* deleteDataBase({ id }) {
  try {
    yield put(Creators.dataBaseRequest());
    const response = yield call(api.delete, `data-base/${id}`);

    yield put(Creators.dataBaseSuccess(response.data));

    yield put(toastrActions.add({
      type: 'success',
      title: 'Sucesso',
      message: 'Banco de dados removido com sucesso!',
    }));
  } catch (err) {
    yield put(Creators.dataBaseError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao excluir banco de dados',
    }));
  }
}
