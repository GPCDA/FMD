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
    DatabaseModel, ContextModel, DatasourceContextMapModel, datasource_context, \
    FileModel, FileModelSchema, JDBCDriverModel


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
            
            trans = carte.transformations()['ingerir_banco_de_dados']
            executeBody = {
              'url': data['url'],
              'driver': data['databaseModel'].driver.driverclass,
              'username': data['user'],
              'password': data['password'],
              'query': data['query'],
              "id_contexto": data['datasourceContextId'],
              "filename": filepath
            }
            print(trans, executeBody)


            carte.executeTrans(trans, executeBody)

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
            
            data['datasource'].contexts.append(context)
            
            db.session.add(data['datasource'])
            db.session.commit()


            datasourceId = data['datasource'].id
            contextId = context.id

            datasourceContextFound = db.session.query(datasource_context).filter(
                datasource_context.c.datasource_id==datasourceId, 
                datasource_context.c.context_id==contextId
            ).first()

            datasourceContextMapModels = [
                DatasourceContextMapModel(
                    context_field=key,
                    datasource_field=value,
                    datasource_context_id=datasourceContextFound.id
                ) for key, value in data['fieldMap'].items()
            ]

            db.session.add_all(datasourceContextMapModels)
            db.session.commit()

            return datasourceContextFound.id
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
            )
            
            data['contextMap']['datasource'] = datasourceModel
            # datasourceContextId = self.insert_context_map(data['contextMap'])

            if datasourceType.name == 'DB':
                data['database']['datasource'] = db.session.query(DatasourceModel).filter(DatasourceModel.name == 'doidera').first() #datasourceModel
                databaseModel = db.session.query(DatabaseModel).filter(DatabaseModel.id == 13).first()
                #self.insert_DB_instance(data['database'])

                data['database']['databaseModel'] = databaseModel
                data['database']['datasourceContextId'] = 12#datasourceContextId
                file = self.generate_DB_file(data['name'], data['database'])
                print(file, data['database']['datasource'])
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
