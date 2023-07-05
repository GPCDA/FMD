import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import * as moment from 'moment';
import {
  DialogFormButtonContainer, DialogHeader,
  DialogForm, DialogLabelGroup,
  DialogLabel, primaryColor, DialogSpan,
  Table, HeaderColumn, FirstHeaderColumn,
  ItemColumn, FirstItemColumn,
} from '../../styles/global';
import { Creators as DialogActions } from '../../store/ducks/dialog';
import { Creators as DataSourceActions } from '../../store/ducks/data_source';
import Dialog from '../Dialog';
import Button from '../../styles/Button';

class DatabaseDialog extends PureComponent {
  componentDidUpdate(prevProps) {
    const { data } = this.props.dialog;
    const { data: prevData } = prevProps.dialog;
    if (data?.file_id && prevData?.file_id !== data.file_id) {
      this.props.getDataSourceContent(/* data.file_id */87);
    }
  }

  renderItem = (item, idx) => {
    const { data } = this.props.dialog;
    return (
      <tr key={idx}>
        {data.contextMap.map((column) => (
          <ItemColumn key={column.id}>{item[column.datasource_field]}</ItemColumn>
        ))}
      </tr>
    );
  }

  onClose = () => this.props.setDialog('database');

  render() {
    const { database, data } = this.props.dialog;
    const { loading, currentDatasourceValues } = this.props.data_source;
    console.log(loading, currentDatasourceValues, currentDatasourceValues.length, data?.contextMap);

    if (!database) return null;

    return (
      <Dialog size="big">
        <DialogHeader><h1>{data.name}</h1></DialogHeader>

        <DialogForm>
          {!!(!loading && currentDatasourceValues.length && data?.contextMap) && (
          <Table>
            <thead>
              <tr>
                {data.contextMap.map((column) => (
                  <HeaderColumn key={column.id}>{column.context_field}</HeaderColumn>
                ))}
              </tr>
            </thead>

            <tbody>
              {currentDatasourceValues.slice(10).map((item, idx) => this.renderItem(item, idx))}
            </tbody>
          </Table>
          )}
        </DialogForm>

        <DialogFormButtonContainer>
          <Button color="danger" isCancel onClick={this.onClose}>Fechar</Button>
        </DialogFormButtonContainer>
      </Dialog>
    );
  }
}

const mapStateToProps = ({ dialog, data_source }) => ({ dialog, data_source });

export default connect(
  mapStateToProps,
  {
    ...DialogActions,
    ...DataSourceActions,
  },
)(DatabaseDialog);
