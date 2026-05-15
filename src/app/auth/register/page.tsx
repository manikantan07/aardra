'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Registration failed');
        return;
      }

      // Auto-login
      await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      toast.success('Account created! Welcome to Aardra 🎉');
      router.push('/');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, type = 'text', placeholder, field }: { id: string; label: string; type?: string; placeholder: string; field: keyof typeof form }) => (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
        placeholder={placeholder}
        value={form[field]}
        onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
      />
      {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
    </div>
  );

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
          <div className="auth-page__subtitle">Create your account</div>

          <form onSubmit={handleSubmit} noValidate>
            <Field id="name" label="Full Name" placeholder="John Doe" field="name" />
            <Field id="email" label="Email Address" type="email" placeholder="you@example.com" field="email" />
            <Field id="password" label="Password" type="password" placeholder="Min. 8 characters" field="password" />
            <Field id="confirm" label="Confirm Password" type="password" placeholder="Repeat password" field="confirm" />

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-accent w-100 py-2 rounded-pill mt-2"
              disabled={loading}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
              {loading ? 'Creating account…' : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-decoration-none fw-semibold" style={{ color: '#e94560' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
