import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  const useAdmin = () => {
    setMode('login');
    setForm({ name: '', email: 'admin@sneaklab.com', password: 'Admin@123' });
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16 lg:px-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-400">
          {mode === 'login' ? 'Welcome back' : 'Join the lab'}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tightest">
          {mode === 'login' ? 'Login' : 'Create account'}
        </h1>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          {mode === 'register' && (
            <input required placeholder="Full name" value={form.name} onChange={set('name')}
              className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
          )}
          <input required type="email" placeholder="Email" value={form.email} onChange={set('email')}
            className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />
          <input required type="password" minLength={6} placeholder="Password (min 6 chars)"
            value={form.password} onChange={set('password')}
            className="rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-ink" />

          {err && <p className="text-sm font-semibold text-rust">{err}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-full bg-ink py-3.5 text-sm font-bold uppercase tracking-widest text-bone transition hover:bg-rust disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          {mode === 'login' ? "New here? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErr('');
            }}
            className="font-bold text-ink underline"
          >
            {mode === 'login' ? 'Create account' : 'Login'}
          </button>
        </p>

        <button
          onClick={useAdmin}
          className="mt-4 block w-full text-center text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-rust"
        >
          Use admin demo credentials
        </button>
      </div>

      <Link to="/" className="mt-6 block text-center text-xs font-semibold uppercase tracking-widest text-neutral-400 hover:text-ink">
        Continue shopping
      </Link>
    </div>
  );
}
