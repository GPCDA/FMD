import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { actions as toastrActions } from 'react-redux-toastr';
import { ProgressSpinner } from 'primereact/progressspinner';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from 'react-feather/dist/icons/check';
import Tour from 'reactour';
import HelpIcon from 'react-feather/dist/icons/help-circle';
import {
  DialogFormButtonContainer, DialogHeader,
  DialogDotStepper, DialogDotStep, WaitingContainerBackdrop, CodeText,
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
      isTourContextosOpen: false,
      isTourCSVOpen: false,
      selectedDataSourceType: DATA_BASE,

      name: '',
      database: {
        url: '',
        driver: null,
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

  // Handles do react tour, para abrir e fechar o tour do banco de dados
  handleStartTour = () => {
    this.setState({ isTourOpen: true });
  };

  handleTourClose = () => {
    this.setState({ isTourOpen: false });
  };

  // Handles do react tour, para abrir e fechar o tour do mapeamento de contextos
  handleStartTourContextos = () => {
    this.setState({ isTourContextosOpen: true });
  };

  handleTourCloseContextos = () => {
    this.setState({ isTourContextosOpen: false });
  };

  // Handles do react tour, para abrir e fechar o tour de Upload de CSV
  handleStartTourCSV = () => {
    this.setState({ isTourCSVOpen: true });
  };

  handleTourCloseCSV = () => {
    this.setState({ isTourCSVOpen: false });
  };

  onClose = () => {
    this.props.setDialog('dataSource');
    this.setState({
      currentStep: 0,
      steps: 2,

      selectedDataSourceType: DATA_BASE,

      name: '',
      database: {
        url: '',
        driver: null,
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

      const hasEmptyField = Object.entries(contextMap.fieldMap).some(([fieldKey, fieldValue]) => {
        if (!fieldValue) {
          this.renderWarningMsg(`"${fieldKey}" não informado`, shouldAlert);
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
    const sendDatabase = { ...database, driver: database.driver?.label };
    const sendContextMap = { ...contextMap, context: contextMap.context?.value };
    this.props.postDataSource({
      name, type: selectedDataSourceType, file_id: fileId[0], database: sendDatabase, contextMap: sendContextMap,
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
        header: (<div
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: '0.5rem',
          }}
        >
          <h1>Conexão com Banco de Dados</h1>
          <spam><HelpIcon size={20} color="#000" style={{ cursor: 'pointer' }} onClick={this.handleStartTour} /></spam>
          {/* eslint-disable-next-line react/jsx-closing-tag-location */}
        </div>),
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
        header: (<div
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: '0.5rem',
          }}
        >
          <h1>Upload de Arquivo</h1>
          <spam><HelpIcon size={20} color="#000" style={{ cursor: 'pointer' }} onClick={this.handleStartTourCSV} /></spam>
          {/* eslint-disable-next-line react/jsx-closing-tag-location */}
        </div>),
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

    const dataSourceComponent = dataSources[selectedDataSourceType] || { header: <h1>Fonte de dados não encontrada.</h1>, fields: [] };

    const stepsComponents = [
      dataSourceComponent,
      {
        header: (<div
          style={{
            display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: '0.5rem',
          }}
        >
          <h1 className="titulo-contexto">Mapeamento de Contexto</h1>
          <spam><HelpIcon size={20} color="#000" style={{ cursor: 'pointer' }} onClick={this.handleStartTourContextos} /></spam>
          {/* eslint-disable-next-line react/jsx-closing-tag-location */}
        </div>),
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

    // Passos do tour de conexão com banco de dados. O selector representa a classe selecionada durante o tour e content, o conteúdo a ser apresentado.
    const stepsTour = [
      {
        selector: '.fonte-dados',
        content: 'Primeiro é necessário definir o nome da fonte de dados.',
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
      {
        selector: '.url-conexao',
        content: () => (
          <div style={{ flexWrap: 'wrap', display: 'flex', wordBreak: 'break-word' }}>
            <p>Em seguida deve ser definida a URL de conexão com banco de dados:</p>
            <br />
            <p>
              Para um MySQL:
              <br />
              <CodeText><code>jdbc:mysql://host:porta/base_de_dados</code></CodeText>
              <br />
            </p>
            <p>
              Para um Oracle:
              <br />
              <CodeText><code>jdbc:oracle://host:porta/sid</code></CodeText>
              <br />
            </p>
            <p>
              Para um PostgreSQL:
              <br />
              <CodeText><code>jdbc:postgresql://host:porta/base_de_dados</code></CodeText>
              <br />
            </p>
          </div>
        ),
        style: {
          color: '#000',
        },
      },
      {
        selector: '.driver-conexao',
        content: () => (
          <div style={{ flexWrap: 'wrap' }}>
            <p>Então deve ser escolhido o Banco de Dados que se deseja conectar.</p>
            <br />
            <p>As opções disponíveis são: PostgreSQL, MySQL ou Oracle.</p>
          </div>
        ),
        style: {
          color: '#000',
        },
      },
      {
        selector: '.usuario-db',
        content: 'Preencha o usuário da conexão.',
        style: {
          color: '#000',
        },
      },
      {
        selector: '.senha-db',
        content: 'Preencha a senha da conexão.',
        style: {
          color: '#000',
        },
      },
      {
        selector: '.consulta-db',
        content: () => (
          <div>
            <p>Por último deve ser preenchida a consulta aos dados.</p>
            <br />
            <p>Normalmente definida como:</p>
            <CodeText>
              <pre>
                <code>
                  select DADOS
                  from TABELA
                </code>
              </pre>

            </CodeText>
            <br />
            <p>Caso ache necessário você pode testar a conexão para validá-la clicando no botão Testar!</p>
            <br />
          </div>
        ),
        style: {
          color: '#000',
        },
      },
      // ...
    ];

    // Passos do tour de mapeamento de contextos. O selector representa a classe selecionada durante o tour e content, o conteúdo a ser apresentado.
    const stepsTourContextos = [
      {
        selector: '.titulo-contexto',
        content: 'Na etapa de Mapeamento de Contexto devem ser identificados na base de dados os campos necessários para a análise de um determinado contexto.',
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
      {
        selector: '.seletor-contexto',
        content: 'Ao selecionar o contexto serão visualizados na coluna da esquerda os campos necessários e você deverá fazer a correspondência dos mesmos na coluna da direita.',
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
    ];

    // Passos do tour de upload de arquivo CSV. O selector representa a classe selecionada durante o tour e content, o conteúdo a ser apresentado.
    const stepsTourCSV = [
      {
        selector: '.fonte-dados-csv',
        content: 'Primeiro é necessário definir o nome da fonte de dados.',
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
      {
        selector: '.upload-arquivo',
        content: () => (
          <div style={{ flexWrap: 'wrap' }}>
            <p>Em seguida deve ser feito o upload dos dados em um arquivo de texto separado por vírgulas, ou CSV.</p>
            <br />
            <p>Atente-se para as observações sobre o arquivo!</p>
            <br />
            <p>* Arquivo deve estar separado por vírgulas</p>
            <p>* Primeira linha deve ser o cabeçalho</p>
            <p>* As variáveis alvo devem ser numéricas</p>
          </div>
        ),
        style: {
          color: '#000',
          padding: '2.2rem',
        },
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
        {/* Componente do tour de conexão com banco de dados */}
        <Tour
          steps={stepsTour}
          isOpen={this.state.isTourOpen}
          onRequestClose={this.handleTourClose}
          rounded={10}
          startAt={0}
          lastStepNextButton={<IconButton><CheckIcon size={20} color="#000" /></IconButton>}
          className="tour"
        />
        {/* Componente do tour de mapeamento de contextos */}
        <Tour
          steps={stepsTourContextos}
          isOpen={this.state.isTourContextosOpen}
          onRequestClose={this.handleTourCloseContextos}
          rounded={10}
          startAt={0}
          lastStepNextButton={<IconButton><CheckIcon size={20} color="#000" /></IconButton>}
          className="tour"
        />
        {/* Componente do tour de mapeamento de contextos */}
        <Tour
          steps={stepsTourCSV}
          isOpen={this.state.isTourCSVOpen}
          onRequestClose={this.handleTourCloseCSV}
          rounded={10}
          startAt={0}
          lastStepNextButton={<IconButton><CheckIcon size={20} color="#000" /></IconButton>}
          className="tour"
        />
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
