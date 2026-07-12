import { useState } from 'react';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Pagination } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Eye, CheckSquare } from 'lucide-react';

interface MaintenanceItem {
  id: string;
  maintenanceId: string;
  vehicle: string;
  type: string;
  priority: string;
  cost: number;
  status: string;
  scheduledDate: string;
}

export const Maintenance = () => {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [maintenances, setMaintenances] = useState<MaintenanceItem[]>([
    { id: '1', maintenanceId: 'MAIN-901', vehicle: 'CA-1123', type: 'Corrective', priority: 'High', cost: 1200, status: 'In Progress', scheduledDate: '2026-07-08' },
    { id: '2', maintenanceId: 'MAIN-902', vehicle: 'TX-9082', type: 'Inspection', priority: 'Medium', cost: 150, status: 'Scheduled', scheduledDate: '2026-07-15' },
    { id: '3', maintenanceId: 'MAIN-903', vehicle: 'NY-8874', type: 'Preventative', priority: 'Low', cost: 400, status: 'Completed', scheduledDate: '2026-07-01' },
  ]);

  const handleResolve = (id: string) => {
    setMaintenances((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Completed' } : m))
    );
    addToast('Maintenance task marked as Completed', 'success');
  };

  const columns: Column<MaintenanceItem>[] = [
    { header: 'Maintenance ID', accessor: 'maintenanceId', sortable: true, sortKey: 'maintenanceId' },
    { header: 'Vehicle', accessor: 'vehicle' },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Priority',
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${
            row.priority === 'High'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {row.priority}
        </span>
      ),
    },
    { header: 'Cost', accessor: (row) => `$${row.cost.toLocaleString()}` },
    { header: 'Scheduled Date', accessor: 'scheduledDate' },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
              : row.status === 'In Progress'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-450'
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
            <button
              onClick={() => handleResolve(row.id)}
              title="Mark Completed"
              className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => addToast(`Viewing Maintenance Log ${row.maintenanceId}`, 'info')}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredMaintenances = maintenances
    .filter((m) => m.maintenanceId.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => (statusFilter ? m.status === statusFilter : true));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Maintenance Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Schedule preventative work, log breakdowns, and track vehicle repair states</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search maintenance ID..." />
        <FilterDropdown
          label="Status"
          options={[
            { label: 'Scheduled', value: 'Scheduled' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Completed', value: 'Completed' },
          ]}
          selectedValue={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <Table columns={columns} data={filteredMaintenances} />
      <Pagination currentPage={currentPage} totalPages={1} onPageChange={setCurrentPage} />
    </motion.div>
  );
};
