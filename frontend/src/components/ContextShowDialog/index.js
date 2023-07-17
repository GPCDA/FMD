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

class ContextShowDialog extends PureComponent {
  onClose = () => this.props.setDialog('contextShow');

  render() {
    const { contextShow, data } = this.props.dialog;

    if (!contextShow) return null;

    return (
      <Dialog size="big">
        <DialogHeader><h1>{data.name}</h1></DialogHeader>

        <DialogForm>
          {data.fields.map((field) => (
            <DialogLabelGroup key={field.code}>
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
)(ContextShowDialog);
