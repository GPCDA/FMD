import React, { PureComponent } from 'react';
import {
  DialogForm, DialogLabelGroup, DialogLabel, DialogInput,
} from '../../../../styles/global';
import { CSV, DATA_BASE } from '../../../../constants';

class SelectDataSourceType extends PureComponent {
  render() {
    const { defaultValue, setSelectedValue } = this.props;

    return (
      <DialogForm>
        <DialogLabelGroup>
          <DialogLabel>
            <DialogInput
              name="dataSource"
              type="radio"
              value={DATA_BASE}
              defaultChecked={defaultValue === DATA_BASE}
              onChange={(event) => setSelectedValue(event.target.value)}
            />
            Conexão com banco de dados
          </DialogLabel>

          <DialogLabel>
            <DialogInput
              name="dataSource"
              type="radio"
              value={CSV}
              defaultChecked={defaultValue === CSV}
              onChange={(event) => setSelectedValue(event.target.value)}
            />
            Upload de arquivo
          </DialogLabel>
        </DialogLabelGroup>
      </DialogForm>
    );
  }
}

export default SelectDataSourceType;
