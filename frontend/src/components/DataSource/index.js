import React, { Component } from 'react';
import { connect } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import DeleteIcon from 'react-feather/dist/icons/trash-2';
import EyeIcon from 'react-feather/dist/icons/eye';
import PlayIcon from 'react-feather/dist/icons/play';
import FileIcon from 'react-feather/dist/icons/file';
import PlusIcon from 'react-feather/dist/icons/plus';
import DatabaseIcon from 'react-feather/dist/icons/database';
import * as moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import { ProgressSpinner } from 'primereact/progressspinner';
import filesize from 'filesize';
import {
  INDICATORS, ADD_TRAIN, CSV, DATA_BASE,
} from '../../constants';
import { Creators as ScreenActions } from '../../store/ducks/screen';
import { Creators as IndicatorActions } from '../../store/ducks/indicator';
import DataSourceDialog from '../DataSourceDialog';
import AlertDialog from '../AlertDialog';
import {
  Header, fontFamily, primaryColor, StatusMsgContainer,
} from '../../styles/global';
import { ConfigContainer } from '../../styles/ConfigContainer';
import { Creators as DataSourceActions } from '../../store/ducks/data_source';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import { Creators as ContextActions } from '../../store/ducks/context';
import { Creators as JDBCDriverActions } from '../../store/ducks/jdbc_driver';
import { CardContainer } from './styles';
import DatabaseDialog from '../DatabaseDialog';

class DataSource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: null,
      chipSelected: DATA_BASE,
      csvDatasources: [],
      dbDatasources: [],
    };
  }

  componentDidMount() {
    this.props.getDataSource();
    this.props.getContext();
    this.props.getJdbcDriver();
  }

  componentDidUpdate(prevProps) {
    const { data_source } = this.props;
    const { loading: prevLoading } = prevProps.data_source;
    const loading = !!data_source.loading;
    if (!!prevLoading && !loading) {
      const { csvDatasources, dbDatasources } = data_source.data.reduce((datasources, datasource) => {
        const datasourceType = {
          [CSV]: () => {
            datasources.csvDatasources.push(datasource);
          },
          [DATA_BASE]: () => {
            datasources.dbDatasources.push(datasource);
          },
        };
        const datasourceTypeFunction = datasourceType[datasource.type.name];
        if (datasourceTypeFunction) datasourceTypeFunction();
        return datasources;
      }, { csvDatasources: [], dbDatasources: [] });

      this.setState({ csvDatasources, dbDatasources });
    }
  }

  handleShowContext = (data) => this.props.setDialog('database', data)

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
            {filesize(item.file.size)}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ backgroundColor: primaryColor }}>
        <IconButton onClick={this.goToIndicators.bind(this, CSV, item.id, item.name)}>
          <PlayIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={() => this.handleShowContext(item)}>
          <EyeIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={this.handleMsgDelete.bind(this, item, '')}>
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
            {filesize(item.file.size)}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ backgroundColor: primaryColor }}>
        <IconButton onClick={this.goToIndicators.bind(this, CSV, item.id, item.name)}>
          <PlayIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={() => this.handleShowContext(item)}>
          <EyeIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={this.handleMsgDelete.bind(this, item, 'Você realmente deseja excluir este banco de dados?')}>
          <DeleteIcon size={20} color="#FFF" />
        </IconButton>
      </CardActions>
    </Card>
  )

  handleMsgDelete = (item, message = 'Você realmente deseja excluir esta fonte de dados?') => {
    this.setState({ selectedItem: item });

    this.props.setDialog('alert', { description: message });
  }

  handleDelete = () => {
    const { chipSelected, selectedItem } = this.state;

    if (!selectedItem?.id) return;

    const deleteChipFunctions = {
      [CSV]: this.props.deleteDataSource,
      [DATA_BASE]: this.props.deleteDataSource,
    };

    const deleteChipFunction = deleteChipFunctions[chipSelected];

    if (deleteChipFunction) deleteChipFunction(selectedItem.id);
  }

  goToIndicators = (context, id, name/* , event */) => {
    const key = `${context}/${id}/${name}`;

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

  addDataSource = (data) => this.props.setDialog('dataSource', data);

  render() {
    const { chipSelected, csvDatasources, dbDatasources } = this.state;
    const { data_source } = this.props;
    const loading = !!data_source.loading;

    const chipsView = {
      [CSV]: (
        <>
          <CardContainer>
            {csvDatasources.map((item, idx) => this.renderCardCSV(item, idx))}
            <Card className="lms-card">
              <CardActionArea style={{ height: '100%' }} onClick={() => this.addDataSource({ selectedDataSourceType: CSV })}>
                <CardContent style={{ color: primaryColor, display: 'flex', justifyContent: 'center' }}>
                  <PlusIcon size={20} color="#000" />
                </CardContent>
              </CardActionArea>
            </Card>
          </CardContainer>

          {loading && (
            <StatusMsgContainer>
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#EEEEEE" animationDuration=".5s" />
            </StatusMsgContainer>
          )}
        </>
      ),
      [DATA_BASE]: (
        <>
          <CardContainer>
            {dbDatasources.map((item, idx) => this.renderCardDataBase(item, idx))}
            <Card className="lms-card">
              <CardActionArea style={{ height: '100%' }} onClick={() => this.addDataSource({ selectedDataSourceType: DATA_BASE })}>
                <CardContent style={{ color: primaryColor, display: 'flex', justifyContent: 'center' }}>
                  <PlusIcon size={20} color="#000" />
                </CardContent>
              </CardActionArea>
            </Card>
          </CardContainer>

          {loading && (
            <StatusMsgContainer>
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#EEEEEE" animationDuration=".5s" />
            </StatusMsgContainer>
          )}
        </>
      ),
    };

    return (
      <PerfectScrollbar style={{ width: '100%', overflowX: 'auto' }}>
        <ConfigContainer style={{ color: '#000' }}>

          <Header>
            <h1>Fontes de Dados</h1>
          </Header>

          {this.renderDatasetOptions()}

          {chipsView[chipSelected]}

        </ConfigContainer>
        <DataSourceDialog />
        <DatabaseDialog />
        <AlertDialog onSubmit={this.handleDelete} />
      </PerfectScrollbar>
    );
  }
}

const mapStateToProps = ({ data_source, data_base }) => ({ data_source, data_base });

export default connect(
  mapStateToProps, {
    ...DialogActions,
    ...ScreenActions,
    ...IndicatorActions,
    ...DataSourceActions,
    ...ContextActions,
    ...JDBCDriverActions,
  },
)(DataSource);
