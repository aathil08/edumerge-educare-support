import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTicket } from '../services/ticketService.js';
import { useToast } from '../hooks/useToast.js';
import { CATEGORIES } from '../utils/format.js';
import { getErrorMessage, getFieldErrors } from '../utils/errors.js';
import PageHeader from '../components/PageHeader.jsx';
import FormField from '../components/FormField.jsx';
import Spinner from '../components/Spinner.jsx';

const MAX_SUBJECT = 120;
const MAX_DESCRIPTION = 2000;

export default function CreateTicket() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ category: '', subject: '', description: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    const subject = form.subject.trim();
    const description = form.description.trim();

    if (!form.category) next.category = 'Please choose a category.';
    else if (!CATEGORIES.includes(form.category)) next.category = 'Invalid category.';

    if (!subject) next.subject = 'Subject is required.';
    else if (subject.length < 3 || subject.length > MAX_SUBJECT)
      next.subject = `Subject must be 3 to ${MAX_SUBJECT} characters.`;

    if (!description) next.description = 'Description is required.';
    else if (description.length < 10 || description.length > MAX_DESCRIPTION)
      next.description = `Description must be 10 to ${MAX_DESCRIPTION} characters.`;

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
      const ticket = await createTicket({
        category: form.category,
        subject: form.subject.trim(),
        description: form.description.trim(),
      });
      toast.success(`Ticket ${ticket.ticketNumber} created.`);
      navigate('/student/tickets');
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err, 'Unable to create your ticket. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create ticket"
        description="Tell us what you need help with. Support staff set the priority after reviewing your request."
      />

      <form onSubmit={handleSubmit} noValidate className="card max-w-2xl space-y-5 p-6">
        {formError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}

        <div>
          <label htmlFor="category" className="label">
            Category
          </label>
          <select
            id="category"
            name="category"
            className={`input ${errors.category ? 'input-error' : ''}`}
            value={form.category}
            onChange={handleChange}
            disabled={submitting}
            aria-invalid={errors.category ? 'true' : 'false'}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
        </div>

        <FormField
          id="subject"
          label="Subject"
          placeholder="Short summary of your request"
          value={form.subject}
          onChange={handleChange}
          error={errors.subject}
          disabled={submitting}
          maxLength={MAX_SUBJECT}
        />

        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            className={`input ${errors.description ? 'input-error' : ''}`}
            placeholder="Describe your request with as much detail as possible"
            value={form.description}
            onChange={handleChange}
            disabled={submitting}
            maxLength={MAX_DESCRIPTION}
            aria-invalid={errors.description ? 'true' : 'false'}
          />
          <div className="mt-1 flex justify-between text-xs">
            <span className="text-red-600">{errors.description || ''}</span>
            <span className="text-slate-500">
              {form.description.length}/{MAX_DESCRIPTION}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/student/tickets" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting && <Spinner className="h-4 w-4" />}
            {submitting ? 'Submitting...' : 'Submit ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}