import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as toastrActions } from 'react-redux-toastr';
import {
  DialogFormButtonContainer, DialogHeader,
  DialogDotStepper, DialogDotStep,
} from '../../styles/global';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import { Creators as DataSourceActions } from '../../store/ducks/data_source';
import { Creators as ContextActions } from '../../store/ducks/context';
import Dialog from '../Dialog';
import Button from '../../styles/Button';
import api from '../../services/api';
import { Database, File, ContextMap } from './Steps';
import { CSV, DATA_BASE } from '../../constants';

class DataSourceDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      steps: 2,

      selectedDataSourceType: DATA_BASE,

      name: '',
      database: {
        url: '',
        driver: '',
        user: '',
        password: '',
        query: '',
      },
      file: {
        uploadedFiles: [],
      },
      contextMap: {
        context: null,
        fieldMap: [],
      },
    };
    props.getContext();
  }

  componentDidUpdate(prevProps, prevState/* , snapshot */) {
    const { dataSource, data } = this.props.dialog;
    if (!prevProps.dialog.dataSource && !!dataSource && !!data) {
      this.setState({ selectedDataSourceType: data.selectedDataSourceType });
    }

    const uploadedFileId = this.state.file.uploadedFiles[0]?.id;
    if (
      this.state.selectedDataSourceType === CSV
      && prevState.file.uploadedFiles !== this.state.file.uploadedFiles
      && (uploadedFileId !== null && uploadedFileId !== undefined)
    ) {
      this.props.getDataSourceFields(uploadedFileId);
    }
  }

  onClose = () => {
    this.props.setDialog('dataSource');
    this.setState({
      currentStep: 0,
      steps: 2,

      selectedDataSourceType: DATA_BASE,

      name: '',
      database: {
        url: '',
        driver: '',
        user: '',
        password: '',
        query: '',
      },
      file: {
        uploadedFiles: [],
      },
      contextMap: {
        context: null,
        fieldMap: [],
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
      name, selectedDataSourceType, database, file,
    } = this.state;

    if (!name) {
      if (shouldAlert) this.renderWarningMsg('Nome não informado');
      return false;
    }

    const dataSourcesFields = {
      [DATA_BASE]: () => {
        if (!database.url) {
          if (shouldAlert) this.renderWarningMsg('URL não informado');
        } if (!database.driver) {
          if (shouldAlert) this.renderWarningMsg('Driver não informado');
        } else if (!database.user) {
          if (shouldAlert) this.renderWarningMsg('Usuário não informado');
        } else if (!database.password) {
          if (shouldAlert) this.renderWarningMsg('Senha não informada');
        } else if (!database.query) {
          if (shouldAlert) this.renderWarningMsg('Consulta não informada');
        }

        return database.url && database.driver && database.user && database.password && database.query;
      },
      [CSV]: () => {
        if (!file.uploadedFiles.length) {
          if (shouldAlert) this.renderWarningMsg('Nenhum arquivo importado');
        }
        return !!file.uploadedFiles.length && !!file.uploadedFiles[0].id;
      },
    };

    const validateFields = dataSourcesFields[selectedDataSourceType];

    if (validateFields) return validateFields();
    return true;
  }

  submit = () => {
    const { name, uploadedFiles } = this.state;
    const fileId = uploadedFiles.map((file) => file.id);

    if (!this.handleValidateFields(true)) return;

    this.props.postDataSource({ name, file_id: fileId[0] });
    this.onClose();
  }

  render() {
    const {
      steps, currentStep, selectedDataSourceType, name, database, file, contextMap,
    } = this.state;
    const { dataSource } = this.props.dialog;
    const { currentDatasourceFields } = this.props.data_source;
    const { data: contexts } = this.props.context;

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
        fields: currentDatasourceFields,
      },
      [CSV]: {
        header: <h1>Upload de arquivo</h1>,
        body: <File
          name={name}
          setName={(newName) => (
            this.setState((prevState) => ({ ...prevState, name: newName }))
          )}
          file={file}
          setFile={(callback) => this.setState((prevState) => ({ ...prevState, file: callback(prevState.file) }))}
        />,
        fields: currentDatasourceFields,
      },
    };

    const dataSourceComponent = dataSources[selectedDataSourceType] || { header: <h1>Fonte de dados não encontrada.</h1> };

    const stepsComponents = [
      dataSourceComponent,
      {
        header: <h1>Mapeamento de Contexto</h1>,
        body: <ContextMap
          contexts={contexts.asMutable()}
          contextMap={contextMap}
          setContextMap={(newContextMap) => (
            this.setState((prevState) => ({ ...prevState, contextMap: newContextMap }))
          )}
          datasourceFields={dataSourceComponent.fields.asMutable()}
        />,
      },
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
              <Button onClick={this.submit}>Salvar</Button>
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

const mapStateToProps = ({ dialog, data_source, context }) => ({ dialog, data_source, context });

export default connect(
  mapStateToProps,
  {
    ...DialogActions,
    ...toastrActions,
    ...DataSourceActions,
    ...ContextActions,
  },
)(DataSourceDialog);
