import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { listTickets } from '../services/ticketService.js';
import PageHeader from '../components/PageHeader.jsx';
import TicketTable from '../components/TicketTable.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Icon from '../components/Icon.jsx';

const PAGE_SIZE = 10;

// Shared list page for students (own tickets), staff (queue) and managers (all tickets).
export default function TicketsPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
  showStudent = false,
  showCreate = false,
}) {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(
    () => listTickets({ page, limit: PAGE_SIZE }),
    [page]
  );

  const createButton = (
    <Link to="/student/tickets/new" className="btn-primary">
      <Icon name="plus" className="h-4 w-4" />
      Create ticket
    </Link>
  );

  return (
    <div>
      <PageHeader title={title} description={description} actions={showCreate ? createButton : null} />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5" role="status" aria-label="Loading tickets">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <ErrorState message="Unable to load tickets. Please try again." onRetry={reload} />
        ) : data.tickets.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            action={showCreate ? createButton : null}
          />
        ) : (
          <>
            <TicketTable tickets={data.tickets} showStudent={showStudent} />
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}