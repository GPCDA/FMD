import pandas as pd
from json import loads
from flask_restful import Resource
from flask import current_app
from flask_jwt_extended import jwt_required
from Model import FileModel


class FileData(Resource):
    __sep="," #\*\,\-\)
    
    @jwt_required
    def get(self, key):
        file = FileModel.query.filter_by(id=key).first()

        upload_folder = current_app.config.get('UPLOAD_FOLDER')
        path = f"{upload_folder}/{file.file_id}"

        df = pd.read_csv(path, sep=self.__sep)

        return loads(df.to_json(orient="records"))
    
    