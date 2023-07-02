import requests
from flask import current_app
from urllib.parse import urlencode

def transformations():
    return {
        "testar_conexao": f"{current_app.config.get('CARTE_LOCATION')}/testarConexao/connectiongetmetadata.ktr", # (url, driver, user, password, query) Get database connection and sql query
    }

def execute(execute_params = {}, execute_body = {}):
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    query_params=''
    query_body=''

    if execute_params:
        print(query_params)
        query_params = f'?{urlencode(execute_params)}'

    if execute_body:
        query_body = f'{urlencode(execute_body)}'

    url = f"{current_app.config.get('CARTE_BASE_URI')}/kettle/executeTrans{query_params}"
    print(url, query_body, headers)
    return requests.post(url, data=query_body, headers=headers)

