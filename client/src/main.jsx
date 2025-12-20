import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthContextProvider } from './context/authContext';
import { ThemeProvider } from './context/theme-provider';
import './index.css';
import { router } from './router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthContextProvider>
          <RouterProvider router={router} />
        </AuthContextProvider>
      </ThemeProvider>
    </MantineProvider>
  </StrictMode>
);
