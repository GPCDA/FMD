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
          display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.25rem',
        }}
        >
          <SelectText style={{ flex: 1 }}>Selecione o Contexto*:</SelectText>
          <div style={{ display: 'flex' }}>
            <Select
              isSearchable
              options={contextOptions}
              value={contextMap.context}
              noOptionsMessage={() => 'Sem contextos'}
              placeholder="Selecione o contexto"
              onChange={(newValue) => setContextMap({
                ...contextMap,
                context: newValue,
                fieldMap: this.props.contexts?.find((context) => context.id === newValue?.value)?.fields
                  ?.reduce((fields, field) => ({ ...fields, [field.description]: '' }), {}),
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
        </div>

        {
            selectedContext?.fields.map((contextField) => (
              <div
                key={contextField.description}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                }}
              >
                <SelectText style={{ flex: 1 }}>
                  {contextField.description}
                  *:
                </SelectText>
                <Select
                  isSearchable
                  options={datasourceFieldOptions}
                  value={datasourceFieldOptions.find((option) => option.value === contextMap.fieldMap[contextField.description])}
                  noOptionsMessage={() => 'Sem campos do banco de dados'}
                  placeholder="Selecione o contexto"
                  onChange={(newValue) => setContextMap({
                    ...contextMap,
                    fieldMap: {
                      ...contextMap.fieldMap,
                      [contextField.description]: newValue.value,
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
