import { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dumbbell, Loader2, LogIn } from 'lucide-react';
import { handleApiError } from '@/utils/handleApiError';

// TODO: error handlin on login page if user or password are incorrect
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle the authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Redirect to dashboard after successful login
      navigate('/payments');
    } catch (error: unknown) {
      // Use standardized error handler for API failures
      handleApiError(
        error,
        'Falha na autenticação. Verifique suas credenciais.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex items-center justify-center h-screen bg-muted/40 p-4'>
      <Card className='w-full max-w-sm shadow-lg'>
        <CardHeader className='space-y-1 text-center'>
          <div className='flex justify-center mb-2'>
            <div className='rounded-full bg-primary p-3 text-primary-foreground'>
              <Dumbbell className='size-6' />
            </div>
          </div>
          <CardTitle className='text-2xl font-bold'>My Training Club</CardTitle>
          <CardDescription>
            Insira suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>E-mail</Label>
              <Input
                id='email'
                type='email'
                placeholder='admin@MyClub.com'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className='grid gap-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Senha</Label>
              </div>
              <Input
                id='password'
                type='password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>

          <CardFooter className='mt-8'>
            <Button
              type='submit'
              className='w-full gap-2'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <LogIn className='size-4' />
              )}
              {isSubmitting ? 'Autenticando...' : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
