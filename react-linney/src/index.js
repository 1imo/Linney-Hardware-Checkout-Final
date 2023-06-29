import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from 'react-auth-kit';
import { UsrContextHandler } from "./context/UsrContext";
import { DevContextHandler } from "./context/DevContext";
import { CookiesProvider } from 'react-cookie';
import { BrowserRouter } from 'react-router-dom';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <AuthProvider
    authType={"cookie"}
    authName={"_auth"}
    cookieDomain={window.location.hostname}
    cookieSecure={false}>
      <BrowserRouter>
      <DevContextHandler>
        <UsrContextHandler>
          <CookiesProvider>
            <App />
          </CookiesProvider>
        </UsrContextHandler>
      </DevContextHandler>
      </BrowserRouter>
    </AuthProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
