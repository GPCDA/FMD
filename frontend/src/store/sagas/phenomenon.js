import { call, put } from 'redux-saga/effects';
import { actions as toastrActions } from 'react-redux-toastr';
import api from '../../services/api';
import { Creators } from '../ducks/phenomenon';

export function* getPhenomenon() {
  try {
    yield put(Creators.phenomenonRequest());
    const response = yield call(api.get, 'phenomenon');

    yield put(Creators.phenomenonSuccess(response.data));
  } catch (err) {
    yield put(Creators.phenomenonError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao listar fenômenos educacionais',
    }));
  }
}
