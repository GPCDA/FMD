import React, { Component } from 'react';
import { connect } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import MonitorIcon from 'react-feather/dist/icons/monitor';
import EditIcon from 'react-feather/dist/icons/settings';
import DeleteIcon from 'react-feather/dist/icons/trash-2';
import PlayIcon from 'react-feather/dist/icons/play';
import FileIcon from 'react-feather/dist/icons/file';
import DatabaseIcon from 'react-feather/dist/icons/database';
import * as moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import { ProgressSpinner } from 'primereact/progressspinner';
import filesize from 'filesize';
import MoodleConfigDialog from '../MoodleConfigDialog';
import {
  INDICATORS, ADD_TRAIN, LMS, CSV, DATA_BASE,
} from '../../constants';
import { Creators as ScreenActions } from '../../store/ducks/screen';
import { Creators as IndicatorActions } from '../../store/ducks/indicator';
import DataSourceDialog from '../DataSourceDialog';
import AlertDialog from '../AlertDialog';
import {
  Header, fontFamily, primaryColor, StatusMsgContainer,
} from '../../styles/global';
import { ConfigContainer } from '../../styles/ConfigContainer';
import CustomButton from '../../styles/Button';
import { Creators as DataSourceActions } from '../../store/ducks/data_source';
import { Creators as LmsActions } from '../../store/ducks/lms';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import { Creators as DataBaseActions } from '../../store/ducks/data_base';
import { CardContainer } from './styles';

const availableLms = { moodle: true };

class DataSource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: null,
      chipSelected: DATA_BASE,
    };
  }

  UNSAFE_componentWillMount() {
    this.props.getDataSource();
    this.props.getDataBase();
  }

  openDialogConfig = (item/* , event */) => {
    if (!availableLms[item.name]) return;

    this.props.setDialog(item.name, {
      ...item,
      version: {
        label: item.version, value: item.version,
      },
    });
  }

  renderCardLMS = (item, idx) => (
    <Card className="lms-card" key={idx} style={{ opacity: availableLms[item.name] ? 1 : 0.3 }}>
      <CardActionArea>
        <CardContent style={{ color: primaryColor }}>
          <Typography gutterBottom variant="h5" component="h2" style={{ fontFamily }}>
            {item.description}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" style={{ color: primaryColor, fontFamily, fontSize: '10px' }}>
            Versão:
            {' '}
            {item.version ? item.version : 'Não disponível'}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ backgroundColor: primaryColor }}>
        <IconButton onClick={this.goToIndicators.bind(this, LMS, item.name, item.description)}>
          <PlayIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={this.openDialogConfig.bind(this, item)}>
          <EditIcon size={20} color="#FFF" />
        </IconButton>
      </CardActions>
    </Card>
  )

  renderCardCSV = (item, idx) => (
    <Card className="lms-card" key={idx}>
      <CardActionArea>
        <CardContent style={{ color: primaryColor }}>
          <Typography gutterBottom variant="h5" component="h2" style={{ fontFamily }}>
            {item.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" style={{ color: primaryColor, fontFamily, fontSize: '10px' }}>
            <b>Importado em:</b>
            {' '}
            {moment(item.created_at).format('DD/MM/YYYY HH:mm')}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" style={{ color: primaryColor, fontFamily, fontSize: '10px' }}>
            <b>Tamanho:</b>
            {' '}
            {filesize(item.size)}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ backgroundColor: primaryColor }}>
        <IconButton onClick={this.goToIndicators.bind(this, CSV, item.id, item.name)}>
          <PlayIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={this.handleMsgDelete.bind(this, item)}>
          <DeleteIcon size={20} color="#FFF" />
        </IconButton>
      </CardActions>
    </Card>
  )

  renderCardDataBase = (item, idx) => (
    <Card className="lms-card" key={idx}>
      <CardActionArea>
        <CardContent style={{ color: primaryColor }}>
          <Typography gutterBottom variant="h5" component="h2" style={{ fontFamily }}>
            {item.name}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" style={{ color: primaryColor, fontFamily, fontSize: '10px' }}>
            <b>Importado em:</b>
            {' '}
            {moment(item.created_at).format('DD/MM/YYYY HH:mm')}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" style={{ color: primaryColor, fontFamily, fontSize: '10px' }}>
            <b>Tamanho:</b>
            {' '}
            {filesize(item.size)}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ backgroundColor: primaryColor }}>
        <IconButton onClick={this.goToIndicators.bind(this, CSV, item.id, item.name)}>
          <PlayIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={this.handleMsgDelete.bind(this, item, 'Você realmente deseja excluir este banco de dados?')}>
          <DeleteIcon size={20} color="#FFF" />
        </IconButton>
      </CardActions>
    </Card>
  )

  handleMsgDelete = (item, message) => {
    this.setState({ selectedItem: item });

    this.props.setDialog('alert', {
      description: message || 'Você realmente deseja excluir esta fonte de dados?',
    });
  }

  handleDelete = () => {
    const { chipSelected, selectedItem } = this.state;

    if (!selectedItem?.id) return;

    const deleteChipFunctions = {
      [CSV]: this.props.deleteDataSource,
      [DATA_BASE]: this.props.deleteDataBase,
    };

    const deleteChipFunction = deleteChipFunctions[chipSelected];

    if (deleteChipFunction) deleteChipFunction(selectedItem.id);
  }

  goToIndicators = (context, id, name/* , event */) => {
    const key = `${context}/${id}/${name}`;

    if (context === LMS && !availableLms[id]) return;

    this.props.setScreen(ADD_TRAIN, INDICATORS);
    this.props.setIndicator('datasource', key);
    this.props.getIndicators({ context, id });
  }

  setChip = (value/* , event */) => this.setState({ chipSelected: value });

  renderDatasetOptions = () => {
    const { chipSelected } = this.state;

    const chips = [
      {
        id: DATA_BASE,
        avatar: <DatabaseIcon size={16} color={chipSelected === DATA_BASE ? '#FFF' : primaryColor} />,
        label: 'Banco de dados',
        className: chipSelected === DATA_BASE ? 'active-chip' : 'inactive-chip',
        onClick: this.setChip.bind(this, DATA_BASE),
      },
      {
        id: CSV,
        avatar: <FileIcon size={16} color={chipSelected === CSV ? '#FFF' : primaryColor} />,
        label: 'Arquivos CSV',
        className: chipSelected === CSV ? 'active-chip' : 'inactive-chip',
        onClick: this.setChip.bind(this, CSV),
      },
      {
        id: LMS,
        avatar: <MonitorIcon size={16} color={chipSelected === LMS ? '#FFF' : primaryColor} />,
        label: 'Ambientes EAD',
        className: chipSelected === LMS ? 'active-chip' : 'inactive-chip',
        onClick: this.setChip.bind(this, LMS),
      },
    ];

    return (
      <div style={{ display: 'flex', paddingLeft: '2rem', gap: '0.5rem' }}>
        {chips.map((chip) => (
          <Chip
            key={chip.id}
            avatar={chip.avatar}
            label={chip.label}
            className={chip.className}
            onClick={chip.onClick}
          />
        ))}
      </div>
    );
  }

  addDataSource = () => this.props.setDialog('dataSource');

  render() {
    const { chipSelected } = this.state;
    const { lms, data_source, data_base } = this.props;
    const loading = !!data_source.loading;
    const hasDataSource = !!data_source.data.length;
    const hasDataBase = !!data_base.data.length;

    const chipsView = {
      [LMS]: (
        <CardContainer>{lms.data.map((item, idx) => this.renderCardLMS(item, idx))}</CardContainer>
      ),
      [CSV]: (
        <>
          <CardContainer>{data_source.data.map((item, idx) => this.renderCardCSV(item, idx))}</CardContainer>

          {loading && (
            <StatusMsgContainer>
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#EEEEEE" animationDuration=".5s" />
            </StatusMsgContainer>
          )}

          {!hasDataSource && !loading && (
            <StatusMsgContainer>Nenhuma fonte de dados cadastrada</StatusMsgContainer>
          )}
        </>
      ),
      [DATA_BASE]: (
        <>
          <CardContainer>{data_base.data.map((item, idx) => this.renderCardDataBase(item, idx))}</CardContainer>

          {loading && (
            <StatusMsgContainer>
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#EEEEEE" animationDuration=".5s" />
            </StatusMsgContainer>
          )}

          {!hasDataBase && !loading && (
            <StatusMsgContainer>Nenhum banco de dados cadastrado</StatusMsgContainer>
          )}
        </>
      ),
    };

    return (
      <PerfectScrollbar style={{ width: '100%' }}>
        <ConfigContainer style={{ minHeight: '70%' }}>

          <Header>
            <h1>Fontes de Dados</h1>
            <div>
              <CustomButton filled={false} onClick={this.addDataSource}>Adicionar fonte de dados</CustomButton>
            </div>
          </Header>

          {this.renderDatasetOptions()}

          {chipsView[chipSelected]}

        </ConfigContainer>
        <MoodleConfigDialog />
        <DataSourceDialog />
        <AlertDialog onSubmit={this.handleDelete} />
      </PerfectScrollbar>
    );
  }
}

const mapStateToProps = ({ lms, data_source, data_base }) => ({ lms, data_source, data_base });

export default connect(
  mapStateToProps, {
    ...DialogActions,
    ...LmsActions,
    ...ScreenActions,
    ...IndicatorActions,
    ...DataSourceActions,
    ...DataBaseActions,
  },
)(DataSource);
