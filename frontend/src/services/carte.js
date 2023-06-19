import axios from 'axios';

export default {
  execute: axios.create({
    baseURL: `http://${process.env.REACT_APP_CARTE_USER}:${process.env.REACT_APP_CARTE_PASS}@${process.env.REACT_APP_CARTE_HOST}/kettle/executeTrans`,
  }),
};

export const transformations = {
  testarConexao: `${process.env.REACT_APP_CARTE_LOCATION}/testarConexao/connectiongetmetadata.ktr`, // (url, driver, user, password, query) Get database connection and sql query
};
