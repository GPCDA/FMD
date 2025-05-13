## Como rodar a aplicação com Docker

### Dependências

1. Docker instalado
2. Make instalado (opcional - Linux apenas)

#### Frontend

Primeira vez que for rodar:

1. cria o .env e preenche ele
```
SKIP_PREFLIGHT_CHECK=true
REACT_APP_SMARTLOOK=
REACT_APP_HOST=http://127.0.0.1:5000/api
REACT_APP_CARTE_LOCATION=/opt/pentaho/data-integration/transformations
REACT_APP_CARTE_HOST=pentaho
REACT_APP_CARTE_USER=cluster
REACT_APP_CARTE_PASS=cluster
SKIP_PREFLIGHT_CHECK=true
PUBLIC_URL="http://localhost:3000"
```


``` make setup ```

Nas próximas vezes é só rodar:

``` make run ```

ou se quiser rodar com docker

``` make run-docker ```


Se precisar mudar bibliotecas dependências, lembrar de usar o yarn.

#### Backend

0. Cria o .env.development

```
DB_HOST=postgres
DB_USER=root
DB_PORT=5432
DB_PWD=1234
DB_NAME=fmdev
CARTE_HOST=pentaho
CARTE_PORT=8081
CARTE_USER=cluster
CARTE_PASS=cluster
#Change [USER_HOME] to user home path
CARTE_LOCATION=/opt/pentaho/data-integration/transformations
```

1. Você vai precisar do Docker ainda e vai rodar o banco de dados, o Pentaho

A parte do Pentaho dá pra usar uma imagem pre pronta q eu já buildei, mas o Dockerfile tá em /pentaho

Pra rodar com docker
``` docker compose up --build ```

Se quiser rodar as migrations vc pode rodar qualquer comando dentro do container desse jeito:

``` 
docker-compose exec backend <comando>
```

Assim:
(primeiro tem que estar na pasta do backend)
``` 
cd backend &&
docker-compose exec backend python migrate.py db migrate && 
docker-compose exec backend python migrate.py db upgrade
```
