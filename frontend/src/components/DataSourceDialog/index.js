import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as toastrActions } from 'react-redux-toastr';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
  DialogFormButtonContainer, DialogHeader,
  DialogDotStepper, DialogDotStep, WaitingContainerBackdrop,
} from '../../styles/global';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import { Creators as DataSourceActions } from '../../store/ducks/data_source';
import { Creators as DataBaseConnectionActions } from '../../store/ducks/data_base_connection';
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
        fieldMap: {},
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
        fieldMap: {},
      },
    });
  }

  onCancel = () => {
    const { file } = this.state;
    file.uploadedFiles.forEach((uploadedFile) => this.handleDelete(uploadedFile.id));

    this.onClose();
  }

  handleNextStep = () => {
    const { selectedDataSourceType, database, currentStep } = this.state;
    const steps = {
      0: () => {
        if (selectedDataSourceType === DATA_BASE) {
          this.props.postDataBaseConnectionFields({
            url: database.url,
            driver: database.driver.value,
            user: database.user,
            password: database.password,
            query: database.query,
          }, () => {
            this.setState((prevState) => ({ ...prevState, currentStep: prevState.currentStep + 1 }));
          });
          return;
        }
        this.setState((prevState) => ({ ...prevState, currentStep: prevState.currentStep + 1 }));
      },
    };
    const handleNextStepFunction = steps[currentStep];
    if (handleNextStepFunction) return handleNextStepFunction();
    return this.setState((prevState) => ({ ...prevState, currentStep: prevState.currentStep + 1 }));
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

  renderWarningMsg = (msg, shouldAlert = true) => {
    if (!shouldAlert) return;
    this.props.add({
      type: 'warning',
      title: 'Atenção',
      message: msg,
    });
  }

  handleValidateFields = (shouldAlert = false) => {
    const {
      name, selectedDataSourceType, database, file, contextMap, currentStep,
    } = this.state;
    const { data: contexts } = this.props.context;

    if (!name) {
      this.renderWarningMsg('Nome não informado', shouldAlert);
      return false;
    }

    const dataSourcesFields = {
      [DATA_BASE]: () => {
        if (!database.url) {
          this.renderWarningMsg('URL não informado', shouldAlert);
        } else if (!database.driver) {
          this.renderWarningMsg('Driver não informado', shouldAlert);
        } else if (!database.user) {
          this.renderWarningMsg('Usuário não informado', shouldAlert);
        } else if (!database.password) {
          this.renderWarningMsg('Senha não informada', shouldAlert);
        } else if (!database.query) {
          this.renderWarningMsg('Consulta não informada', shouldAlert);
        }

        return database.url && database.driver && database.user && database.password && database.query;
      },
      [CSV]: () => {
        if (!file.uploadedFiles.length) {
          this.renderWarningMsg('Nenhum arquivo importado', shouldAlert);
        }
        return !!file.uploadedFiles.length && !!file.uploadedFiles[0].id;
      },
    };
    const validateFields = dataSourcesFields[selectedDataSourceType];

    const validateContextFields = () => {
      if (!contextMap.context) {
        this.renderWarningMsg('Contexto não informado', shouldAlert);
      }
      const contextFieldsValue = contexts?.find((context) => context.id === contextMap.context.value)?.fields;

      const hasEmptyField = Object.entries(contextMap.fieldMap).some(([fieldKey, fieldValue]) => {
        if (!fieldValue) {
          const fieldObject = contextFieldsValue.find((field) => field.code === fieldKey);
          this.renderWarningMsg(`"${fieldObject.description || fieldKey}" não informado`, shouldAlert);
          return true;
        }
        return false;
      });

      return Boolean(contextMap.context && !hasEmptyField);
    };

    switch (currentStep) {
      case 1:
        if (!validateContextFields()) return false;
        // falls through

      case 0:
        return validateFields ? validateFields() : true;

      default: return true;
    }
  }

  submit = () => {
    const {
      name, selectedDataSourceType, database, file, contextMap,
    } = this.state;
    if (!this.handleValidateFields(true)) return;

    const fileId = file.uploadedFiles.map((uploadedFile) => uploadedFile.id);
    this.props.postDataSource({
      name, type: selectedDataSourceType, file_id: fileId[0], database, contextMap,
    });
    this.onClose();
  }

  render() {
    const {
      steps, currentStep, selectedDataSourceType, name, database, file, contextMap,
    } = this.state;
    const { dataSource } = this.props.dialog;
    const { currentDatasourceFields } = this.props.data_source;
    const { data: contexts } = this.props.context;
    const { data: dataBaseFields, loading: databaseConnectionLoading } = this.props.data_base_connection;

    if (!dataSource) return null;

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
        fields: dataBaseFields,
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
          {
            databaseConnectionLoading && (
              <WaitingContainerBackdrop>
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#EEEEEE" animationDuration=".5s" />
              </WaitingContainerBackdrop>
            )
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

const mapStateToProps = ({
  dialog, data_source, context, data_base_connection,
}) => ({
  dialog, data_source, context, data_base_connection,
});

export default connect(
  mapStateToProps,
  {
    ...DialogActions,
    ...toastrActions,
    ...DataSourceActions,
    ...DataBaseConnectionActions,
  },
)(DataSourceDialog);
