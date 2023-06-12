import React, { Component } from 'react';

import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';
import { Container } from './styles';

import SideMenu from '../../components/SideMenu';
import DataSource from '../../components/DataSource';
import Indicators from '../../components/Indicators';
import PreProcessing from '../../components/PreProcessing';
import { Creators as ScreenActions } from '../../store/ducks/screen';
import { Creators as LmsActions } from '../../store/ducks/lms';
import {
  DATASOURCE, INDICATORS, PRE_PROCESSING, TRAIN, TRAIN_MODEL, LAD, CARTRIDGE,
} from '../../constants';
import Train from '../../components/Train';
import TrainModel from '../TrainModel';
import Dashboard from '../../components/Dashboard';
import Cartridge from '../../components/Cartridge';

const COMPONENTS = {
  [DATASOURCE]: <DataSource />,
  [INDICATORS]: <Indicators />,
  [PRE_PROCESSING]: <PreProcessing />,
  [TRAIN]: <Train />,
  [TRAIN_MODEL]: <TrainModel />,
  [LAD]: <Dashboard />,
  [CARTRIDGE]: <Cartridge />,
};

class Main extends Component {
  componentDidMount() {
    this.props.getLms();
  }

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

const mapDispatchToProps = (dispatch) => bindActionCreators({ ...ScreenActions, ...LmsActions }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Main);
