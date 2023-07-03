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
    request_params=''
    request_body=''

    if execute_params:
        request_params = f'?{urlencode(execute_params)}'

    if execute_body:
        request_body = f'{urlencode(execute_body)}'

    endpoint = f"{current_app.config.get('CARTE_BASE_URI')}/kettle/executeTrans/{request_params}"
    return requests.post(endpoint, data=request_body, headers=headers)

