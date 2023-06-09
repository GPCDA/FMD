import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as toastrActions } from 'react-redux-toastr';
import {
  DialogForm, DialogFormButtonContainer,
  DialogInput, DialogSpan,
} from '../../styles/global';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import { Creators as DataSourceActions } from '../../store/ducks/data_source';
import Dialog from '../Dialog';
import Button from '../../styles/Button';
import Upload from '../Upload';
import UploadFileList from '../UploadFileList';
import api from '../../services/api';

class DataSourceDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      uploadedFiles: [],
    };
  }

  onClose = () => {
    this.props.setDialog('dataSource');
    this.setState({ name: '', uploadedFiles: [] });
  }

  onCancel = () => {
    const { uploadedFiles } = this.state;

    uploadedFiles.forEach((file) => this.handleDelete(file.id));

    this.onClose();
  }

  handleDelete = async (id) => {
    await api.delete(`file/${id}`);

    this.setState((prevState) => ({
      ...prevState,
      uploadedFiles: prevState.uploadedFiles.filter((file) => file.id !== id),
    }));
  };

  renderWarningMsg = (msg) => {
    this.props.add({
      type: 'warning',
      title: 'Atenção',
      message: msg,
    });
  }

  handleChangeInput = (e) => this.setState({ [e.target.name]: e.target.value });

  submit = () => {
    const { name, uploadedFiles } = this.state;
    const fileId = uploadedFiles.map((file) => file.id);

    if (!name) {
      this.renderWarningMsg('Nome não informado');
      return;
    }

    if (!uploadedFiles.length) {
      this.renderWarningMsg('Nenhum arquivo importado');
      return;
    }

    this.props.postDataSource({ name, file_id: fileId[0] });
    this.onClose();
  }

  render() {
    const { name, uploadedFiles } = this.state;
    const { dataSource } = this.props.dialog;

    if (!dataSource) {
      return null;
    }

    return (
      <Dialog>
        <DialogForm>
          <h1>Adicionar Fonte de Dados</h1>

          <DialogSpan>Fonte de dados:</DialogSpan>
          <DialogInput
            value={name}
            autoComplete="off"
            onChange={this.handleChangeInput}
            name="name"
          />

          {!uploadedFiles.length && (
            <div style={{ paddingTop: '2vh' }}>
              <div style={{ paddingBottom: '.5vh' }}><DialogSpan>Arquivo:</DialogSpan></div>
              <Upload
                onUpload={(newUploadedFiles) => this.setState({ uploadedFiles: newUploadedFiles })}
                accept="text/csv"
                message="Arraste um arquivo CSV ou clique aqui."
              />
            </div>
          )}

          {!!uploadedFiles.length && (
            <UploadFileList
              files={uploadedFiles}
              onDelete={(newUploadedFiles) => this.setState({ uploadedFiles: newUploadedFiles })}
            />
          )}

          {!uploadedFiles.length && (
            <div style={{ paddingTop: '.5vh' }}>
              <h2 style={{ fontWeight: 500 }}>* Arquivo deve estar separado por vírgulas</h2>
              <h2 style={{ fontWeight: 500 }}>* Primeira linha deve ser o cabeçalho</h2>
              <h2 style={{ fontWeight: 500 }}>* As variáveis alvo devem ser numéricas</h2>
            </div>
          )}

          <DialogFormButtonContainer>
            <Button onClick={this.submit.bind(this)}>Salvar</Button>
            <Button style={{ marginLeft: '1vw' }} color="gray" isCancel onClick={this.onCancel}>Cancelar</Button>
          </DialogFormButtonContainer>

        </DialogForm>
      </Dialog>
    );
  }
}

const mapStateToProps = ({ dialog }) => ({ dialog });

export default connect(
  mapStateToProps,
  {
    ...DialogActions,
    ...toastrActions,
    ...DataSourceActions,
  },
)(DataSourceDialog);
