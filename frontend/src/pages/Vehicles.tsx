import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { ConfirmPopup } from '../components/ui/ConfirmPopup';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, DollarSign, Fuel, Wrench } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { Form } from '../components/forms/Form';
import { z } from 'zod';
import { formatCurrency } from '../lib/utils';

// Registration Validation Schema
const vehicleSchema = z.object({
  plateNumber: z.string().min(2, 'License plate number is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.preprocess((val) => Number(val), z.number().min(1900).max(new Date().getFullYear() + 1)),
  type: z.enum(['Truck', 'Van', 'Car', 'Bus', 'Trailer', 'Other']),
  fuelType: z.enum(['Diesel', 'Petrol', 'Electric', 'Hybrid', 'Gas']),
  mileage: z.preprocess((val) => Number(val), z.number().nonnegative('Mileage must be non-negative')),
  payload: z.preprocess((val) => Number(val), z.number().nonnegative('Payload must be positive')),
});

interface Vehicle {
  _id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  type: string;
  status: string;
  mileage: number;
  fuelType: string;
  capacity?: {
    payload?: number;
  };
}

export const Vehicles = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedVehicleMetricsId, setSelectedVehicleMetricsId] = useState<string | null>(null);

  // Fetch Vehicles
  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', currentPage, search, statusFilter],
    queryFn: () =>
      apiClient
        .get('/vehicles', {
          params: {
            page: currentPage,
            limit: 10,
            plateNumber: search || undefined,
            status: statusFilter || undefined,
          },
        })
        .then((res) => res.data.data),
  });

  // Fetch metrics for selected vehicle
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['vehicleMetrics', selectedVehicleMetricsId],
    queryFn: () =>
      apiClient.get(`/vehicles/${selectedVehicleMetricsId}/metrics`).then((res) => res.data.data),
    enabled: !!selectedVehicleMetricsId,
  });

  // Create Vehicle Mutation
  const createMutation = useMutation({
    mutationFn: (newVehicle: any) => apiClient.post('/vehicles', newVehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      addToast('Vehicle registered successfully', 'success');
      setIsCreateOpen(false);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to register vehicle', 'error');
    },
  });

  // Delete Vehicle Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      addToast('Vehicle removed successfully', 'success');
      setDeleteId(null);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to remove vehicle', 'error');
    },
  });

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
            onClick={() => setSelectedVehicleMetricsId(row._id)}
            title="Inspect operational metrics & ROI"
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row._id)}
            title="Remove from fleet"
            className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleCreateSubmit = (formData: any) => {
    const payload = {
      plateNumber: formData.plateNumber,
      make: formData.make,
      model: formData.model,
      year: formData.year,
      type: formData.type,
      fuelType: formData.fuelType,
      mileage: formData.mileage,
      capacity: {
        payload: formData.payload,
      },
    };
    createMutation.mutate(payload);
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
          className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-sm font-semibold transition-colors"
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
            { label: 'On Trip', value: 'On Trip' },
          ]}
          selectedValue={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <Table columns={columns} data={data?.data || []} isLoading={isLoading} />
      
      {data && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(data.total / 10) || 1}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Popup */}
      <ConfirmPopup
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
        title="Remove Vehicle"
        message="Are you sure you want to remove this vehicle from the active fleet database? This action cannot be undone."
      />

      {/* View Detailed Metrics Modal */}
      <Modal
        isOpen={selectedVehicleMetricsId !== null}
        onClose={() => setSelectedVehicleMetricsId(null)}
        title="Operational Metrics & ROI Analyzer"
        size="lg"
      >
        {metricsLoading ? (
          <div className="flex justify-center items-center py-12 gap-2">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400">Loading metrics...</span>
          </div>
        ) : metrics ? (
          <div className="flex flex-col gap-6">
            <div className="border-b pb-4">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {metrics.vehicle.make} {metrics.vehicle.model}
              </h4>
              <p className="text-xs text-slate-450 mt-1">Plate Number: {metrics.vehicle.plateNumber}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Revenue</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(metrics.analytics.estimatedRevenue)}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Operating Cost</span>
                <span className="text-lg font-bold text-rose-600">{formatCurrency(metrics.operational.totalCost)}</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Odometer Run</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{metrics.operational.totalDistance.toLocaleString()} mi</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">ROI %</span>
                <span className={`text-lg font-extrabold ${metrics.analytics.roiPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {metrics.analytics.roiPercentage}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t pt-4">
              <h5 className="text-xs font-bold uppercase text-slate-450 tracking-wider">Breakdown Matrix</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Fuel className="w-5 h-5 text-indigo-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Fuel Costs</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-white">
                      {formatCurrency(metrics.fuel.totalCost)} ({metrics.fuel.totalQuantityLiters} L)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-amber-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Repairs & Shop Cost</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-white">
                      {formatCurrency(metrics.maintenance.totalCost)} ({metrics.maintenance.count} jobs)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-slate-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">General Expenses</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-white">
                      {formatCurrency(metrics.expenses.totalOther)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 py-6">Could not load metrics logbook.</div>
        )}
      </Modal>

      {/* Register Vehicle Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Register Vehicle">
        <Form schema={vehicleSchema} onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          {(methods) => (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Plate Number</label>
                  <input
                    type="text"
                    {...methods.register('plateNumber')}
                    placeholder="e.g. TX-9082"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.plateNumber && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.plateNumber.message as string}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Make</label>
                  <input
                    type="text"
                    {...methods.register('make')}
                    placeholder="e.g. Freightliner"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.make && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.make.message as string}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Model</label>
                  <input
                    type="text"
                    {...methods.register('model')}
                    placeholder="e.g. Cascadia"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.model && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.model.message as string}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Manufacture Year</label>
                  <input
                    type="number"
                    {...methods.register('year')}
                    placeholder="e.g. 2022"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.year && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.year.message as string}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Vehicle Type</label>
                  <select
                    {...methods.register('type')}
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Car">Car</option>
                    <option value="Bus">Bus</option>
                    <option value="Trailer">Trailer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Fuel Type</label>
                  <select
                    {...methods.register('fuelType')}
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Gas">Gas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Initial Mileage (mi)</label>
                  <input
                    type="number"
                    {...methods.register('mileage')}
                    placeholder="e.g. 15000"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.mileage && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.mileage.message as string}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Max Payload Capacity (kg)</label>
                  <input
                    type="number"
                    {...methods.register('payload')}
                    placeholder="e.g. 18000"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.payload && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.payload.message as string}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-sm bg-indigo-650 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Register Asset'}
                </button>
              </div>
            </>
          )}
        </Form>
      </Modal>
    </motion.div>
  );
};
