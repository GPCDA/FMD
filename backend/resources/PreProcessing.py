import json
import uuid
import traceback
import numpy as np
import pandas as pd
from utils import utils
from scipy.stats import spearmanr
from flask_restful import Resource
from flask import request, current_app
from sklearn.impute import SimpleImputer


class PreProcessing(Resource):

    def get_corr(self, df):
        correlation_items = {}
        payload = request.get_json()

        target_col_name = payload['target']

        for col in df:
            try:
                if target_col_name != col:
                    correlation_items[col] = spearmanr(
                        df[col], df[target_col_name])[0]
            except:
                pass

        return correlation_items

    def get_indicators_description(self):
        descriptions = {}
        payload = request.get_json()
        lms = payload['lms']

        query = f"""SELECT
                        name,
                        description
                    FROM
                        indicators
                    WHERE
                        lms='{lms}'
                    AND
                        name IN ({utils.list_to_sql_string(payload['indicators'])})
                    GROUP BY
                        name, description, lms
                """

        data = utils.execute_query(query)

        for item in data:
            descriptions[item['name']] = item['description']

        return descriptions

    def get_dataframe_from_sql(self):
        query_where = ''
        where = 'WHERE'
        fields = "*"
        group_by = ''
        payload = request.get_json()

        if 'indicators' in payload and type(payload['indicators']) == list:
            fields = ", ".join(payload['indicators'])

        if 'courses' in payload and type(payload['courses']) == list and len(payload['courses']) > 0:
            query_where += f"""{where} curso IN ({utils.list_to_sql_string(payload['courses'])}) """
            where = 'AND'

        if 'subjects' in payload and type(payload['subjects']) == list and len(payload['subjects']) > 0:
            query_where += f"""{where} nome_da_disciplina IN ({utils.list_to_sql_string(payload['subjects'])}) """
            where = 'AND'

        if 'semesters' in payload and type(payload['semesters']) == list and len(payload['semesters']) > 0:
            query_where += f"""{where} semestre IN ({utils.list_to_sql_string(payload['semesters'])}) """

        if fields != '*':
            group_by = f"GROUP BY {fields}"

        query = f"""
                    SELECT
                        {fields}
                    FROM
                        {payload['lms']}
                        {query_where}
                        {group_by}
                """

        df = utils.execute_query(query=query, mode='pandas')

        return df

    def save_file(self, df):
        payload = request.get_json()

        if 'path' in payload:
            return payload['path']

        file_id = uuid.uuid4()
        path = f"{current_app.config.get('PRE_PROCESSING_RAW')}/{file_id}.csv"

        df.to_csv(path, index=False)

        return path

    def get_dataframe_from_csv(self):
        payload = request.get_json()

        path = payload['path']
        df = pd.read_csv(path)

        return df

    def get_dataframe(self):
        payload = request.get_json()

        if 'path' in payload:
            return self.get_dataframe_from_csv()
        else:
            return self.get_dataframe_from_sql()

    def get_df_pre_processed(self, df):
        payload = request.get_json()
        fill_value = None

        if 'pre_processing_constant' in payload:
            fill_value = payload['pre_processing_constant']

        if 'pre_processing_strategy' in payload and 'pre_processing_indicator' in payload:
            strategy = payload['pre_processing_strategy']
            indicator = payload['pre_processing_indicator']
            imp = SimpleImputer(strategy=strategy, fill_value=fill_value)
            df[[indicator]] = imp.fit_transform(df[[indicator]])

        return df

    def post(self):
        try:
            data = []
            eda_items = {}
            null_items = {}
            type_items = {}
            unique_items = {}
            is_processed = False
            correlation_items = {}

            payload = request.get_json()

            df = self.get_dataframe()
            df = self.get_df_pre_processed(df)
            indicators_description = self.get_indicators_description()

            correlation_items = self.get_corr(df)
            eda_items = json.loads(df.describe().to_json(force_ascii=False))
            null_items = df.isna().sum().apply(lambda x: x).to_dict()

            for column in df.columns:
                unique_items[column] = df[column].nunique()

            for column in df.columns:
                corr = None
                type_column = 'Categórico'
                descriptive = {
                    "count": None,
                    "mean": None,
                    "std": None,
                    "min": None,
                    "25%": None,
                    "50%": None,
                    "75%": None,
                    "max": None
                }

                if column in eda_items:
                    descriptive = eda_items[column]
                    type_column = 'Discreto'

                if column in correlation_items:
                    corr = utils.to_float(correlation_items[column])

                item = {
                    'name': column,
                    'description': indicators_description[column],
                    'type': type_column,
                    'missing': null_items[column],
                    'unique': unique_items[column],
                    'count': len(df.index),
                    'mean': utils.to_float(descriptive['mean']),
                    "std": utils.to_float(descriptive['std']),
                    "min": utils.to_float(descriptive['min']),
                    "25%": utils.to_float(descriptive['25%']),
                    "50%": utils.to_float(descriptive['50%']),
                    "75%": utils.to_float(descriptive['75%']),
                    "max": utils.to_float(descriptive['max']),
                    "corr": corr
                }

                data.append(item)

            path = self.save_file(df)

            if 'path' in payload and 'pre_processing_strategy' in payload and 'pre_processing_indicator' in payload:
                is_processed = True

            return {'data': data, 'path': path, 'is_processed': is_processed}

        except:
            traceback.print_exc()
            return {"msg": "Error on POST PreProcessing"}, 500
