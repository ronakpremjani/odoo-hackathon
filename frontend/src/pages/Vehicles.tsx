import { useState } from 'react';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { ConfirmPopup } from '../components/ui/ConfirmPopup';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye } from 'lucide-react';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  type: string;
  status: string;
  mileage: number;
}

export const Vehicles = () => {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: '1', plateNumber: 'TX-9082', make: 'Freightliner', model: 'Cascadia', year: 2022, type: 'Truck', status: 'Active', mileage: 124500 },
    { id: '2', plateNumber: 'CA-1123', model: 'Peterbilt 579', make: 'Peterbilt', year: 2021, type: 'Truck', status: 'In Maintenance', mileage: 98000 },
    { id: '3', plateNumber: 'NY-8874', model: 'Volvo VNL 860', make: 'Volvo', year: 2023, type: 'Truck', status: 'Active', mileage: 45000 },
    { id: '4', plateNumber: 'FL-2309', model: 'Transit Cargo', make: 'Ford', year: 2020, type: 'Van', status: 'Retired', mileage: 210000 },
  ]);

  const columns: Column<Vehicle>[] = [
    { header: 'Plate Number', accessor: 'plateNumber', sortable: true, sortKey: 'plateNumber' },
    { header: 'Make', accessor: 'make' },
    { header: 'Model', accessor: 'model' },
    { header: 'Year', accessor: 'year' },
    { header: 'Type', accessor: 'type' },
    { header: 'Mileage (mi)', accessor: (row) => row.mileage.toLocaleString() },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
              : row.status === 'In Maintenance'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
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
          <button
            onClick={() => addToast(`Viewing details for vehicle ${row.plateNumber}`, 'info')}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredVehicles = vehicles
    .filter((v) => v.plateNumber.toLowerCase().includes(search.toLowerCase()))
    .filter((v) => (statusFilter ? v.status === statusFilter : true));

  const handleDelete = () => {
    if (deleteId) {
      setVehicles((prev) => prev.filter((v) => v.id !== deleteId));
      addToast('Vehicle removed successfully', 'success');
      setDeleteId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Vehicles Fleet</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, inspect, and track vehicles</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search plate number..." />
        <FilterDropdown
          label="Status"
          options={[
            { label: 'Active', value: 'Active' },
            { label: 'In Maintenance', value: 'In Maintenance' },
            { label: 'Retired', value: 'Retired' },
          ]}
          selectedValue={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <Table columns={columns} data={filteredVehicles} />
      <Pagination currentPage={currentPage} totalPages={1} onPageChange={setCurrentPage} />

      <ConfirmPopup
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Vehicle"
        message="Are you sure you want to remove this vehicle from the active fleet database? This action cannot be undone."
      />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Register Vehicle">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-750 dark:text-slate-300 uppercase mb-1">Plate Number</label>
            <input
              type="text"
              placeholder="e.g. TX-9082"
              className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsCreateOpen(false);
                addToast('Vehicle registered successfully', 'success');
              }}
              className="px-4 py-2 text-sm bg-indigo-650 text-white rounded-lg hover:bg-indigo-700"
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
