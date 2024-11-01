import React, { Component } from 'react';

import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import { Container } from './styles';

import SideMenu from '../../components/SideMenu';
import DataSource from '../../components/DataSource';
import Indicators from '../../components/Indicators';
import PreProcessing from '../../components/PreProcessing';
import { Creators as ScreenActions } from '../../store/ducks/screen';
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
