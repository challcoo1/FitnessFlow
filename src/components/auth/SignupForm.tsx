'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firebaseConfig } from '@/lib/firebaseConfig'; // Assuming firebaseConfig is in lib
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // Check if Firebase configuration is loaded
    if (!firebaseConfig || !firebaseConfig.apiKey) {
      setError('Firebase configuration is not loaded. Please check your environment variables.');
      setLoading(false);
      return;
    }

    // Check if auth is initialized
    if (!auth) {
      setError('Firebase Auth is not initialized.');
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Signup successful, maybe redirect or show a success message
      console.log('Signup successful!');
      toast({
        title: "Signup Successful",
        description: "Your account has been created.",
      });
      // You might want to clear the form or redirect the user here
    } catch (signupError: any) {
      setError(signupError.message || 'Signup failed. Please try again.'); // Display Firebase auth errors
      console.error("Signup Error:", signupError);
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: signupError.message || "Failed to sign up. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="signup-email">Email</Label>
              <Input 
                id="signup-email" 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="signup-password">Password</Label>
              <Input 
                id="signup-password" 
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
        <Button onClick={handleSignup} disabled={loading} className="w-full">
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </CardFooter>
    </Card>
  );
}

