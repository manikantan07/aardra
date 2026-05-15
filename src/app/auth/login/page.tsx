'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Invalid email or password');
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="auth-page__card mx-auto"
        >
          <div className="auth-page__logo">Aard<span>ra</span></div>
          <div className="auth-page__subtitle">Sign in to your account</div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="mb-4">
              <div className="d-flex justify-content-between">
                <label className="form-label" htmlFor="password">Password</label>
                <a href="#" className="text-muted text-decoration-none" style={{ fontSize: '0.8rem' }}>Forgot password?</a>
              </div>
              <input
                id="password"
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-accent w-100 py-2 rounded-pill"
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-muted mb-0" style={{ fontSize: '0.875rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-decoration-none fw-semibold" style={{ color: '#e94560' }}>
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
