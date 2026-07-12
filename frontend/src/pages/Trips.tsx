import { useState } from 'react';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Pagination } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface Trip {
  id: string;
  tripId: string;
  origin: string;
  destination: string;
  driver: string;
  status: string;
  weight: number;
}

export const Trips = () => {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [trips, setTrips] = useState<Trip[]>([
    { id: '1', tripId: 'TRIP-401', origin: 'Dallas, TX', destination: 'Houston, TX', driver: 'John Doe', status: 'In Progress', weight: 4500 },
    { id: '2', tripId: 'TRIP-402', origin: 'Chicago, IL', destination: 'Detroit, MI', driver: 'Bob Johnson', status: 'Completed', weight: 3200 },
    { id: '3', tripId: 'TRIP-403', origin: 'Phoenix, AZ', destination: 'Los Angeles, CA', driver: 'Jane Smith', status: 'Scheduled', weight: 1500 },
  ]);

  const handleComplete = (id: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'Completed' } : t))
    );
    addToast('Trip marked as Completed', 'success');
  };

  const handleCancel = (id: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'Cancelled' } : t))
    );
    addToast('Trip marked as Cancelled', 'warning');
  };

  const columns: Column<Trip>[] = [
    { header: 'Trip ID', accessor: 'tripId', sortable: true, sortKey: 'tripId' },
    { header: 'Origin', accessor: 'origin' },
    { header: 'Destination', accessor: 'destination' },
    { header: 'Driver', accessor: 'driver' },
    { header: 'Weight (kg)', accessor: (row) => row.weight.toLocaleString() },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
              : row.status === 'In Progress'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-450'
              : row.status === 'Cancelled'
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          {row.status === 'In Progress' && (
            <>
              <button
                onClick={() => handleComplete(row.id)}
                title="Complete Trip"
                className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCancel(row.id)}
                title="Cancel Trip"
                className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => addToast(`Viewing Trip ${row.tripId}`, 'info')}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredTrips = trips
    .filter((t) => t.tripId.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => (statusFilter ? t.status === statusFilter : true));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Trips Dispatch</h1>
        <p className="text-sm text-slate-500 mt-1">Track active shipments, complete drop-offs, and monitor drivers</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search trip ID..." />
        <FilterDropdown
          label="Status"
          options={[
            { label: 'Scheduled', value: 'Scheduled' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Cancelled', value: 'Cancelled' },
          ]}
          selectedValue={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <Table columns={columns} data={filteredTrips} />
      <Pagination currentPage={currentPage} totalPages={1} onPageChange={setCurrentPage} />
    </motion.div>
  );
};
