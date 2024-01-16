import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { actions as toastrActions } from 'react-redux-toastr';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from 'react-feather/dist/icons/check';
import EyeIcon from 'react-feather/dist/icons/eye';
import ToolIcon from 'react-feather/dist/icons/tool';
import HelpIcon from 'react-feather/dist/icons/help-circle';
import DeleteIcon from 'react-feather/dist/icons/trash-2';
import Tour from 'reactour';
import { ProgressSpinner } from 'primereact/progressspinner';
import UploadIcon from 'react-feather/dist/icons/upload';

import { CardContainer } from './styles';
import AlertDialog from '../AlertDialog';
import Upload from '../Upload';
import {
  primaryColor, Header, StatusMsgContainer, fontFamily, CodeText,
} from '../../styles/global';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import { Creators as ContextActions } from '../../store/ducks/context';
import { ConfigContainer } from '../../styles/ConfigContainer';
import ContextShowDialog from '../ContextShowDialog';
import ContextEditDialog from '../ContextEditDialog';

const JSON_MIME_TYPES = [
  'application/json',
  'application/ld+json',
];

class Context extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadedFiles: [],
    };
  }

  componentDidMount() {
    this.props.getContext();
  }

  handleShowContext = (data) => this.props.setDialog('contextShow', data)

  handleEditContext = (data) => this.props.setDialog('contextEdit', data)

  renderCardContext = (item, idx) => (
    <Card className="lms-card" key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
      <CardActionArea style={{ flex: 1 }}>
        <CardContent style={{ color: primaryColor }}>
          <Typography gutterBottom variant="h5" component="h2" style={{ fontFamily }}>
            {item.name}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ backgroundColor: primaryColor }}>
        <IconButton onClick={() => this.handleShowContext(item)}>
          <EyeIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={() => this.handleEditContext(item)}>
          <ToolIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={this.handleMsgDelete.bind(this, item, 'Você realmente deseja excluir este contexto?')}>
          <DeleteIcon size={20} color="#FFF" />
        </IconButton>
      </CardActions>
    </Card>
  )

  // Handles do react tour geral do contexto, para abrir e fechar o tour

  handleStartTourContextoGeral = () => {
    this.setState({ isTourContextoGeralOpen: true });
  };

  handleTourCloseContextoGeral = () => {
    this.setState({ isTourContextoGeralOpen: false });
  };

  handleMsgDelete = (item, message = '') => {
    this.setState({ selectedItem: item });

    this.props.setDialog('alert', { description: message });
  }

  handleDelete = () => {
    const { selectedItem } = this.state;

    if (!selectedItem?.id) return;
    this.props.deleteContext(selectedItem.id);
  }

  render() {
    const { context } = this.props;
    const { uploadedFiles } = this.state;
    const loadingContext = !!context.loading;
    const hasContext = !!context.data.length;

    const stepsContextoGeral = [
      {
        selector: '#contextos-titulo',
        content: 'A seção de upload de contextos serve para que você adicione as informações necessárias para a análise dos dados.',
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
      {
        selector: '#upload-json',
        content: (
          <div style={{ flexWrap: 'wrap', display: 'flex', wordBreak: 'break-word' }}>
            <p>Para utilização basta fazer o upload de um arquivo de formato JSON no molde correto.</p>
            <br />
            <p>Você pode encontrar um exemplo de arquivo na Seção 4 do README do projeto no link:</p>
            <br />
            <CodeText>
              <code>https://github.com/machamilton/fmdev</code>
            </CodeText>
          </div>
        ),
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
    ];

    return (
      <PerfectScrollbar style={{ width: '100%', overflowX: 'auto' }}>
        <ConfigContainer size="big" style={{ color: '#000' }}>

          <Header>
            <h1 id="contextos-titulo">Contextos</h1>
            <spam><HelpIcon size={20} color="#000" style={{ cursor: 'pointer' }} onClick={this.handleStartTourContextoGeral} /></spam>
          </Header>

          {!uploadedFiles.length && (
          <div id="upload-json" style={{ padding: '2rem' }}>
            <Upload
              serverUpload={(data, callback) => this.props.postContext(data, (newFileValues) => {
                callback(newFileValues);
                this.setState((prevState) => ({ ...prevState, uploadedFiles: [] }));
              })}
              onUpload={(newUploadedFiles) => this.setState({ uploadedFiles: newUploadedFiles })}
              accept={JSON_MIME_TYPES}
              message={(
                <span style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                }}
                >
                  <UploadIcon color="#4A5173B8" strokeWidth={2} size={48} />
                  <i>Upload de arquivos...</i>
                </span>
            )}
            />
          </div>
          )}

          <CardContainer>{context.data.map((item, idx) => this.renderCardContext(item, idx))}</CardContainer>

          {!!(loadingContext || uploadedFiles.length) && (
          <StatusMsgContainer>
            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#EEEEEE" animationDuration=".5s" />
          </StatusMsgContainer>
          )}

          {!hasContext && !loadingContext && (
          <StatusMsgContainer>Nenhum contexto cadastrado</StatusMsgContainer>
          )}
          <AlertDialog onSubmit={this.handleDelete} />
          <ContextShowDialog />
          <ContextEditDialog />
        </ConfigContainer>
        {/* Componente do tour do contexto geral */}
        <Tour
          steps={stepsContextoGeral}
          isOpen={this.state.isTourContextoGeralOpen}
          onRequestClose={this.handleTourCloseContextoGeral}
          rounded={10}
          startAt={0}
          lastStepNextButton={<IconButton><CheckIcon size={20} color="#000" /></IconButton>}
          className="tour"
        />
      </PerfectScrollbar>
    );
  }
}

const mapStateToProps = ({ context }) => ({ context });

export default connect(mapStateToProps,
  {
    ...toastrActions,
    ...DialogActions,
    ...ContextActions,
  })(Context);
