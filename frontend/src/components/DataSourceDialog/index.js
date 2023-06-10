import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as toastrActions } from 'react-redux-toastr';
import {
  DialogFormButtonContainer, DialogHeader,
  DialogDotStepper, DialogDotStep,
} from '../../styles/global';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import { Creators as DataSourceActions } from '../../store/ducks/data_source';
import Dialog from '../Dialog';
import Button from '../../styles/Button';
import api from '../../services/api';
import SelectDataSourceType from './Steps/SelectDataSourceType';
import { Database, File } from './Steps/DataSources';
import { CSV, DATA_BASE } from '../../constants';

class DataSourceDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      steps: 3,

      selectedDataSourceType: DATA_BASE,

      name: '',
      database: {
        url: '',
        user: '',
        password: '',
        query: '',
      },
      file: {
        uploadedFiles: [],
      },
    };
  }

  onClose = () => {
    this.props.setDialog('dataSource');
    this.setState({
      currentStep: 0,
      steps: 3,

      selectedDataSourceType: DATA_BASE,

      name: '',
      database: {
        url: '',
        user: '',
        password: '',
        query: '',
      },
      file: {
        uploadedFiles: [],
      },
    });
  }

  onCancel = () => {
    const { file } = this.state;
    file.uploadedFiles.forEach((uploadedFile) => this.handleDelete(uploadedFile.id));

    this.onClose();
  }

  handleNextStep = () => {
    this.setState((prevState) => ({ ...prevState, currentStep: prevState.currentStep + 1 }));
  }

  handlePreviousStep = () => {
    this.setState((prevState) => ({ ...prevState, currentStep: prevState.currentStep - 1 }));
  }

  handleDelete = async (id) => {
    await api.delete(`file/${id}`);

    this.setState((prevState) => ({
      ...prevState,
      file: {
        ...prevState.file,
        uploadedFiles: prevState.file.uploadedFiles.filter((file) => file.id !== id),
      },
    }));
  };

  renderWarningMsg = (msg) => {
    this.props.add({
      type: 'warning',
      title: 'Atenção',
      message: msg,
    });
  }

  handleValidateFields = (shouldAlert = false) => {
    const {
      name, currentStep, selectedDataSourceType, database, file,
    } = this.state;

    if (!currentStep) return true;

    if (!name) {
      if (shouldAlert) this.renderWarningMsg('Nome não informado');
      return false;
    }

    const dataSourcesFields = {
      [DATA_BASE]: () => {
        if (!database.url) {
          if (shouldAlert) this.renderWarningMsg('URL não informado');
        /* } else if (!database.user) {
          if (shouldAlert) this.renderWarningMsg('Usuário não informado');
        } else if (!database.password) {
          if (shouldAlert) this.renderWarningMsg('Senha não informada'); */
        } else if (!database.query) {
          if (shouldAlert) this.renderWarningMsg('Consulta não informada');
        }

        return !database.url || !database.user || !database.password || !database.query;
      },
      [CSV]: () => {
        if (!file.uploadedFiles.length) {
          if (shouldAlert) this.renderWarningMsg('Nenhum arquivo importado');
        }
        return !file.uploadedFiles.length;
      },
    };

    const validateFields = dataSourcesFields[selectedDataSourceType];

    if (validateFields) return validateFields();
    return true;
  }

  submit = () => {
    const { name, uploadedFiles } = this.state;
    const fileId = uploadedFiles.map((file) => file.id);

    // if (!this.handleValidateFields(true)) return;

    this.props.postDataSource({ name, file_id: fileId[0] });
    this.onClose();
  }

  render() {
    const {
      steps, currentStep, selectedDataSourceType, name, database, file,
    } = this.state;
    const { dataSource } = this.props.dialog;

    if (!dataSource) {
      return null;
    }

    const dataSources = {
      [DATA_BASE]: {
        header: <h1>Conexão com Banco de Dados</h1>,
        body: <Database
          name={name}
          setName={(newName) => (
            this.setState((prevState) => ({ ...prevState, name: newName }))
          )}
          database={database}
          setDatabase={(newDatabase) => (
            this.setState((prevState) => ({ ...prevState, database: newDatabase }))
          )}
        />,
      },
      [CSV]: {
        header: <h1>Upload de arquivo</h1>,
        body: <File
          name={name}
          setName={(newName) => (
            this.setState((prevState) => ({ ...prevState, name: newName }))
          )}
          file={file}
          setFile={(newFile) => (
            this.setState((prevState) => ({ ...prevState, file: newFile }))
          )}
        />,
      },
    };

    const dataSourceComponent = dataSources[selectedDataSourceType] || { header: <h1>Fonte de dados não encontrada.</h1> };

    const stepsComponents = [
      {
        header: <h1>Selecione o tipo de fonte desejado</h1>,
        body: <SelectDataSourceType
          defaultValue={selectedDataSourceType}
          setSelectedValue={(datasourceType) => (
            this.setState((prevState) => ({
              ...prevState,
              selectedDataSourceType: datasourceType,
            }))
          )}
        />,
      },
      dataSourceComponent,
    ];

    return (
      <Dialog size="big">
        <DialogHeader>
          {stepsComponents[currentStep]?.header}
        </DialogHeader>

        {stepsComponents[currentStep]?.body}

        <DialogFormButtonContainer>
          <Button color="danger" isCancel onClick={this.onCancel}>Cancelar</Button>
          {
            !!currentStep && (
              <Button color="gray" onClick={this.handlePreviousStep}>Voltar</Button>
            )
          }
          {
            currentStep === (steps - 1) ? (
              <Button onClick={this.onCancel}>Salvar</Button>
            ) : <Button onClick={this.handleNextStep} disabled={!this.handleValidateFields()}>Avançar</Button>
          }
        </DialogFormButtonContainer>

        <DialogDotStepper>
          {Array.from({ length: steps }, (_, index) => (
            <DialogDotStep key={index} active={currentStep === index} />
          ))}
        </DialogDotStepper>
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
