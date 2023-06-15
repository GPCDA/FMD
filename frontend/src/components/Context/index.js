import React, { Component } from 'react';
import { connect } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { actions as toastrActions } from 'react-redux-toastr';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import EyeIcon from 'react-feather/dist/icons/eye';
import DeleteIcon from 'react-feather/dist/icons/trash-2';
import { ProgressSpinner } from 'primereact/progressspinner';
import UploadIcon from 'react-feather/dist/icons/upload';

import { CardContainer } from './styles';
import AlertDialog from '../AlertDialog';
import Upload from '../Upload';
import {
  primaryColor, Header, StatusMsgContainer, fontFamily,
} from '../../styles/global';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import { Creators as ContextActions } from '../../store/ducks/context';
import { ConfigContainer } from '../../styles/ConfigContainer';
import api from '../../services/api';

// const XML_MIME_TYPES = [
//   'application/xml',
//   'text/xml',
//   'application/atom+xml',
//   'application/xhtml+xml',
//   'application/xslt+xml',
//   'image/svg+xml',
//   'application/mathml+xml',
//   'application/rss+xml',
//   'application/akn+xml',
//   'application/rif+xml',
// ];
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

  //   handleMenuItemClose = () => this.setState({ anchorEl: null });

  //   handleClickMenu = (item, event) => {
  //     this.setState({ anchorEl: event.currentTarget, itemSelected: item });
  //   };

    renderCardContext = (item, idx) => (
      <Card className="lms-card" key={idx}>
        <CardActionArea>
          <CardContent style={{ color: primaryColor }}>
            <Typography gutterBottom variant="h5" component="h2" style={{ fontFamily }}>
              {item.name}
            </Typography>
            {/* <Typography variant="body2" color="textSecondary" component="p" style={{ color: primaryColor, fontFamily, fontSize: '10px' }}>
              <b>Importado em:</b>
              {' '}
              {moment(item.created_at).format('DD/MM/YYYY HH:mm')}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p" style={{ color: primaryColor, fontFamily, fontSize: '10px' }}>
              <b>Tamanho:</b>
              {' '}
              {{filesize(item.size)}}
            </Typography> */}
          </CardContent>
        </CardActionArea>
        <CardActions style={{ backgroundColor: primaryColor }}>
          <IconButton onClick={() => { /* Do Nothing */ }/* this.goToIndicators.bind(this, CSV, item.id, item.name) */}>
            <EyeIcon size={20} color="#FFF" />
          </IconButton>
          <IconButton onClick={this.handleMsgDelete.bind(this, item, 'Você realmente deseja excluir este contexto?')}>
            <DeleteIcon size={20} color="#FFF" />
          </IconButton>
        </CardActions>
      </Card>
    )

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

      return (
        <PerfectScrollbar style={{ width: '100%', overflowX: 'auto' }}>
          <ConfigContainer size="big" style={{ color: '#000' }}>

            <Header>
              <h1>Contextos</h1>
            </Header>

            {!uploadedFiles.length && (
            <div style={{ padding: '2rem' }}>
              <Upload
                serverUpload={this.props.postContext}
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
          </ConfigContainer>
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
