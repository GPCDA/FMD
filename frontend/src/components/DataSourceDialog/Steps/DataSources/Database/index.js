import React, { PureComponent, useState } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Creators as DataBaseConnectionActions } from '../../../../../store/ducks/data_base_connection';
import {
  DialogForm, DialogLabelGroup,
  DialogLabel, DialogInput, Flex, selectStyle,
} from '../../../../../styles/global';
import CodeEditor from '../../../../CodeEditor';
import Button from '../../../../../styles/Button';

class DatabaseComponent extends PureComponent {
  testDatabaseConnection = async () => {
    const {
      url, driver, user, password, query,
    } = this.props.database;

    this.props.postDataBaseConnectionTest({
      url, driver: driver.value, user, password, query,
    });
  }

  render() {
    const {
      name, setName, database, setDatabase,
    } = this.props;
    const { data: jdbcDrivers } = this.props.jdbc_driver;

    return (
      <DialogForm>
        <DialogLabelGroup className="fonte-dados">
          <DialogLabel htmlFor="name">Fonte de dados*:</DialogLabel>
          <DialogInput
            id="name"
            name="name"
            autoComplete="off"
            defaultValue={name}
            onChange={(event) => setName(event.target.value)}
          />
        </DialogLabelGroup>

        <DialogLabelGroup className="url-conexao">
          <DialogLabel htmlFor="database-url">URL*: </DialogLabel>
          <DialogInput
            id="database-url"
            name="database-url"
            autoComplete="off"
            defaultValue={database.url}
            onChange={(event) => setDatabase({ ...database, url: event.target.value })}
          />
        </DialogLabelGroup>

        <DialogLabelGroup className="driver-conexao">
          <DialogLabel htmlFor="database-url">Driver*: </DialogLabel>
          <Select
            isSearchable
            options={jdbcDrivers.asMutable()}
            value={database.driver}
            noOptionsMessage={() => 'Sem drivers'}
            placeholder="Selecione o driver"
            onChange={(newValue) => setDatabase({ ...database, driver: newValue })}
            styles={selectStyle}
          />
        </DialogLabelGroup>

        <Flex>
          <DialogLabelGroup className="usuario-db">
            <DialogLabel htmlFor="database-user">Usuário: </DialogLabel>
            <DialogInput
              id="database-user"
              name="database-user"
              autoComplete="off"
              defaultValue={database.user}
              onChange={(event) => setDatabase({ ...database, user: event.target.value })}
            />
          </DialogLabelGroup>

          <DialogLabelGroup className="senha-db">
            <DialogLabel htmlFor="database-password">Senha: </DialogLabel>
            <DialogInput
              id="database-password"
              name="database-password"
              type="password"
              defaultValue={database.password}
              onChange={(event) => setDatabase({ ...database, password: event.target.value })}
            />
          </DialogLabelGroup>
        </Flex>

        <DialogLabelGroup className="consulta-db">
          <Flex style={{ justifyContent: 'space-between' }}>
            <DialogLabel htmlFor="database-query">Consulta*: </DialogLabel>
            <Button
              filled
              size="small"
              disabled={
                !(database.url && database.query && database.driver)
              }
              onClick={this.testDatabaseConnection}
            >
              Testar
            </Button>
          </Flex>
          <CodeEditor
            id="database-query"
            defaultValue={database.query}
            onChange={(value) => setDatabase({ ...database, query: value })}
          />
        </DialogLabelGroup>

      </DialogForm>
    );
  }
}

const mapStateToProps = ({ jdbc_driver }) => ({ jdbc_driver });

export const Database = connect(
  mapStateToProps,
  {
    ...DataBaseConnectionActions,
  },
)(DatabaseComponent);
