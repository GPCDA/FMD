import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import BackIcon from 'react-feather/dist/icons/arrow-left';
import { Creators as ScreenActions } from '../../store/ducks/screen';

import { Container, Text } from './styles';

class BreadCrumb extends PureComponent {
  render() {
    const {
      text, screen, destiny, setScreen,
    } = this.props;

    return (
      <Container onClick={destiny ? setScreen.bind(this, screen, destiny, {}) : null}>
        <BackIcon size={16} />
        <Text>{text}</Text>
      </Container>
    );
  }
}

export default connect(
  null,
  { ...ScreenActions },
)(BreadCrumb);
