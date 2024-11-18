import { call, put } from 'redux-saga/effects';
import { actions as toastrActions } from 'react-redux-toastr';
import api from '../../services/api';
import { Creators } from '../ducks/chart';

export function* getChart({ filter }) {
  try {
    yield put(Creators.chartRequest());
    const response = yield call(api.post, 'chart', filter);

    yield put(Creators.chartSuccess(response.data, filter.chartType));
  } catch (err) {
    yield put(Creators.chartError({ err }));
    yield put(toastrActions.add({
      type: 'error',
      title: 'Erro',
      message: 'Falha ao exibir gráfico',
    }));
  }
}
