import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { listTickets } from '../services/ticketService.js';
import PageHeader from '../components/PageHeader.jsx';
import TicketTable from '../components/TicketTable.jsx';
import TicketFilters from '../components/TicketFilters.jsx';
import Pagination from '../components/Pagination.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Icon from '../components/Icon.jsx';

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { search: '', category: '', priority: '', status: '', sla: '', assignedTo: '', sort: 'newest' };

export default function TicketsPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
  showStudent = false,
  showCreate = false,
  showSla = false,
  showAssigned = false,
}) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const updateFilters = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1); // any filter change starts back at page 1
  };

  const { data, loading, error, reload } = useFetch(
    () => listTickets({ page, limit: PAGE_SIZE, ...filters }),
    [page, filters.search, filters.category, filters.priority, filters.status, filters.sla, filters.assignedTo, filters.sort]
  );

  const isFiltered = Object.entries(filters).some(([k, v]) => k !== 'sort' && v);

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
        <TicketFilters value={filters} onChange={updateFilters} showSla={showSla} showAssigned={showAssigned} />

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
            title={isFiltered ? 'No tickets match your filters.' : emptyTitle}
            description={isFiltered ? 'Try adjusting your search or filters.' : emptyDescription}
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