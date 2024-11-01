import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as toastrActions } from 'react-redux-toastr';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
  DialogForm, DialogFormButtonContainer,
  DialogInput, DialogSpan,
} from '../../styles/global';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import Dialog from '../Dialog';
import Button from '../../styles/Button';
import { Creators as TrainModelActions } from '../../store/ducks/train_model';

class TrainModelSaveDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
    };
  }

  onClose = () => {
    this.props.setDialog('trainSave');
  }

  renderWarningMsg = (msg) => {
    this.props.add({
      type: 'warning',
      title: 'Atenção',
      message: msg,
    });
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  submit = () => {
    const { path } = this.props.pre_processing;
    const { score } = this.props.train.data;
    const { name, description } = this.state;

    if (!name || !description) {
      this.renderWarningMsg('Por favor, preencha todos os campos!');
      return;
    }

    this.props.postTrainModel({
      name,
      description,
      path,
      score: score || null,
    });
  }

  render() {
    const { loading } = this.props.train_model;
    const { name, description } = this.state;
    const { trainSave } = this.props.dialog;

    if (!trainSave) {
      return null;
    }

    return (
      <Dialog>
        <DialogForm>
          <h1>{loading ? 'Salvando Modelo...' : 'Salvar Modelo'}</h1>

          {loading
            ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', height: '15vh',
              }}
              >
                <ProgressSpinner style={{ width: '30px', height: '30px' }} strokeWidth="4" animationDuration=".5s" />
              </div>
            )
            : null}

          {!loading ? <DialogSpan>Nome do modelo</DialogSpan> : null}
          {!loading ? (
            <DialogInput
              value={name}
              autoComplete="off"
              onChange={this.handleChange}
              name="name"
            />
          ) : null}

          {!loading ? <DialogSpan>Detalhes do modelo</DialogSpan> : null}
          {!loading ? (
            <DialogInput
              value={description}
              autoComplete="off"
              onChange={this.handleChange}
              name="description"
            />
          ) : null}

          {!loading ? (
            <DialogFormButtonContainer>
              <Button onClick={this.submit.bind(this)}>Salvar</Button>
              <Button style={{ marginLeft: '1vw' }} color="gray" isCancel onClick={this.onClose}>Cancelar</Button>
            </DialogFormButtonContainer>
          ) : null}

        </DialogForm>
      </Dialog>
    );
  }
}

const mapStateToProps = ({
  dialog, train_model, pre_processing, train,
}) => ({
  dialog, train_model, pre_processing, train,
});

export default connect(
  mapStateToProps, { ...DialogActions, ...toastrActions, ...TrainModelActions },
)(TrainModelSaveDialog);
