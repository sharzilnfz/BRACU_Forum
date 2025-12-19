import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import './index.css';
import { router } from './router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <h1 className="text-center text-3xl font-bold pt-4 bg-gray-950 text-cyan-300">
      BRACU FORUM
    </h1> */}
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
