import React, { PureComponent } from 'react';
import Select from 'react-select';
import {
  DialogForm, SelectText, selectStyle,
} from '../../../styles/global';

export class ContextMap extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedContext: null,
      contextOptions: [],
      datasourceFieldOptions: [],
    };
  }

  componentDidMount() {
    this.setState((prevState) => ({
      ...prevState,
      selectedContext: this.props.contexts?.find(
        (context) => context.id === this.props.contextMap.context?.value,
      ),
      contextOptions: this.props.contexts?.map((context) => ({
        label: context.name,
        value: context.id,
      })),
      datasourceFieldOptions: this.props.datasourceFields,
    }));
  }

  componentDidUpdate(prevProps/* , prevState, snapshot */) {
    if (!!this.props.contexts?.length && prevProps.contexts !== this.props.contexts) {
      this.setState((prevState) => ({
        ...prevState,
        contextOptions: this.props.contexts.map((context) => ({
          label: context.name,
          value: context.id,
        })),
      }));
    }

    if (prevProps.contextMap.context !== this.props.contextMap.context) {
      this.setState((prevState) => ({
        ...prevState,
        selectedContext: this.props.contexts.find(
          (context) => context.id === this.props.contextMap.context.value,
        ),
      }));
    }

    if (!!this.props.datasourceFields?.length && prevProps.datasourceFields !== this.props.datasourceFields) {
      this.setState((prevState) => ({
        ...prevState,
        datasourceFieldOptions: this.props.datasourceFields,
      }));
    }
  }

  render() {
    const { contextMap, setContextMap } = this.props;
    const { selectedContext, contextOptions, datasourceFieldOptions } = this.state;

    return (
      <DialogForm style={{ padding: '4rem 40px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem',
        }}
        >
          <SelectText style={{ flex: 1 }}>Selecione o Contexto*:</SelectText>
          <Select
            isSearchable
            options={contextOptions}
            value={contextMap.context}
            noOptionsMessage={() => 'Sem contextos'}
            placeholder="Selecione o contexto"
            onChange={(newValue) => setContextMap({ ...contextMap, context: newValue })}
            styles={{
              ...selectStyle,
              container: (provided) => ({
                ...provided,
                flex: 1,

                fontSize: 12,
              }),
            }}
          />
        </div>

        {
            selectedContext?.fields.map((contextField) => (
              <div
                key={contextField.code}
                style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem',
                }}
              >
                <SelectText style={{ flex: 1 }}>
                  {contextField.code}
                  *:
                </SelectText>
                <Select
                  isSearchable
                  options={datasourceFieldOptions}
                  value={contextMap.fieldMap[contextField.code]}
                  noOptionsMessage={() => 'Sem campos do banco de dados'}
                  placeholder="Selecione o contexto"
                  onChange={(newValue) => setContextMap({
                    ...contextMap,
                    fieldMap: {
                      ...contextMap.fieldMap,
                      [contextField.code]: newValue,
                    },
                  })}
                  styles={{
                    ...selectStyle,
                    container: (provided) => ({
                      ...provided,
                      flex: 1,

                      fontSize: 12,
                    }),
                  }}
                />
              </div>
            ))
        }

      </DialogForm>
    );
  }
}
