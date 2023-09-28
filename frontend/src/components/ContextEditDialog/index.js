import React, { Component } from 'react';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { actions as toastrActions } from 'react-redux-toastr';
import { Typography } from '@material-ui/core';
import {
  DialogFormButtonContainer, DialogHeader,
  DialogForm, DialogLabelGroup,
  DialogLabel,
  DialogInput,
  Flex,
} from '../../styles/global';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import { Creators as ContextActions } from '../../store/ducks/context';
import Dialog from '../Dialog';
import Button from '../../styles/Button';

class ContextEditDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
      fields: [],
    };
  }

  componentDidUpdate(prevProps/* , prevState */) {
    const { contextEdit, data } = this.props.dialog;
    const { data: prevData } = prevProps.dialog;

    if (contextEdit && data && prevData !== data) {
      const fields = data.fields.asMutable({ deep: true });
      this.setState({ name: data.name, fields });
    }
  }

  onClose = () => {
    this.props.setDialog('contextEdit');
    this.setState({
      name: null,
      fields: [],
    });
  }

  renderWarningMsg = (msg, shouldAlert = true) => {
    if (!shouldAlert) return;
    this.props.add({
      type: 'warning',
      title: 'Atenção',
      message: msg,
    });
  }

  handleValidateFields = (shouldAlert = false) => {
    const { name, fields } = this.state;

    if (!name) {
      this.renderWarningMsg('Nome não informado', shouldAlert);
      return false;
    }

    const hasEmptyField = fields.some((field, index) => {
      if (!field.code) {
        this.renderWarningMsg(`[#${index}] Código não informado`, shouldAlert);
        return true;
      } if (!field.description) {
        this.renderWarningMsg(`[#${index}] Descrição não informado`, shouldAlert);
        return true;
      } if (!field.type) {
        this.renderWarningMsg(`[#${index}] Tipo não informado`, shouldAlert);
        return true;
      } if (!field.size) {
        this.renderWarningMsg(`[#${index}] Tamanho não informada`, shouldAlert);
        return true;
      // } else if (!field.allowed_values) {
      //   this.renderWarningMsg(`[#${index}] Valores permitidos não informado`, shouldAlert);
      //   return true;
      }
      return false;
    });

    return Boolean(name && !hasEmptyField);
  }

  submit = () => {
    const { data } = this.props.dialog;
    const { name, fields } = this.state;
    if (!this.handleValidateFields(true)) return;

    this.props.putContext({ id: data.id, name, fields });
    this.onClose();
  }

  onFieldChange = (fieldIndex, fieldName, fieldValue) => {
    this.setState((prevState) => {
      const newFields = prevState.fields.slice();
      newFields[fieldIndex][fieldName] = fieldValue;
      return newFields;
    });
  }

  render() {
    const { contextEdit, data } = this.props.dialog;

    if (!contextEdit) return null;

    return (
      <Dialog size="big">
        <DialogHeader>
          <h1>
            Editar
            {' '}
            {data.name}
          </h1>
        </DialogHeader>

        <DialogForm>
          <DialogLabelGroup>
            <DialogLabel htmlFor="name">Contexto:</DialogLabel>
            <DialogInput
              id="name"
              name="name"
              autoComplete="off"
              value={this.state.name || ''}
              onChange={(event) => this.setState({ name: event.target.value })}
            />
          </DialogLabelGroup>

          {this.state.fields.map((field, fieldIndex) => (
            <Card key={field.id} style={{ overflow: 'unset', backgroundColor: '#FBFBFB' }}>
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Typography color="textSecondary" gutterBottom>
                  #
                  {fieldIndex}
                </Typography>
                <Flex>
                  <DialogLabelGroup>
                    <DialogLabel htmlFor={`${field.id}-context-code`}>Código: </DialogLabel>
                    <DialogInput
                      id={`${field.id}-context-code`}
                      name={`${field.id}-context-code`}
                      autoComplete="off"
                      value={field.code || ''}
                      onChange={(event) => this.onFieldChange(fieldIndex, 'code', event.target.value)}
                    />
                  </DialogLabelGroup>

                  <DialogLabelGroup>
                    <DialogLabel htmlFor={`${field.id}-context-description`}>Descrição: </DialogLabel>
                    <DialogInput
                      id={`${field.id}-context-description`}
                      name={`${field.id}-context-description`}
                      autoComplete="off"
                      value={field.description || ''}
                      onChange={(event) => this.onFieldChange(fieldIndex, 'description', event.target.value)}
                    />
                  </DialogLabelGroup>
                </Flex>

                <Flex>
                  <DialogLabelGroup>
                    <DialogLabel htmlFor={`${field.id}-context-type`}>Tipo: </DialogLabel>
                    <DialogInput
                      id={`${field.id}-context-type`}
                      name={`${field.id}-context-type`}
                      autoComplete="off"
                      value={field.type || ''}
                      onChange={(event) => this.onFieldChange(fieldIndex, 'type', event.target.value)}
                    />
                  </DialogLabelGroup>

                  <DialogLabelGroup>
                    <DialogLabel htmlFor={`${field.id}-context-size`}>Tamanho: </DialogLabel>
                    <DialogInput
                      id={`${field.id}-context-size`}
                      name={`${field.id}-context-size`}
                      autoComplete="off"
                      value={field.size || ''}
                      onChange={(event) => this.onFieldChange(fieldIndex, 'size', event.target.value)}
                    />
                  </DialogLabelGroup>
                </Flex>

                <Flex>
                  <DialogLabelGroup>
                    <DialogLabel htmlFor={`${field.id}-context-allowed_values`}>Valores permitidos: </DialogLabel>
                    <DialogInput
                      id={`${field.id}-context-allowed_values`}
                      name={`${field.id}-context-allowed_values`}
                      autoComplete="off"
                      value={field.allowed_values || ''}
                      onChange={(event) => this.onFieldChange(fieldIndex, 'allowed_values', event.target.value)}
                    />
                  </DialogLabelGroup>
                </Flex>
              </CardContent>
            </Card>
          ))}
        </DialogForm>

        <DialogFormButtonContainer>
          <Button color="danger" isCancel onClick={this.onClose}>Cancelar</Button>
          <Button onClick={this.submit}>Salvar</Button>
        </DialogFormButtonContainer>
      </Dialog>
    );
  }
}

const mapStateToProps = ({ dialog }) => ({ dialog });

export default connect(
  mapStateToProps,
  {
    ...toastrActions,
    ...DialogActions,
    ...ContextActions,
  },
)(ContextEditDialog);
