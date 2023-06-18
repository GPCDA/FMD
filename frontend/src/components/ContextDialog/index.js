import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  DialogFormButtonContainer, DialogHeader,
  DialogForm, DialogLabelGroup,
  DialogLabel,
  primaryColor,
  DialogSpan,
} from '../../styles/global';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import Dialog from '../Dialog';
import Button from '../../styles/Button';

class ContextDialog extends PureComponent {
  onClose = () => this.props.setDialog('context');

  render() {
    const { context, data } = this.props.dialog;

    if (!context) return null;

    return (
      <Dialog size="big">
        <DialogHeader><h1>{data.name}</h1></DialogHeader>

        <DialogForm style={{ overflow: 'auto' }}>
          {data.fields.map((field) => (
            <DialogLabelGroup>
              <DialogLabel style={{ color: primaryColor, fontWeight: 'bold' }}>
                {field.code}
                :
                <DialogSpan style={{ fontWeight: 'normal' }}>
                  {field.description}
                </DialogSpan>
              </DialogLabel>
            </DialogLabelGroup>
          ))}
        </DialogForm>

        <DialogFormButtonContainer>
          <Button color="danger" isCancel onClick={this.onClose}>Fechar</Button>
        </DialogFormButtonContainer>
      </Dialog>
    );
  }
}

const mapStateToProps = ({ dialog }) => ({ dialog });

export default connect(
  mapStateToProps,
  {
    ...DialogActions,
  },
)(ContextDialog);
