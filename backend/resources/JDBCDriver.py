import traceback
from Model import db
from utils import utils
from sqlalchemy import desc
from datetime import datetime
from resources.File import File
from flask_restful import Resource
from flask import request, current_app
from flask_jwt_extended import jwt_required
from Model import JDBCDriverModel, JDBCDriverModelSchema


class JDBCDriver(Resource):
    @jwt_required
    def get(self):
        try:
            fields = []
            res = db.session.query(JDBCDriverModel.id, JDBCDriverModel.created_at,
                                   JDBCDriverModel.name, JDBCDriverModel.driverclass) \
                .order_by(JDBCDriverModel.name).all()

            schema = JDBCDriverModelSchema(many=True)
            data = schema.dump(res)

            for driver in data.data:
                fields.append({
                    'value': driver['driverclass'],
                    'label': driver['name']
                })

            return fields

        except:
            traceback.print_exc()
            return {'msg': f"Error on list JDBC drivers"}, 500
