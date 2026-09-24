import Icon from './Icon.jsx';

export default function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center" role="alert">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <Icon name="alert" className="h-6 w-6" />
      </div>
      <p className="max-w-sm text-sm text-slate-600">{message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary mt-5" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}