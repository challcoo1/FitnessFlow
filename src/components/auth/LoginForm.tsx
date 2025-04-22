'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig'; // Assuming firebaseConfig is in lib
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
     if (!email || !password) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Login successful, maybe redirect or show a success message
      console.log('Login successful!');
      // You might want to redirect the user to their dashboard here
    } catch (error: any) {
      setError(error.message); // Display Firebase auth errors
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input 
                id="login-email" 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input 
                id="login-password" 
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
        </Button>
      </CardFooter>
    </Card>
  );
}
