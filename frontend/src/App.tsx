import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './app/routes';
import { AuthProvider } from './app/context/AuthContext';
import { ErrorBoundary } from './app/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
