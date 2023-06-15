from datetime import datetime
from flask import Flask
from marshmallow import Schema, fields as maFields, pre_load, validate
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import backref


ma = Marshmallow()
db = SQLAlchemy()

class TimestampMixin(object):
    created_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password = db.Column(db.String(128))
    created_at = db.Column(db.DateTime())
    updated_at = db.Column(db.DateTime())

    def __init__(self, username, email, password, created_at, updated_at):
        self.username = username
        self.email = email
        self.password = password
        self.created_at = created_at
        self.updated_at = updated_at


class UserSchema(ma.Schema):
    id = maFields.Integer(dump_only=True)
    username = maFields.String(required=True)
    email = maFields.String(required=True)
    password = maFields.String(required=True)
    created_at = maFields.DateTime(required=True)
    updated_at = maFields.DateTime(required=True)


class Lms(db.Model, TimestampMixin):
    __tablename__ = 'lms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    description = db.Column(db.String(), nullable=False)
    url = db.Column(db.Text())
    token = db.Column(db.Text())
    version = db.Column(db.String())

    def __init__(self, name, url, version, token):
        self.name = name
        self.url = url
        self.version = version
        self.token = token


class LmsSchema(ma.Schema):
    id = maFields.Integer(dump_only=True)
    name = maFields.String()
    description = maFields.String()
    url = maFields.String()
    token = maFields.String()
    version = maFields.String()
    created_at = maFields.DateTime()
    updated_at = maFields.DateTime()


class Indicator(db.Model):
    __tablename__ = 'indicators'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False, index=True)
    description = db.Column(db.String(), nullable=False)
    lms = db.Column(db.String(), nullable=False)
    created_at = db.Column(db.DateTime(), nullable=False)
    updated_at = db.Column(db.DateTime(), nullable=False)

    def __init__(self, name, description, lms, created_at, updated_at):
        self.name = name
        self.description = description
        self.lms = lms
        self.created_at = created_at
        self.updated_at = updated_at


class IndicatorSchema(ma.Schema):
    id = maFields.Integer(dump_only=True)
    name = maFields.String()
    description = maFields.String()
    lms = maFields.String()
    created_at = maFields.DateTime()
    updated_at = maFields.DateTime()

class TrainModel(db.Model, TimestampMixin):
    __tablename__ = 'train_models'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    description = db.Column(db.String())
    model_id = db.Column(db.String(), nullable=False, index=True)
    score = db.Column(db.Float())
    api_key = db.Column(db.String())
    qtd_predict = db.Column(db.Integer(), default=0)
    last_predict_at = db.Column(db.DateTime())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def __init__(self, name, description, model_id, score, api_key, user_id):
        self.name = name
        self.description = description
        self.model_id = model_id
        self.score = score
        self.api_key = api_key
        self.user_id = user_id


class TrainModelSchema(ma.Schema):
    id = maFields.Integer(dump_only=True)
    name = maFields.String()
    description = maFields.String()
    user_id = maFields.Integer()
    model_id = maFields.String()
    score = maFields.Float()
    api_key = maFields.String()
    created_at = maFields.DateTime()
    updated_at = maFields.DateTime()
    qtd_predict = maFields.Integer()
    last_predict_at = maFields.DateTime()


class DatasourceModel(db.Model, TimestampMixin):
    __tablename__ = 'datasources'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    file_id = db.Column(db.Integer, db.ForeignKey('files.id'), nullable=False)

    def __init__(self, name, file_id):
        self.name = name
        self.file_id = file_id


class DatasourceModelSchema(ma.Schema):
    id = maFields.Integer(dump_only=True)
    name = maFields.String()
    file_id = maFields.Integer()
    size = maFields.Float()
    created_at = maFields.DateTime()
    updated_at = maFields.DateTime()


class FileModel(db.Model, TimestampMixin):
    __tablename__ = 'files'
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.String(), nullable=False)
    filename = db.Column(db.String(), nullable=False)
    extension =  db.Column(db.String(), nullable=False)
    size =  db.Column(db.Float(), nullable=False)

    def __init__(self, file_id, filename, extension, size):
        self.file_id = file_id
        self.filename = filename
        self.extension = extension
        self.size = size


class FileModelSchema(ma.Schema):
    id = maFields.Integer(dump_only=True)
    file_id = maFields.String()
    filename = maFields.String()
    extension = maFields.String()
    size = maFields.Float()
    created_at = maFields.DateTime()
    updated_at = maFields.DateTime()


class ContextModel(db.Model, TimestampMixin):
    __tablename__ = 'contexts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    description = db.Column(db.String())

    def __init__(self, name, description):
        self.name = name
        self.description = description


class ContextModelSchema(ma.Schema):
    id = maFields.Integer(dump_only=True)
    name = maFields.String()
    description = maFields.String()
    fields = maFields.List(maFields.Nested('ContextFieldSchema', exclude=('context', )))
    created_at = maFields.DateTime()
    updated_at = maFields.DateTime()


class ContextFieldModel(db.Model, TimestampMixin):
    __tablename__ = 'context_fields'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String())
    description = db.Column(db.String())
    type = db.Column(db.String())
    size = db.Column(db.Integer())
    allowed_values = db.Column(db.String())
    context_id = db.Column(db.Integer, db.ForeignKey('contexts.id', onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    context = db.relationship('ContextModel', backref=backref('fields', passive_deletes=True))

    def __init__(self, code, description, type, size, allowed_values, context):
        self.code = code
        self.description = description
        self.type = type
        self.size = size
        self.allowed_values = allowed_values
        # self.context_id = context_id
        self.context = context


class ContextFieldSchema(ma.Schema):
    id = maFields.Integer(dump_only=True)
    code = maFields.String()
    description = maFields.String()
    type = maFields.String()
    size = maFields.Integer()
    allowed_values = maFields.String()
    context_id = maFields.Integer()
    context = maFields.Nested('ContextModelSchema')
    created_at = maFields.DateTime()
    updated_at = maFields.DateTime()

