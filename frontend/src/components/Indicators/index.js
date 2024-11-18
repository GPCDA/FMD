import { connect } from 'react-redux';
import React, { Component } from 'react';
import { actions as toastrActions } from 'react-redux-toastr';
import Select from 'react-select';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { PickList } from 'primereact/picklist';
import BreadCrumb from '../BreadCrumb';
import Button from '../../styles/Button';
import { ConfigContainer } from '../../styles/ConfigContainer';
import { Creators as ScreenActions } from '../../store/ducks/screen';
import { Creators as CourseActions } from '../../store/ducks/course';
import { Creators as SubjectActions } from '../../store/ducks/subject';
import { Creators as SemesterActions } from '../../store/ducks/semester';
import indicator, { Creators as IndicatorActions } from '../../store/ducks/indicator';
import { Creators as PreProcessingActions } from '../../store/ducks/pre_processing';
import {
  Header, Separator, Content, LeftContent,
  RightContainer, SelectText, SelectContainer,
} from './styles';
import { DATASOURCE, PRE_PROCESSING, ADD_TRAIN, LMS, SPARK_TRAIN, SPARK_PROCESSING } from '../../constants';
import { selectStyle } from '../../styles/global';

var sourceCluster = [];
var IndicatorsOptions = [];
var file = '';


const fetchData = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na solicitação: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Erro ao consultar a API:', error.message);
  }
};

async function getData(url) {

  const data = await fetchData(url);

  if (data) {
    var colunas = data.message;
    colunas = colunas.split(",");
    sourceCluster = [];

    for (let i = 0; i < colunas.length; i++) {
      const item = {
        value: colunas[i],
        label: colunas[i]
      }

      sourceCluster.push(item);
    }
    return sourceCluster;
  }
}

export var api_spark = ""; // Declaração da variável fora da classe

class Indicators extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLoaded: false // Estado para controlar se os dados foram carregados
    };
  }

  componentDidMount() {
    const dataSourceContext = this.getDataSourceContext();

    if (dataSourceContext === 'CLUSTER') {
      var file = this.getDataURl().split('/')[0];
      // ESSE LOCALHOST:8000 É O DJANGO
      var url = "http://localhost:8000/colunas?file=" + file;

      getData(url).then(dados => {
        this.setState({ dataLoaded: true }); // Atualiza o estado quando os dados são carregados
      });

    }

    if (dataSourceContext === LMS) {
      this.props.getCourses({ datasource: this.getDataSourceId() });
    };

    this.props.indicatorInitFilter();
  }


  getDataSourceContext = () => (this.props.indicator.datasource ? this.props.indicator.datasource.split('/')[0] : null);


  getDataURl = () => this.props.indicator.datasource ? this.props.indicator.datasource.split('CLUSTER/')[1] : null;

  getDataSourceId = () => this.props.indicator.datasource ? this.props.indicator.datasource.split('/')[1] : null;

  getPickListTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ fontSize: '14px', textAlign: 'right', margin: '15px 5px 0 0' }}>{item.label}</div>
    </div>
  )

  handleChange = (item, name) => {
    this.props.setIndicator(name, item);
    this.refreshFilters(name, item);
  };

  refreshFilters = (name, items) => {
    if (name === 'courseSelected') {
      if (!items || !items.length) {
        this.props.subjectSuccess([]);
        this.props.semesterSuccess([]);
        return;
      }

      this.props.getSubjects({ courses: items.map((item) => item.value) });
    }

    if (name === 'subjectSelected') {
      if (!items || !items.length) {
        this.props.semesterSuccess([]);
        return;
      }

      this.props.getSemesters({ subjects: items.map((item) => item.value) });
    }
  };

  onPickListChange = (event) => {
    IndicatorsOptions = event.target;
    this.props.setIndicator('source', event.source);
    this.props.setIndicator('indicators', event.target);
  }

  renderWarningMsg = (msg) => {
    this.props.add({
      type: 'warning',
      title: 'Atenção',
      message: msg,
    });
  }

  onSubmit = () => {
    const filter = {};
    const { setScreen } = this.props;
    const { indicators, targetSelected, courseSelected, subjectSelected, semesterSelected, kSelected, algoritmsSelected } = this.props.indicator;

    if (!targetSelected || !targetSelected.value) {
      this.renderWarningMsg('Selecione um indicador alvo');
      return;
    }

    if (!indicators || !indicators.length || indicators.length <= 1) {
      this.renderWarningMsg('Selecione ao menos dois indicadores');
      return;
    }

    if (!indicators.filter((indicator) => indicator.value === targetSelected.value).length) {
      this.renderWarningMsg(`É necessário selecionar o indicador ${targetSelected.value}, pois o mesmo é um indicador alvo`);
      return;
    }


    filter.context = this.getDataSourceContext();
    filter.id = this.getDataSourceId();
    filter.target = targetSelected.value;
    filter.courses = this.getValueFromSelect(courseSelected);
    filter.subjects = this.getValueFromSelect(subjectSelected);
    filter.semesters = this.getValueFromSelect(semesterSelected);
    filter.indicators = this.getValueFromSelect(indicators);
    filter.k = kSelected.value;
    filter.algoritms = algoritmsSelected.value;



    //MONTAR A API DO SPARK

    if (filter.context === 'CLUSTER') {
      var file = this.getDataURl().split('/')[0];

      var algoritmos = algoritmsSelected.map(item => item.value).join(',');

      api_spark = "http://localhost:8000/treinamento?target=" + filter.target + "&columns=" + filter.indicators + "&file=" + file
        + "&k=" + filter.k + "&algorithms=" + algoritmos;
      console.log(api_spark);
      //this.props.getPreProcessing(filter);
      setScreen(ADD_TRAIN, SPARK_PROCESSING);



    } else {
      this.props.getPreProcessing(filter);
      setScreen(ADD_TRAIN, PRE_PROCESSING);

    }

    /*this.props.getPreProcessing(filter);
    setScreen(ADD_TRAIN, PRE_PROCESSING);*/
  }

  getValueFromSelect = (items) => {
    if (!items) {
      return null;
    }

    return items.map((item) => item.value);
  }


  render() {

    if (!this.state.dataLoaded) {
      return <div></div>;
    }

    const { indicator } = this.props;
    const { source, indicators, targetSelected, kSelected, algoritmsSelected } = this.props.indicator;

    const dataSourceContext = this.getDataSourceContext();
    source = sourceCluster;
    IndicatorsOptions = sourceCluster;

    return (
      <ConfigContainer size="big">
        <PerfectScrollbar style={{ width: '100%' }}>
          <div style={{ width: '35%' }}>
            <BreadCrumb text="Voltar para Escolha de Fontes de dados" screen={ADD_TRAIN} destiny={DATASOURCE} />
          </div>


          {dataSourceContext === 'CLUSTER' && (
            <React.Fragment>
              <Header>
                <h1>Selecione os indicadores</h1>
                <div>
                  <Button onClick={this.onSubmit.bind(this)}>EXECUTAR TREINAMENTO EM CLUSTER</Button>
                </div>
              </Header>
            </React.Fragment>
          )}


          {dataSourceContext !== 'CLUSTER' && (
            <React.Fragment>
              <Header>
                <h1>Selecione os indicadores</h1>
                <div>
                  <Button onClick={this.onSubmit.bind(this)}>PRÉ-PROCESSAR BASE</Button>
                </div>
              </Header>
            </React.Fragment>
          )}

          <Content>
            <LeftContent>
              <SelectText>Indicador Alvo</SelectText>
              <SelectContainer>
                <Select
                  isClearable
                  value={targetSelected}
                  noOptionsMessage={() => 'Sem dados'}
                  onChange={(e) => this.handleChange(e, 'targetSelected')}
                  placeholder={'Selecione um indicador alvo'}
                  styles={selectStyle}
                  options={IndicatorsOptions} />
              </SelectContainer>

              <SelectText>Número de validação cruzada</SelectText>
              <SelectContainer>
                <Select
                  isClearable
                  value={kSelected}
                  noOptionsMessage={() => 'Sem dados'}
                  onChange={(e) => this.handleChange(e, 'kSelected')}
                  placeholder={'Número K'}
                  styles={selectStyle}
                  options={[
                    { value: "0", label: "0" },
                    { value: "2", label: "2" },
                    { value: "3", label: "3" },
                    { value: "4", label: "4" },
                    { value: "5", label: "5" },
                  ]}
                />
              </SelectContainer>

              <SelectText>Algoritmos</SelectText>
              <SelectContainer>
                <Select
                  isClearable
                  isMulti  // Habilita a seleção de múltiplos valores
                  value={algoritmsSelected}
                  noOptionsMessage={() => 'Sem dados'}
                  onChange={(e) => this.handleChange(e, 'algoritmsSelected')}
                  placeholder={'Selecione os algoritmos'}
                  styles={selectStyle}
                  options={[
                    { value: "DRF", label: "Distributed Random Forest" },
                    { value: "GLM", label: "Gradient Linearized model" },
                    { value: "XGBoost", label: "XGBoost" },
                  ]}
                />
              </SelectContainer>

              {dataSourceContext !== 'CLUSTER' && (
                <React.Fragment>
                  <SelectContainer>
                    <Select
                      isClearable
                      value={targetSelected}
                      noOptionsMessage={() => 'Sem dados'}
                      onChange={(e) => this.handleChange(e, 'targetSelected')}
                      placeholder={'Selecione um indicador alvo'}
                      styles={selectStyle}
                      options={indicator.data.asMutable()} />
                  </SelectContainer>

                </React.Fragment>
              )}

            </LeftContent>

            <Separator>&nbsp;</Separator>

            <RightContainer>
              <PickList
                metaKeySelection={false}
                responsive
                showSourceControls={false}
                showTargetControls={false}
                sourceHeader="Disponíveis"
                targetHeader="Selecionados"
                source={source}
                target={indicators}
                onChange={this.onPickListChange.bind(this)}
                itemTemplate={this.getPickListTemplate.bind(this)}
                sourceStyle={{ height: '40vh', width: '28vw' }}
                targetStyle={{ height: '40vh', width: '28vw' }}
              />
            </RightContainer>

          </Content>
        </PerfectScrollbar>
      </ConfigContainer>
    );
  }
}

const mapStateToProps = ({
  course, subject, semester, indicator,
}) => ({
  course, subject, semester, indicator,
});

export default connect(
  mapStateToProps,
  {
    ...ScreenActions,
    ...CourseActions,
    ...SubjectActions,
    ...SemesterActions,
    ...IndicatorActions,
    ...toastrActions,
    ...PreProcessingActions,
  },
)(Indicators);
