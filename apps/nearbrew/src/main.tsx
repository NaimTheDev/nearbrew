import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { NearBrewDetailsPage } from '../libs/nearbrew-libs/src';
import './styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/details" element={<NearBrewDetailsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
