import traceback
from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required
from services import carte
from urllib.parse import unquote


class DatabaseConnectionTest(Resource):
    @jwt_required
    def post(self):
        try:
            expected_fields = ['url', 'driver', 'user', 'password', 'query']
            payload = request.get_json()

            missing_fields = []
            for field in expected_fields:
                if field not in payload:
                    missing_fields.append(field)

            if missing_fields:
                return {'msg': f"Campos obrigatórios ausentes: {', '.join(missing_fields)}"}, 400

            transformation = carte.transformations()['testar_conexao']
            executeBody = {
              'url': payload['url'],
              'driver': payload['driver'],
              'username': payload['user'],
              'password': payload['password'],
              'query': payload['query']
            }
            
            response = carte.executeTrans(transformation, executeBody).json()
            
            ExecutionLogText = response['data'][0]['ExecutionLogText']
            ExecutionResult = response['data'][0]['ExecutionResult']
            ExecutionNrErrors = response['data'][0]['ExecutionNrErrors']

            if ExecutionResult == 'false':
                errorMessage = '\n'.join([line.split('\n')[0] for line in unquote(ExecutionLogText).split('Table input.0 - ')[4:6]])

                return {'msg': errorMessage}, 400
            elif (bool(ExecutionNrErrors)):
                errorMessage = '\n'.join([line.split('\n')[0] for line in unquote(ExecutionLogText).split('Table input.0 - ')[14:16]])
                return {'msg': errorMessage}, 400

            return {'msg': "Conexão bem sucedida"}, 200

        except:
            traceback.print_exc()
            return {'msg': f"Error on test database connection"}, 500
