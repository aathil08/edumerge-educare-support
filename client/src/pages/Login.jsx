import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import FormField from '../components/FormField.jsx';
import Spinner from '../components/Spinner.jsx';
import { getErrorMessage, getFieldErrors } from '../utils/errors.js';
import { roleHome } from '../utils/roles.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Prototype convenience for reviewers. Matches the seed script accounts.
const DEMO_PASSWORD = 'Educare@123';
const DEMO_ACCOUNTS = [
  { label: 'Student', email: 'student1@educare.test' },
  { label: 'Staff', email: 'staff1@educare.test' },
  { label: 'Manager', email: 'manager@educare.test' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    const email = form.email.trim();
    if (!email) next.email = 'Email is required.';
    else if (!EMAIL_REGEX.test(email)) next.email = 'Please enter a valid email address.';
    if (!form.password) next.password = 'Password is required.';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // ignore duplicate submits

    const found = validate();
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err, 'Unable to log in. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to raise or manage support tickets.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        {formError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@college.edu"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          disabled={submitting}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          disabled={submitting}
        />

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New student?{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-4">
        <p className="text-xs font-medium text-slate-600">Demo accounts (prototype only)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              className="btn-secondary px-3 py-1 text-xs"
              disabled={submitting}
              onClick={() => {
                setForm({ email: account.email, password: DEMO_PASSWORD });
                setErrors({});
                setFormError('');
              }}
            >
              Fill {account.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}