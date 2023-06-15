import secrets
import traceback
import json
from Model import db
from utils import utils
from sqlalchemy import desc
from datetime import datetime
from resources.File import File
from flask_restful import Resource
from flask import request, current_app
from flask_jwt_extended import jwt_required
from Model import FileModel, ContextModel, ContextModelSchema, ContextFieldModel, ContextFieldSchema


class Context(Resource):

    ALLOWED_EXTENSIONS = {'json'}

    def allowed_file(self, filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.ALLOWED_EXTENSIONS

    @jwt_required
    def get(self):
        try:
            res = db.session.query(ContextModel) \
                .order_by(desc(ContextModel.created_at)).all()

            schema = ContextModelSchema(many=True)
            data = schema.dump(res)

            return data

        except:
            traceback.print_exc()
            return {'msg': f"Error on list contexts"}, 500

    @jwt_required
    def post(self):
        try:
            # data = request.get_json()
            if 'file' not in request.files:
                return {'msg': 'No file part'}, 500

            file = request.files['file']
            if not file or not self.allowed_file(file.filename):
                return {'msg': 'Extension file invalid'}, 500
        
            file.seek(0)
            fileContentString = file.read()
            fileContent = json.loads(fileContentString)
            if 'metadados' not in fileContent or 'cabecalho' not in fileContent['metadados'] or 'campos' not in fileContent['metadados']:
                return {'msg': 'No file part'}, 500
            
            fileContent = fileContent['metadados']

            contextModel = ContextModel(
                name=fileContent['cabecalho'].get('titulo'),
                description=fileContent['cabecalho'].get('descricao') 
            )

            db.session.add(contextModel)
            db.session.commit()

            fieldModels = [
                ContextFieldModel(
                    code=field.get('codigo'),
                    description=field.get('descricao'),
                    type=field.get('tipo'),
                    size=field.get('tamanho'),
                    allowed_values=field.get('valores_permitidos'),
                    # context_id=contextModel.id
                    context=contextModel
                ) for field in fileContent['campos']
            ]

            db.session.add_all(fieldModels)
            db.session.commit()

            return self.get()

        except:
            traceback.print_exc()
            return {'msg': f"Error on create context"}, 500

    @jwt_required
    def delete(self, key):
        try:
            datasource = ContextModel.query.filter_by(id=key).first()
            file = FileModel.query.filter_by(id=datasource.file_id).first()

            path = f"{current_app.config.get('UPLOAD_FOLDER')}/{file.file_id}"
            utils.delete_file(path)

            db.session.delete(datasource)
            db.session.commit()

            db.session.delete(file)
            db.session.commit()

            return self.get()

        except:
            traceback.print_exc()
            return {'msg': f"Error on delete context"}, 500
