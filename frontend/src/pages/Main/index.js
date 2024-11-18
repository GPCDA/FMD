import React, { Component } from 'react';

import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import { Container } from './styles';

import SideMenu from '../../components/SideMenu';
import DataSource from '../../components/DataSource';
import Indicators from '../../components/Indicators';
import PreProcessing from '../../components/PreProcessing';
import { Creators as ScreenActions } from '../../store/ducks/screen';
// import { Creators as LmsActions } from '../../store/ducks/lms';
import { DATASOURCE, INDICATORS, PRE_PROCESSING, TRAIN, TRAIN_MODEL, LAD, CLUSTER, SPARK_PROCESSING} from '../../constants';
import Train from '../../components/Train';
import TrainModel from '../TrainModel';
import Dashboard from '../../components/Dashboard';
import Cluster from '../../components/Cluster';
import SparkProcessing from '../../components/SparkData';
import {
  DATASOURCE, INDICATORS, PRE_PROCESSING, TRAIN, TRAIN_MODEL, LAD, CONTEXT,
} from '../../constants';
import Train from '../../components/Train';
import TrainModel from '../TrainModel';
// import Dashboard from '../../components/Dashboard';
import Context from '../../components/Context';

const COMPONENTS = {
  [DATASOURCE]: <DataSource />,
  [INDICATORS]: <Indicators />,
  [PRE_PROCESSING]: <PreProcessing />,
  [TRAIN]: <Train />,
  [TRAIN_MODEL]: <TrainModel />,
  // [LAD]: <Dashboard />,
  [CONTEXT]: <Context />,
};

class Main extends Component {
  renderContent = () => {
    const { activeComponent } = this.props.screen;

    const currentComponent = COMPONENTS[activeComponent];

    if (activeComponent === INDICATORS) {
      return <Indicators />;
    }

    if (activeComponent === PRE_PROCESSING) {
      return <PreProcessing />;
    }

    if (activeComponent === TRAIN) {
      return <Train />;
    }

    if (activeComponent === TRAIN_MODEL) {
      return <TrainModel />;
    }

    if (activeComponent === LAD) {
      return <Dashboard />;
    }

    if(activeComponent === CLUSTER){
      return <Cluster />;
    }

    if(activeComponent === SPARK_PROCESSING){
      return <SparkProcessing />;
    }
    
    return null;
    return currentComponent;
  }

  render() {
    return (
      <Container>
        <SideMenu />
        {this.renderContent()}
      </Container>
    );
  }
}

const mapStateToProps = ({ screen }) => ({ screen });

const mapDispatchToProps = (dispatch) => bindActionCreators({ ...ScreenActions }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Main);
