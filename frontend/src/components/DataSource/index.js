import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import DeleteIcon from 'react-feather/dist/icons/trash-2';
import HelpIcon from 'react-feather/dist/icons/help-circle';
import CheckIcon from 'react-feather/dist/icons/check';
import EyeIcon from 'react-feather/dist/icons/eye';
import PlayIcon from 'react-feather/dist/icons/play';
import FileIcon from 'react-feather/dist/icons/file';
import EyeIcon from 'react-feather/dist/icons/eye';
import CpuIcon from 'react-feather/dist/icons/cpu';
import MoodleConfigDialog from '../MoodleConfigDialog';
import { INDICATORS, ADD_TRAIN, LMS, CSV, CLUSTER } from '../../constants';
import { Creators as ScreenActions } from '../../store/ducks/screen';
import { Creators as IndicatorActions } from '../../store/ducks/indicator';
import DataSourceDialog from '../DataSourceDialog';
import PlusIcon from 'react-feather/dist/icons/plus';
import DatabaseIcon from 'react-feather/dist/icons/database';
import Tour from 'reactour';
import * as moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import { ProgressSpinner } from 'primereact/progressspinner';
import filesize from 'filesize';
import { Button } from '@material-ui/core';
import {
  INDICATORS, ADD_TRAIN, CSV, DATA_BASE,
} from '../../constants';
import { Creators as ScreenActions } from '../../store/ducks/screen';
import { Creators as IndicatorActions } from '../../store/ducks/indicator';
import DataSourceDialog from '../DataSourceDialog';
import AlertDialog from '../AlertDialog';
import filesize from "filesize";
import PopupComponent from '../PopupComponent/PopupComponent';


const availableLms = { moodle: true };
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

const url = 'http://127.0.0.1:8000/arquivos'; // ENDPOINT DA INTEGRAÇÃO

//chamada assicrona
async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

var clusterItems = []


async function getdata() {
  const response = await fetch(url);
  const data = await response.json();
  console.log(data.message.toString())

  var fileNames = data.message.toString().split(',');
  console.log(fileNames[0])

  // Percorrendo cada nome de arquivo no array
  for (var fileName of fileNames) {

    clusterItems.push({
      data: "/arquivos/",
      name: fileName,
      description: fileName,
    });
  }

}

getdata()

class DataSource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItem: null,
      isTourGeralOpen: false,
      chipSelected: DATA_BASE,
      csvDatasources: [],
      dbDatasources: [],
      // chipSelected: LMS,
      openPopup: false,
      selectedItemName: '',
    };
  }

  componentDidMount() {
    this.props.getDataSource();
    this.props.getContext();
    this.props.getJdbcDriver();
  }

  openItemNamePopup = (itemName) => {
    this.setState({ openPopup: true, selectedItemName: itemName });
  }

  closePopup = () => {
    this.setState({ openPopup: false });
  }

  openDialogConfig = (item, event) => {
    if (!availableLms[item.name]) return;
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


  renderCardLMS = (item, idx) => (
    <Card className='lms-card' key={idx} style={{ opacity: availableLms[item.name] ? 1 : .3 }}>
      <CardActionArea>
        <CardContent style={{ color: primaryColor }}>
          <Typography gutterBottom variant="h5" component="h2" style={{ fontFamily: fontFamily }}>
            {item.description}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" style={{ color: primaryColor, fontFamily: fontFamily, fontSize: '10px' }}>
            Versão: {item.version ? item.version : 'Não disponível'}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ backgroundColor: primaryColor }}>
        <IconButton onClick={this.goToIndicators.bind(this, LMS, item.name, item.description)}>
          <PlayIcon size={20} color={'#FFF'} />
        </IconButton>
        <IconButton onClick={this.openDialogConfig.bind(this, item)}>
          <EditIcon size={20} color={'#FFF'} />
        </IconButton>
      </CardActions>
    </Card>
  )
  handleShowContext = (data) => this.props.setDialog('database', data)

  // Handles do react tour do card, para abrir e fechar o tour

  handleStartTour = () => {
    this.setState({ isTourOpen: true });
  };

  handleTourClose = () => {
    this.setState({ isTourOpen: false });
  };

  // Handles do react tour geral, para abrir e fechar o tour

  handleStartTourGeral = () => {
    this.setState({ isTourGeralOpen: true });
  };

  handleTourCloseGeral = () => {
    this.setState({ isTourGeralOpen: false });
  };

  renderCardCluster = (item, idx) => (
    <Card className='lms-card' key={idx} style={{ opacity: true ? 1 : .3 }}>
      <CardActionArea>
        <CardContent style={{ color: primaryColor }}>
          <Typography gutterBottom variant="h5" component="h2" style={{ fontFamily: fontFamily }}>
            {item.description}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" style={{ color: primaryColor, fontFamily: fontFamily, fontSize: '10px' }}>
            Versão: {item.version ? item.version : 'Não disponível'}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ backgroundColor: primaryColor }}>
        <IconButton onClick={this.goToIndicators.bind(this, CLUSTER, item.name, item.description)}>
          <PlayIcon size={20} color={'#FFF'} />
        </IconButton>
        <IconButton onClick={() => this.openItemNamePopup(item.name)}>
          <EyeIcon size={20} color={'#FFF'} />
        </IconButton>
      </CardActions>
    </Card>
  )

  renderCardCSV = (item, idx) => (
    <Card className="lms-card" key={idx}>
      <CardActionArea style={{ flex: 1 }}>
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
        <IconButton className="play" onClick={this.goToIndicators.bind(this, CSV, item.id, item.name)}>
          <PlayIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton className="eye" onClick={() => this.handleShowContext(item)}>
          <EyeIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton className="delete" onClick={this.handleMsgDelete.bind(this, item, '')}>
          <DeleteIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={this.handleStartTour}>
          <HelpIcon size={20} color="#FFF" />
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
        <IconButton className="play" onClick={this.goToIndicators.bind(this, CSV, item.id, item.name)}>
          <PlayIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton className="eye" onClick={() => this.handleShowContext(item)}>
          <EyeIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton className="delete" onClick={this.handleMsgDelete.bind(this, item, 'Você realmente deseja excluir este banco de dados?')}>
          <DeleteIcon size={20} color="#FFF" />
        </IconButton>
        <IconButton onClick={this.handleStartTour}>
          <HelpIcon size={20} color="#FFF" />
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
        id: CLUSTER,
        avatar: <CpuIcon size={16} color={chipSelected === CLUSTER ? '#FFF' : primaryColor} />,
        label: "Big Data",
        className: chipSelected === CLUSTER ? 'active-chip' : 'inactive-chip',
        onClick: this.setChip.bind(this, CLUSTER)
      }
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
      </div >
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
      [CLUSTER]: (
        <>
          <CardContainer>
            {csvDatasources.map((item, idx) => this.renderCardCSV(item, idx))}
            <Card className="lms-card">
              <CardActionArea style={{ height: '100%' }} onClick={() => this.addDataSource({ selectedDataSourceType: CLUSTER })}>
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

          <PopupComponent
            isOpen={openPopup}
            handleClose={this.closePopup}
            selectedItemName={this.state.selectedItemName}
          />
        </>
      ),
    };
    // Passos do tour. O selector representa a classe selecionada durante o tour e content, o conteúdo a ser apresentado.
    const steps = [
      {
        selector: '.lms-card',
        content: 'Este é um conjunto de dados. A partir dele podemos fazer diversas operações!',
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
      {
        selector: '.play',
        content: () => (
          <div>
            <p>Para iniciar o processo de aprendizado de máquina clique aqui.</p>
            <br />
            <p>Então será possível fazer automaticamente o pré-processamento da base de dados e executar algoritmos de inteligência artificial</p>
          </div>
        ),
        style: {
          color: '#000',
        },
      },
      {
        selector: '.eye',
        content: 'Para visualizar os dados inseridos clique aqui.',
        style: {
          color: '#000',
        },
      },
      {
        selector: '.delete',
        content: 'Caso deseje deletar o conjunto de dados clique aqui.',
        style: {
          color: '#000',
        },
      },
      // ...
    ];

    // Passos do tour Geral. O selector representa a classe selecionada durante o tour e content, o conteúdo a ser apresentado.
    const stepsGeral = [
      {
        selector: '',
        content: 'Bem vindo ao Framework de Mineração de Dados! Você está a poucos passos de iniciar o processo de aprendizado de máquina!',
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
      {
        selector: '#contextos',
        content: 'Primeiramente você deve fazer o upload de um contexto. O contexto representará as informações necessárias para analisar os seus dados.',
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
      {
        selector: '#fonte-dados',
        content: 'Em seguida você poderá fazer o cadastro de um conjunto de dados. Com isso você estará apto a executar algoritmos de aprendizado de máquina.',
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
      {
        selector: '#modelos',
        content: 'Finalmente, você poderá acessar os modelos treinados e extrair suas análises!',
        style: {
          color: '#000',
          padding: '2.2rem',
        },
      },
      // ...
    ];

    return (
      <PerfectScrollbar style={{ width: '100%', overflowX: 'auto' }}>
        <ConfigContainer style={{ color: '#000' }}>

          <Header>
            <h1>Fontes de Dados</h1>
            <spam><HelpIcon size={20} color="#000" style={{ cursor: 'pointer' }} onClick={this.handleStartTourGeral} /></spam>
          </Header>
          {/* Componente do tour */}
          <Tour
            steps={steps}
            isOpen={this.state.isTourOpen}
            onRequestClose={this.handleTourClose}
            rounded={10}
            startAt={0}
            lastStepNextButton={<IconButton><CheckIcon size={20} color="#000" /></IconButton>}
            className="tour"
          />
          {/* Componente do tour */}
          <Tour
            steps={stepsGeral}
            isOpen={this.state.isTourGeralOpen}
            onRequestClose={this.handleTourCloseGeral}
            rounded={10}
            startAt={0}
            lastStepNextButton={<IconButton><CheckIcon size={20} color="#000" /></IconButton>}
            className="tour"
          />
          {this.renderDatasetOptions()}

          {chipsView[chipSelected]}

        </ConfigContainer >
        <DataSourceDialog />
        <DatabaseDialog />
        <AlertDialog onSubmit={this.handleDelete} />
      </PerfectScrollbar >


    );
  }
}

const mapStateToProps = (
  {
    lms,
    data_source,
    data_source_cluster,
    data_base
  }
) =>
(
  {
    lms,
    data_source,
    data_source_cluster,
    data_base
  }
);

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
