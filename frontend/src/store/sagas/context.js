import { call, put } from 'redux-saga/effects';
import { actions as toastrActions } from 'react-redux-toastr';
import api from '../../services/api';
import { Creators } from '../ducks/data_base';

export function* getContext() {
  try {
    yield put(Creators.contextRequest());
    const response = yield call(api.get, 'context');

    yield put(Creators.contextSuccess(response.data));
  } catch (err) {
    yield put(Creators.contextError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao listar contextos',
    }));
  }
}

export function* postContext({ data }) {
  try {
    yield put(Creators.contextInit());
    yield put(Creators.contextRequest());
    const response = yield call(api.post, 'context', data);

    yield put(toastrActions.add({
      type: 'success',
      title: 'Sucesso',
      message: 'Contexto criado com sucesso!',
    }));

    yield put(Creators.contextSuccess(response.data));
  } catch (err) {
    yield put(Creators.contextError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao salvar contexto',
    }));
  }
}

export function* putContext({ filter }) {
  try {
    yield put(Creators.contextRequest());
    const response = yield call(api.put, 'context', filter);

    yield put(Creators.contextSuccess(response.data));

    yield put(toastrActions.add({
      type: 'success',
      title: 'Sucesso',
      message: 'Fonte de Contexto alterado com sucesso!',
    }));
  } catch (err) {
    yield put(Creators.contextError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao atualizar contexto',
    }));
  }
}

export function* deleteContext({ id }) {
  try {
    yield put(Creators.contextRequest());
    const response = yield call(api.delete, `context/${id}`);

    yield put(Creators.contextSuccess(response.data));

    yield put(toastrActions.add({
      type: 'success',
      title: 'Sucesso',
      message: 'Contexto removido com sucesso!',
    }));
  } catch (err) {
    yield put(Creators.contextError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao excluir contexto',
    }));
  }
}
