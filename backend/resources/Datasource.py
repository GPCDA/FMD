import os
import uuid
import traceback
from Model import db
from utils import utils
from sqlalchemy import desc
from flask_restful import Resource
from flask import request, current_app
from flask_jwt_extended import jwt_required
from services import carte
from Model import FileModel, DatasourceModel, DatasourceModelSchema, DatasourceTypeModel, \
    DatabaseModel, ContextModel, DatasourceContextMapModel, FileModel, JDBCDriverModel


class Datasource(Resource):

    def get_file_size(self, filepath):
        file_length = os.stat(filepath).st_size
        
        return file_length

    def insert_on_database(self, data):
        try:
            model = FileModel(
                file_id=data['id'],
                filename=data['filename'],
                extension=data['extension'],
                size=data['size']
            )

            db.session.add(model)
            db.session.commit()

            return model
        except:
            traceback.print_exc()
            return None

    def generate_DB_file(self, name, data):
        try:
            upload_folder = current_app.config.get('UPLOAD_FOLDER')
            extension = '.csv'
            file_id = f"{str(uuid.uuid4())}"
            filepath = os.path.abspath(os.path.join(upload_folder, file_id))
            file_id = f"{file_id}{extension}"
            
            trans_1 = carte.transformations()['ingerir_banco_de_dados_1']
            trans_2 = carte.transformations()['ingerir_banco_de_dados_2']

            executeBody1 = {
              "datasource_id": data['datasourceId'],
              "filename": filepath
            }

            executeBody2 = {
                'url': data['url'],
                'driver': data['databaseModel'].driver.driverclass,
                'username': data['user'],
                'password': data['password'],
                'query': data['query'],
                "datasource_id": data['datasourceId'],
                "filename": filepath
            }

            carte.executeTrans(trans_1, executeBody1)
            carte.executeTrans(trans_2, executeBody2)

            data = {
                'id': file_id,
                'filename': f"{name}{extension}",
                'extension': extension.replace('.', ''),
                'size': self.get_file_size(f"{filepath}{extension}"),
                'url': f"{upload_folder}/{file_id}"
            }
            
            file = self.insert_on_database(data)

            return file
        except:
            traceback.print_exc()
            return None
        
    def insert_DB_instance(self, data):
        try:
            jdbcDriver = db.session.query(JDBCDriverModel).filter(JDBCDriverModel.name == data['driver']).first()

            databaseModel = DatabaseModel(
                url=data['url'],
                user=data['user'],
                password=data['password'],
                query=data['query'],
                driver=jdbcDriver,
                datasource=data['datasource']
            )

            db.session.add(databaseModel)
            db.session.commit()
            
            return databaseModel
        except:
            traceback.print_exc()
            return None

    def insert_context_map(self, data):
        try:
            context = db.session.query(ContextModel).filter(ContextModel.id == data['context']).first()
            
            data['datasource'].context = context
            
            db.session.add(data['datasource'])
            db.session.commit()

            datasourceContextMapModels = [
                DatasourceContextMapModel(
                    context_field=key,
                    datasource_field=value,
                    datasource_id=data['datasource'].id
                ) for key, value in data['fieldMap'].items()
            ]

            db.session.add_all(datasourceContextMapModels)
            db.session.commit()

            return data['datasource'].id
        except:
            traceback.print_exc()
            return None

    @jwt_required
    def get(self):
        try:
            res = db.session.query(DatasourceModel) \
                .order_by(desc(DatasourceModel.created_at)).all()

            schema = DatasourceModelSchema(many=True)
            data = schema.dump(res)

            return data

        except:
            traceback.print_exc()
            return {'msg': f"Error on list datasources"}, 500

    @jwt_required
    def post(self):
        try:
            data = request.get_json()

            datasourceType = db.session.query(DatasourceTypeModel).filter(DatasourceTypeModel.name == data['type']).first()

            datasourceModel = DatasourceModel(
                name=data['name'],
                file_id=data.get('file_id'),
                type=datasourceType,
                context=None
            )
            
            data['contextMap']['datasource'] = datasourceModel
            datasourceId = self.insert_context_map(data['contextMap'])

            if datasourceType.name == 'DB':
                data['database']['datasource'] = datasourceModel
                databaseModel = self.insert_DB_instance(data['database'])

                data['database']['databaseModel'] = databaseModel
                data['database']['datasourceId'] = datasourceId
                file = self.generate_DB_file(data['name'], data['database'])
                
                data['database']['datasource'].file = file
                db.session.add(data['database']['datasource'])
                db.session.commit()

            return self.get()

        except:
            traceback.print_exc()
            return {'msg': f"Error on create datasource"}, 500

    @jwt_required
    def delete(self, key):
        try:
            datasource = DatasourceModel.query.filter_by(id=key).first()
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
            return {'msg': f"Error on delete datasource"}, 500
