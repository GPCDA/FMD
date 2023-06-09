import React from 'react';
import { Provider } from 'react-redux';
import ReduxToastr from 'react-redux-toastr';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import GlobalStyle, { materialUIStyle } from './styles/global';

import store from './store';
import Routes from './routes';

require('dotenv').config({
  path: process.env.NODE_ENV === 'development' ? '.env.development' : '.env',
});

const App = () => (
  <Provider store={store}>
    <>
      <MuiThemeProvider theme={materialUIStyle}>
        <Routes />
        <ReduxToastr
          timeOut={4000}
          newestOnTop={false}
          preventDuplicates
          position="top-right"
          transitionIn="fadeIn"
          transitionOut="fadeOut"
          progressBar
          closeOnToastrClick
        />
      </MuiThemeProvider>
      <GlobalStyle />
    </>
  </Provider>
);

export default App;
