import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthProvider';
import { MainLayout } from './components/layout/main-layout';

// Shadcn UI components
import { Toaster } from '@/components/ui/sonner';

import { Members } from './components/pages/members/Members';
import { Plans } from './components/pages/plans/Plans';
import { Users } from './components/pages/users/Userss';
import { Login } from './components/pages/auth/Login';
import { Payments } from './components/pages/payments/Payments';
import { Expenses } from './components/pages/Expenses/Expenses';

// Private route wrapper to handle authentication and session validation
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { authenticated, loading } = useContext(AuthContext);

  // Display a loading state
  if (loading) {
    return (
      <div className='h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-400'>
        <div className='flex flex-col items-center gap-2'>
          <p className='animate-pulse'>Validando sessão...</p>
        </div>
      </div>
    );
  }

  return authenticated ? children : <Navigate to='/login' />;
};

// Simple dashboard overview (Home)
const Home = () => (
  <div className='space-y-4'>
    <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
      <div className='aspect-video rounded-xl bg-muted/50' />
      <div className='aspect-video rounded-xl bg-muted/50' />
      <div className='aspect-video rounded-xl bg-muted/50' />
    </div>
    <div className='min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min' />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path='/login' element={<Login />} />

          {/* Private routes */}
          <Route
            path='/'
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to='/payments' replace />} />

            <Route path='payments' element={<Payments />} />
            <Route path='members' element={<Members />} />
            <Route path='plans' element={<Plans />} />
            <Route path='users' element={<Users />} />
            <Route path='expenses' element={<Expenses />} />
            <Route path='dashboard' element={<Home />} />
          </Route>

          {/* Fallback not found routes */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Router>

      <Toaster richColors closeButton visibleToasts={9} expand={true} />
    </AuthProvider>
  );
}

export default App;
