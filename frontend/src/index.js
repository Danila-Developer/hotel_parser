import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@elastic/eui/dist/eui_theme_light.css';
import './styles/__helpers.css'
import './styles/__global.css'

import { EuiProvider } from '@elastic/eui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'


const root = ReactDOM.createRoot(document.getElementById('root'));
const queryClient = new QueryClient()
root.render(
  <React.StrictMode>
      <EuiProvider colorMode="light">
          <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                  <App />
              </BrowserRouter>
          </QueryClientProvider>
      </EuiProvider>
  </React.StrictMode>
);

