import React, { PureComponent } from 'react';
import querystring from 'query-string';
import Select from 'react-select';
import {
  DialogForm, DialogLabelGroup,
  DialogLabel, DialogInput, Flex, DialogSpan, selectStyle,
} from '../../../../../styles/global';
import CodeEditor from '../../../../CodeEditor';
import Button from '../../../../../styles/Button';
import carte, { transformations } from '../../../../../services/carte';

const drivers = [
  {
    label: 'PostgreSQL',
    value: 'org.postgresql.Driver',
  },
  {
    label: 'MySQL',
    value: 'org.postgresql.Driver',
  },
  {
    label: 'Oracle',
    value: 'org.postgresql.Driver',
  },
];

export class Database extends PureComponent {
  testDatabaseConnection = async () => {
    const {
      url, driver, user, password, query,
    } = this.props.database;
    const executeParams = {
      trans: transformations.testarConexao, url, driver, user, password, query,
    };
    // const executeBody = {
    //   url, driver, user, password, query,
    // };
    const urlQueryParams = querystring.stringifyUrl({ url: '', query: executeParams });
    // const bodyQueryParams = querystring.stringifyUrl({ url: '', query: executeBody }).slice(1);
    // console.log(executeBody, bodyQueryParams);
    const resultTest = await carte.execute.get(
      urlQueryParams,
      // bodyQueryParams,
      // { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
      .then((response) => response.data.data[0]).catch((err) => err);

    console.log(resultTest);
  }

  render() {
    const {
      name, setName, database, setDatabase,
    } = this.props;

    console.log(database);

    return (
      <DialogForm>
        <DialogLabelGroup>
          <DialogLabel htmlFor="name">Fonte de dados*:</DialogLabel>
          <DialogInput
            id="name"
            name="name"
            autoComplete="off"
            defaultValue={name}
            onChange={(event) => setName(event.target.value)}
          />
        </DialogLabelGroup>

        <DialogLabelGroup>
          <DialogLabel htmlFor="database-url">URL*: </DialogLabel>
          <DialogInput
            id="database-url"
            name="database-url"
            autoComplete="off"
            defaultValue={database.url}
            onChange={(event) => setDatabase({ ...database, url: event.target.value })}
          />
        </DialogLabelGroup>

        <DialogLabelGroup>
          <DialogLabel htmlFor="database-url">Driver*: </DialogLabel>
          <Select
            isSearchable
            options={drivers}
            value={drivers.find((driver) => driver.value === database.driver)}
            noOptionsMessage={() => 'Sem drivers'}
            placeholder="Selecione o driver"
            onChange={(newValue) => setDatabase({ ...database, driver: newValue.value })}
            styles={selectStyle}
          />
        </DialogLabelGroup>

        <Flex>
          <DialogLabelGroup>
            <DialogLabel htmlFor="database-user">Usuário: </DialogLabel>
            <DialogInput
              id="database-user"
              name="database-user"
              autoComplete="off"
              defaultValue={database.user}
              onChange={(event) => setDatabase({ ...database, user: event.target.value })}
            />
          </DialogLabelGroup>

          <DialogLabelGroup>
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

        <DialogLabelGroup>
          <Flex style={{ justifyContent: 'space-between' }}>
            <DialogLabel htmlFor="database-query">Consulta*: </DialogLabel>
            <Button filled size="small" onClick={this.testDatabaseConnection}>Testar</Button>
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
