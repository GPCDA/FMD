import React, { PureComponent } from 'react';
import {
  DialogForm, DialogLabelGroup,
  DialogLabel, DialogInput, Flex, DialogSpan,
} from '../../../../../styles/global';
import CodeEditor from '../../../../CodeEditor';
import Button from '../../../../../styles/Button';

export class Database extends PureComponent {
  render() {
    const {
      name, setName, database, setDatabase,
    } = this.props;

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
            <Button filled size="small" onClick={() => alert('ok')}>Testar</Button>
          </Flex>
          <CodeEditor
            id="database-query"
            defaultValue={database.query}
            onChange={(event) => setDatabase({ ...database, query: event.target?.value || '' })}
          />
        </DialogLabelGroup>

        <DialogSpan style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>* Bancos de dados aceitos: PostgreSQL, MySQL, Oracle</DialogSpan>

      </DialogForm>
    );
  }
}
