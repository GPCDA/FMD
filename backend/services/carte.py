import requests
from flask import current_app
from urllib.parse import urlencode

def transformations():
    return {
        "testar_conexao": f"{current_app.config.get('CARTE_LOCATION')}/testarConexao/connectiongetmetadata.ktr", # (url, driver, user, password, query) Get database connection and sql query
        "capturar_metadata": f"{current_app.config.get('CARTE_LOCATION')}/testarConexao/connectiongetmetadata_metadataonly.ktr", # (url, driver, user, password, query) Get database connection and sql query
        "ingerir_banco_de_dados_1": f"{current_app.config.get('CARTE_LOCATION')}/IngestorBD/cria_headers_csv.ktr", # (datasource_id, filename) Get database connection and sql query
        "ingerir_banco_de_dados_2": f"{current_app.config.get('CARTE_LOCATION')}/IngestorBD/ingestor_bd.ktr", # (url, driver, user, password, query, datasource_id, filename) Get database connection and sql query
        # "ingerir_banco_de_dados_2": f"{current_app.config.get('CARTE_LOCATION')}/IngestorBD/Transformation_1.ktr", # (url, driver, user, password, query, datasource_id, filename) Get database connection and sql query
    }

# def jobs():
#     return {
#         "ingerir_banco_de_dados": f"{current_app.config.get('CARTE_LOCATION')}/IngestorBD/job_principal_ingestor_bd.kjb", # (url, driver, user, password, query) Get database connection, sql query and context map
#     }

def executeTrans(trans = '', execute_body = {}):
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    request_params=''
    request_body=''

    if trans: request_params = f'?{urlencode({ "trans": trans })}'

    if execute_body: request_body = f'{urlencode(execute_body)}'

    endpoint = f"{current_app.config.get('CARTE_BASE_URI')}/kettle/executeTrans/{request_params}"
    return requests.post(endpoint, data=request_body, headers=headers)

# def executeJob(job = '', execute_body = {}):
#     headers = {
#         'Content-Type': 'application/x-www-form-urlencoded'
#     }
#     request_params=''
#     request_body=''

#     if job: request_params = f'?{urlencode({ "job": job })}'

#     if execute_body: request_body = f'{urlencode(execute_body)}'

#     endpoint = f"{current_app.config.get('CARTE_BASE_URI')}/kettle/executeJob/{request_params}"
#     return requests.post(endpoint, data=request_body, headers=headers)

