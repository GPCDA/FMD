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
from urllib.parse import unquote


class DatabaseConnectionFields(Resource):
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

            transformation = carte.transformations()['capturar_metadata']
            executeBody = {
              'url': payload['url'],
              'driver': payload['driver'],
              'username': payload['user'],
              'password': payload['password'],
              'query': payload['query']
            }
            
            response = carte.executeTrans(transformation, executeBody).json()
            
            metadata = response['data']

            if not metadata:
                return {'msg': 'Metadata not found'}, 400
            
            fields = []
            for column in metadata:
                fields.append({
                    'value': column['Fieldname'],
                    'label': column['Fieldname']
                })

            return fields, 200

        except:
            traceback.print_exc()
            return {'msg': f"Error on get database metadata"}, 500
