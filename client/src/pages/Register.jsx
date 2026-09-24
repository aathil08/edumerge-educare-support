import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import FormField from '../components/FormField.jsx';
import Spinner from '../components/Spinner.jsx';
import { getErrorMessage, getFieldErrors } from '../utils/errors.js';
import { roleHome } from '../utils/roles.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) next.name = 'Name is required.';
    else if (name.length < 2 || name.length > 60) next.name = 'Name must be 2 to 60 characters.';

    if (!email) next.email = 'Email is required.';
    else if (!EMAIL_REGEX.test(email)) next.email = 'Please enter a valid email address.';

    if (form.department.trim().length > 80) next.department = 'Department must be at most 80 characters.';

    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';
    else if (form.password.length > 72) next.password = 'Password must be at most 72 characters.';

    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const found = validate();
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        password: form.password,
      });
      toast.success('Account created. Welcome to EduCare!');
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err, 'Unable to create your account. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Student accounts only. Staff accounts are created by the institution.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        {formError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <FormField
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Your full name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          disabled={submitting}
          maxLength={60}
        />
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
          id="department"
          label="Department / course (optional)"
          placeholder="e.g. CSE"
          value={form.department}
          onChange={handleChange}
          error={errors.department}
          disabled={submitting}
          maxLength={80}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          disabled={submitting}
        />
        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          disabled={submitting}
        />

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}