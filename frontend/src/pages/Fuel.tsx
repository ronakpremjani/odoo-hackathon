import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Plus, Eye, Fuel as FuelIcon, Calendar } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { Form } from '../components/forms/Form';
import { z } from 'zod';
import { formatDate, formatCurrency } from '../lib/utils';

// Fuel Log Validation Schema
const fuelSchema = z.object({
  vehicle: z.string().min(1, 'Please select a vehicle'),
  driver: z.string().min(1, 'Please select a driver'),
  quantity: z.preprocess((val) => Number(val), z.number().positive('Quantity must be greater than 0')),
  cost: z.preprocess((val) => Number(val), z.number().nonnegative('Cost cannot be negative')),
  odometer: z.preprocess((val) => Number(val), z.number().nonnegative('Odometer cannot be negative')),
  fuelStation: z.string().optional(),
});

interface FuelLog {
  _id: string;
  vehicle: {
    _id: string;
    plateNumber: string;
    model: string;
    mileage: number;
  };
  driver: {
    _id: string;
    user?: { name: string };
  };
  quantity: number;
  cost: number;
  odometer: number;
  fuelStation: string;
  date: string;
}

export const Fuel = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [inspectedLog, setInspectedLog] = useState<FuelLog | null>(null);

  // Fetch Fuel Logs
  const { data, isLoading } = useQuery({
    queryKey: ['fuelLogs', currentPage],
    queryFn: () =>
      apiClient
        .get('/fuel-logs', {
          params: {
            page: currentPage,
            limit: 10,
            populate: 'vehicle,driver',
          },
        })
        .then((res) => res.data.data),
  });

  // Fetch all vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehiclesListFuel'],
    queryFn: () => apiClient.get('/vehicles?limit=100').then((res) => res.data.data),
  });

  // Fetch all drivers
  const { data: driversData } = useQuery({
    queryKey: ['driversListFuel'],
    queryFn: () => apiClient.get('/drivers?limit=100&populate=user').then((res) => res.data.data),
  });

  // Create Fuel Log Mutation
  const createMutation = useMutation({
    mutationFn: (newFuelLog: any) => apiClient.post('/fuel-logs', newFuelLog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      addToast('Refueling purchase logged successfully', 'success');
      setIsLogOpen(false);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to log refueling details', 'error');
    },
  });

  const handleCreateSubmit = (formData: any) => {
    const payload = {
      vehicle: formData.vehicle,
      driver: formData.driver,
      quantity: formData.quantity,
      cost: formData.cost,
      odometer: formData.odometer,
      fuelStation: formData.fuelStation,
      date: new Date().toISOString(),
    };
    createMutation.mutate(payload);
  };

  // Perform search locally across populated fields
  const filteredLogs =
    data?.data?.filter((log: FuelLog) => {
      const matchSearch =
        log.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
        log.driver?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        log.fuelStation?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    }) || [];

  const columns: Column<FuelLog>[] = [
    { header: 'Vehicle Plate', accessor: (row) => row.vehicle?.plateNumber || 'N/A', sortable: true, sortKey: 'vehicle' },
    { header: 'Driver', accessor: (row) => row.driver?.user?.name || 'N/A' },
    { header: 'Quantity (L)', accessor: (row) => `${row.quantity.toLocaleString()} L` },
    { header: 'Total Cost', accessor: (row) => formatCurrency(row.cost) },
    { header: 'Odometer (mi)', accessor: (row) => row.odometer.toLocaleString() },
    { header: 'Station', accessor: 'fuelStation' },
    { header: 'Refueling Date', accessor: (row) => formatDate(row.date) },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => setInspectedLog(row)}
          title="Inspect fuel receipt & invoice details"
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

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
          onClick={() => setIsLogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-sm font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Log Refueling
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by vehicle, driver, or station..." />
      </div>

      <Table columns={columns} data={filteredLogs} isLoading={isLoading} />
      
      {data && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(data.total / 10) || 1}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Log Refueling Modal */}
      <Modal isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} title="Log Refueling Invoice">
        <Form schema={fuelSchema} onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          {(methods) => {
            const selectedVehicleId = methods.watch('vehicle');
            const selectedVehicle = vehiclesData?.data?.find((v: any) => v._id === selectedVehicleId);

            // Auto-fill odometer reading when vehicle is picked
            if (selectedVehicle && methods.getValues('odometer') === 0) {
              methods.setValue('odometer', selectedVehicle.mileage);
            }

            return (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 uppercase mb-1">Select Vehicle</label>
                    <select
                      {...methods.register('vehicle')}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Select vehicle...</option>
                      {vehiclesData?.data
                        ?.filter((v: any) => v.status !== 'Retired')
                        ?.map((v: any) => (
                          <option key={v._id} value={v._id}>
                            {v.plateNumber} - {v.make} {v.model}
                          </option>
                        ))}
                    </select>
                    {methods.formState.errors.vehicle && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.vehicle.message as string}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 uppercase mb-1">Select Operator</label>
                    <select
                      {...methods.register('driver')}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Select driver...</option>
                      {driversData?.data
                        ?.filter((d: any) => d.status === 'Active' || d.status === 'On Trip')
                        ?.map((d: any) => (
                          <option key={d._id} value={d._id}>
                            {d.user?.name || 'N/A'}
                          </option>
                        ))}
                    </select>
                    {methods.formState.errors.driver && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.driver.message as string}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 uppercase mb-1">Volume (Liters)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...methods.register('quantity')}
                      placeholder="e.g. 150"
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {methods.formState.errors.quantity && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.quantity.message as string}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 uppercase mb-1">Total Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...methods.register('cost')}
                      placeholder="Total invoice price"
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {methods.formState.errors.cost && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.cost.message as string}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 uppercase mb-1">Current Odometer (mi)</label>
                    <input
                      type="number"
                      {...methods.register('odometer')}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {methods.formState.errors.odometer && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.odometer.message as string}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-355 uppercase mb-1">Fuel Station Vendor</label>
                    <input
                      type="text"
                      {...methods.register('fuelStation')}
                      placeholder="e.g. Shell Station 882"
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setIsLogOpen(false)}
                    className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-2 text-sm bg-indigo-650 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Logging...' : 'Log Purchase'}
                  </button>
                </div>
              </>
            );
          }}
        </Form>
      </Modal>

      {/* Inspect Fuel Log Modal */}
      <Modal isOpen={inspectedLog !== null} onClose={() => setInspectedLog(null)} title="Refueling Purchase Record">
        {inspectedLog && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b pb-3">
              <FuelIcon className="w-6 h-6 text-indigo-650" />
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Refueling Invoice for {inspectedLog.vehicle?.plateNumber}
                </h4>
                <p className="text-xs text-slate-450">{inspectedLog.vehicle?.model}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Operator logged</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{inspectedLog.driver?.user?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Station Vendor</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{inspectedLog.fuelStation || 'N/A'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-2">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Quantity</span>
                <span className="text-xs font-bold text-slate-850 dark:text-white">{inspectedLog.quantity} L</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Cost</span>
                <span className="text-xs font-bold text-slate-850 dark:text-white">{formatCurrency(inspectedLog.cost)}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Odometer Run</span>
                <span className="text-xs font-bold text-slate-850 dark:text-white">{inspectedLog.odometer.toLocaleString()} mi</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 border-t pt-3">
              <Calendar className="w-4 h-4" />
              Recorded: {formatDate(inspectedLog.date)}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
