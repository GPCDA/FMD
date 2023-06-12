import { call, put } from 'redux-saga/effects';
import { actions as toastrActions } from 'react-redux-toastr';
import api from '../../services/api';
import { Creators } from '../ducks/data_base';

export function* getCartridge() {
  try {
    yield put(Creators.cartridgeRequest());
    const response = yield call(api.get, 'cartridge');

    yield put(Creators.cartridgeSuccess(response.data));
  } catch (err) {
    yield put(Creators.cartridgeError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao listar cartuchos',
    }));
  }
}

export function* postCartridge({ data }) {
  try {
    yield put(Creators.cartridgeInit());
    yield put(Creators.cartridgeRequest());
    const response = yield call(api.post, 'cartridge', data);

    yield put(toastrActions.add({
      type: 'success',
      title: 'Sucesso',
      message: 'Cartucho criado com sucesso!',
    }));

    yield put(Creators.cartridgeSuccess(response.data));
  } catch (err) {
    yield put(Creators.cartridgeError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao salvar cartucho',
    }));
  }
}

export function* putCartridge({ filter }) {
  try {
    yield put(Creators.cartridgeRequest());
    const response = yield call(api.put, 'cartridge', filter);

    yield put(Creators.cartridgeSuccess(response.data));

    yield put(toastrActions.add({
      type: 'success',
      title: 'Sucesso',
      message: 'Fonte de Cartucho alterado com sucesso!',
    }));
  } catch (err) {
    yield put(Creators.cartridgeError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao atualizar cartucho',
    }));
  }
}

export function* deleteCartridge({ id }) {
  try {
    yield put(Creators.cartridgeRequest());
    const response = yield call(api.delete, `cartridge/${id}`);

    yield put(Creators.cartridgeSuccess(response.data));

    yield put(toastrActions.add({
      type: 'success',
      title: 'Sucesso',
      message: 'Cartucho removido com sucesso!',
    }));
  } catch (err) {
    yield put(Creators.cartridgeError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao excluir cartucho',
    }));
  }
}
