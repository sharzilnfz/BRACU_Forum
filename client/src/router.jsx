import { GalleryVerticalEnd } from 'lucide-react';
import { createBrowserRouter } from 'react-router-dom';
import Page from './App/dashboard/Page';
import { LoginForm } from './components/login-form';
import { ModeToggle } from './components/mode-toggle';
import { SignupForm } from './components/signup-form';

export const router = createBrowserRouter([
  { path: '/', element: <Page /> },
  {
    path: '/signup',
    element: (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="#"
            className="flex items-center gap-2 self-center font-medium text-foreground"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            BRACU Forum
          </a>
          <SignupForm />
        </div>
      </div>
    ),
  },
  {
    path: '/signin',
    element: (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 relative">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            BRACU Forum
          </a>
          <LoginForm />
        </div>
      </div>
    ),
  },
]);
