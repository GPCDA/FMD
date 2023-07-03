import uuid
import traceback
from Model import db
from utils import utils
from sqlalchemy import desc
from flask_restful import Resource
from flask import request, current_app
from flask_jwt_extended import jwt_required
from services import carte
from Model import FileModel, DatasourceModel, DatasourceModelSchema, DatasourceTypeModel, DatabaseModel, ContextModel, DatasourceContextMapModel, datasource_context


class Datasource(Resource):

    def generate_DB_file(self, data):
        try:
            expected_fields = ['url', 'driver', 'user', 'password', 'query']
            payload = request.get_json()

            missing_fields = []
            for field in expected_fields:
                if field not in payload:
                    missing_fields.append(field)

            if missing_fields:
                return {'msg': f"Campos obrigatórios ausentes: {', '.join(missing_fields)}"}, 400

            job = carte.jobs()['ingerir_banco_de_dados']
            upload_folder = current_app.config.get('UPLOAD_FOLDER')
            extension = '.csv'
            file_id = f"{str(uuid.uuid4())}{extension}"

            if file and self.allowed_file(file.filename):
                file.save(os.path.join(upload_folder, file_id))
            else:
                return {'msg': 'Extension file invalid'}, 500
            
            data = {
                'id': file_id,
                'filename': file.filename,
                'extension': extension.replace('.', ''),
                'size': self.get_file_size(upload_folder, file_id),
                'url': f"{upload_folder}/{file_id}"
            }
            executeBody = {
              'url': data['url'],
              'driver': data['databaseModel'].driver.driverclass,
              'username': data['user'],
              'password': data['password'],
              'query': data['query'],
              "id_contexto": data['datasourceContextId'],
              "filename": ""
            }
            
            carte.executeJob(job, executeBody)

            return None
        except:
            traceback.print_exc()
            return None
        
    def insert_DB_instance(self, data):
        try:
            jdbcDriver = db.session.query(DatasourceTypeModel).filter(DatasourceTypeModel.name == data['driver']).first()

            databaseModel = DatabaseModel(
                url=data['url'],
                driver=jdbcDriver,
                user=data['user'],
                password=data['password'],
                query=data['query'],
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
            res = db.session.query(DatasourceModel.id, DatasourceModel.created_at,
                                   DatasourceModel.name, FileModel.size) \
                .join(FileModel, DatasourceModel.file_id == FileModel.id) \
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
                file_id=data['file_id'],
                type=datasourceType,
            )
            
            data['contextMap']['datasource'] = datasourceModel
            datasourceContextId = self.insert_context_map(data['contextMap'])

            if datasourceType.name == 'DB':
                data['database']['datasource'] = datasourceModel
                databaseModel = self.insert_DB_instance(data['database'])
                data['database']['databaseModel'] = databaseModel
                data['database']['datasourceContextId'] = datasourceContextId
                self.generate_DB_file(data['database'])

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
