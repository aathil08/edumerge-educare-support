import { useState } from 'react';
import Badge from './Badge.jsx';
import Spinner from './Spinner.jsx';
import { formatDateTime } from '../utils/format.js';
import { addComment } from '../services/commentService.js';
import { useToast } from '../hooks/useToast.js';
import { getErrorMessage } from '../utils/errors.js';

const MAX_LEN = 2000;

export default function CommentThread({ ticketId, comments, canComment, isStaffOrManager, closedMessage, onAdded }) {
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [internal, setInternal] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = message.trim();
    if (!trimmed) {
      setError('Message cannot be empty.');
      return;
    }
    if (trimmed.length > MAX_LEN) {
      setError(`Message must be at most ${MAX_LEN} characters.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await addComment(ticketId, { message: trimmed, visibility: internal ? 'INTERNAL' : 'PUBLIC' });
      setMessage('');
      setInternal(false);
      onAdded();
    } catch (err) {
      const msg = getErrorMessage(err, 'Unable to post your response. Please try again.');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {comments.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-slate-500">No responses yet.</li>
        ) : (
          comments.map((c) => (
            <li key={c._id} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{c.author?.name || 'Unknown'}</span>
                <span className="text-xs text-slate-400">{formatDateTime(c.createdAt)}</span>
                {c.visibility === 'INTERNAL' && (
                  <Badge className="bg-purple-50 text-purple-700 ring-purple-600/20">Internal note</Badge>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{c.message}</p>
            </li>
          ))
        )}
      </ul>

      <div className="border-t border-slate-100 p-5">
        {canComment ? (
          <form onSubmit={handleSubmit} noValidate>
            <textarea
              rows={3}
              className={`input ${error ? 'input-error' : ''}`}
              placeholder="Write a response..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_LEN}
              disabled={submitting}
              aria-invalid={error ? 'true' : 'false'}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-red-600">{error}</span>
              <span className="text-slate-500">{message.length}/{MAX_LEN}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              {isStaffOrManager ? (
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={internal}
                    onChange={(e) => setInternal(e.target.checked)}
                    disabled={submitting}
                  />
                  Internal note (staff only)
                </label>
              ) : (
                <span />
              )}
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting && <Spinner className="h-4 w-4" />}
                {submitting ? 'Posting...' : 'Post response'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500">{closedMessage}</p>
        )}
      </div>
    </div>
  );
}