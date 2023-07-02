import traceback
from Model import db
from utils import utils
from sqlalchemy import desc
from datetime import datetime
from resources.File import File
from flask_restful import Resource
from flask import request, current_app
from flask_jwt_extended import jwt_required
from services import carte


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

            execute_params = {
              "trans": carte.transformations()['testar_conexao']
            }
            executeBody = {
              'url': payload['url'],
              'driver': payload['driver'],
              'user': payload['user'],
              'password': payload['password'],
              'query': payload['query']
            }
            
            response = carte.execute(execute_params, executeBody)
            print(response.raw)
            print(response.text, response.ok)

            return response.json()

        except:
            traceback.print_exc()
            return {'msg': f"Error on test database connection"}, 500
