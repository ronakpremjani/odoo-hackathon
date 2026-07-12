import { useState } from 'react';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Eye, Plus } from 'lucide-react';

interface FuelLog {
  id: string;
  vehicle: string;
  driver: string;
  quantity: number;
  cost: number;
  odometer: number;
  fuelStation: string;
  date: string;
}

export const Fuel = () => {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [fuelLogs] = useState<FuelLog[]>([
    { id: '1', vehicle: 'TX-9082', driver: 'John Doe', quantity: 150, cost: 320, odometer: 124500, fuelStation: 'Shell Dallas', date: '2026-07-10' },
    { id: '2', vehicle: 'CA-1123', driver: 'Jane Smith', quantity: 180, cost: 390, odometer: 98150, fuelStation: 'Chevron LA', date: '2026-07-09' },
    { id: '3', vehicle: 'NY-8874', driver: 'Bob Johnson', quantity: 120, cost: 260, odometer: 45200, fuelStation: 'Exxon NY', date: '2026-07-12' },
  ]);

  const columns: Column<FuelLog>[] = [
    { header: 'Vehicle', accessor: 'vehicle', sortable: true, sortKey: 'vehicle' },
    { header: 'Driver', accessor: 'driver' },
    { header: 'Quantity (L)', accessor: (row) => row.quantity.toLocaleString() },
    { header: 'Cost', accessor: (row) => `$${row.cost.toLocaleString()}` },
    { header: 'Odometer (mi)', accessor: (row) => row.odometer.toLocaleString() },
    { header: 'Station', accessor: 'fuelStation' },
    { header: 'Refueling Date', accessor: 'date' },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => addToast(`Viewing receipt for refueling of vehicle ${row.vehicle}`, 'info')}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const filteredLogs = fuelLogs.filter((log) =>
    log.vehicle.toLowerCase().includes(search.toLowerCase()) ||
    log.driver.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Fuel Logbook</h1>
          <p className="text-sm text-slate-500 mt-1">Record purchases, quantities, and fuel station transactions</p>
        </div>
        <button
          onClick={() => addToast('Log refueling dialog placeholder', 'info')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Refueling
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by vehicle or driver..." />
      </div>

      <Table columns={columns} data={filteredLogs} />
      <Pagination currentPage={currentPage} totalPages={1} onPageChange={setCurrentPage} />
    </motion.div>
  );
};
