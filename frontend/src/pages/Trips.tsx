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
import { Plus, CheckCircle, XCircle, Eye, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { Form } from '../components/forms/Form';
import { z } from 'zod';
import { formatDate } from '../lib/utils';

// Trip Dispatch Validation Schema
const dispatchSchema = z.object({
  tripId: z.string().min(2, 'Trip dispatch code is required'),
  vehicle: z.string().min(1, 'Please select a vehicle'),
  driver: z.string().min(1, 'Please select a driver'),
  startLocation: z.string().min(1, 'Origin location is required'),
  endLocation: z.string().min(1, 'Destination is required'),
  estimatedStartTime: z.string().min(1, 'Estimated departure time is required'),
  estimatedEndTime: z.string().min(1, 'Estimated arrival time is required'),
  startOdometer: z.preprocess((val) => Number(val), z.number().nonnegative('Start odometer is required')),
  cargoDescription: z.string().min(1, 'Cargo description is required'),
  cargoWeight: z.preprocess((val) => Number(val), z.number().nonnegative('Cargo weight is required')),
});

interface Trip {
  _id: string;
  tripId: string;
  vehicle: {
    _id: string;
    plateNumber: string;
    model: string;
    capacity?: { payload?: number };
    mileage: number;
  };
  driver: {
    _id: string;
    licenseNumber: string;
    user?: { name: string };
  };
  startLocation: { name: string };
  endLocation: { name: string };
  status: string;
  startOdometer: number;
  endOdometer?: number;
  estimatedStartTime: string;
  estimatedEndTime: string;
  cargoDetails?: {
    description: string;
    weight: number;
  };
}

export const Trips = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [completeTripId, setCompleteTripId] = useState<string | null>(null);
  const [cancelTripId, setCancelTripId] = useState<string | null>(null);
  const [endOdometerVal, setEndOdometerVal] = useState<number>(0);
  const [inspectedTrip, setInspectedTrip] = useState<Trip | null>(null);

  // Fetch Trips
  const { data, isLoading } = useQuery({
    queryKey: ['trips', currentPage, search, statusFilter],
    queryFn: () =>
      apiClient
        .get('/trips', {
          params: {
            page: currentPage,
            limit: 10,
            tripId: search || undefined,
            status: statusFilter || undefined,
            populate: 'vehicle,driver',
          },
        })
        .then((res) => res.data.data),
  });

  // Fetch active vehicles for selection
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehiclesListActive'],
    queryFn: () => apiClient.get('/vehicles?limit=100').then((res) => res.data.data),
  });

  // Fetch active compliant drivers for selection
  const { data: driversData } = useQuery({
    queryKey: ['driversListActive'],
    queryFn: () => apiClient.get('/drivers?limit=100&populate=user').then((res) => res.data.data),
  });

  // Dispatch Trip Mutation
  const dispatchMutation = useMutation({
    mutationFn: (newTrip: any) => apiClient.post('/trips', newTrip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      addToast('Trip dispatched and operators updated successfully', 'success');
      setIsDispatchOpen(false);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to dispatch trip', 'error');
    },
  });

  // Complete Trip Mutation
  const completeMutation = useMutation({
    mutationFn: ({ id, odometer }: { id: string; odometer: number }) =>
      apiClient.put(`/trips/${id}`, { status: 'Completed', endOdometer: odometer }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      addToast('Trip marked as Completed. Vehicle odometer updated.', 'success');
      setCompleteTripId(null);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to complete trip', 'error');
    },
  });

  // Cancel Trip Mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/trips/${id}`, { status: 'Cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      addToast('Trip marked as Cancelled.', 'warning');
      setCancelTripId(null);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to cancel trip', 'error');
    },
  });

  const handleDispatchSubmit = (formData: any) => {
    const payload = {
      tripId: formData.tripId,
      vehicle: formData.vehicle,
      driver: formData.driver,
      startLocation: { name: formData.startLocation },
      endLocation: { name: formData.endLocation },
      estimatedStartTime: new Date(formData.estimatedStartTime).toISOString(),
      estimatedEndTime: new Date(formData.estimatedEndTime).toISOString(),
      startOdometer: formData.startOdometer,
      cargoDetails: {
        description: formData.cargoDescription,
        weight: formData.cargoWeight,
      },
    };
    dispatchMutation.mutate(payload);
  };

  const handleCompleteSubmit = () => {
    if (completeTripId) {
      completeMutation.mutate({ id: completeTripId, odometer: endOdometerVal });
    }
  };

  const columns: Column<Trip>[] = [
    { header: 'Trip ID', accessor: 'tripId', sortable: true, sortKey: 'tripId' },
    {
      header: 'Route',
      accessor: (row) => (
        <span className="flex items-center gap-1.5 font-semibold">
          {row.startLocation?.name} <ArrowRight className="w-3.5 h-3.5 text-slate-400" /> {row.endLocation?.name}
        </span>
      ),
    },
    { header: 'Vehicle Plate', accessor: (row) => row.vehicle?.plateNumber || 'N/A' },
    { header: 'Driver', accessor: (row) => row.driver?.user?.name || 'N/A' },
    { header: 'Cargo Description', accessor: (row) => row.cargoDetails?.description || 'N/A' },
    { header: 'Cargo Weight', accessor: (row) => `${row.cargoDetails?.weight?.toLocaleString() || 0} kg` },
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
                onClick={() => {
                  setCompleteTripId(row._id);
                  setEndOdometerVal(row.startOdometer);
                }}
                title="Complete Trip"
                className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCancelTripId(row._id)}
                title="Cancel Trip"
                className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setInspectedTrip(row)}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
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
          <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Trips Dispatch</h1>
          <p className="text-sm text-slate-500 mt-1">Track active shipments, complete drop-offs, and monitor drivers</p>
        </div>
        <button
          onClick={() => setIsDispatchOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dispatch Trip
        </button>
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

      <Table columns={columns} data={data?.data || []} isLoading={isLoading} />
      
      {data && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(data.total / 10) || 1}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Dispatch Trip Modal */}
      <Modal isOpen={isDispatchOpen} onClose={() => setIsDispatchOpen(false)} title="Dispatch Transport Trip">
        <Form schema={dispatchSchema} onSubmit={handleDispatchSubmit} className="flex flex-col gap-4">
          {(methods: any) => {
            const selectedVehicleId = methods.watch('vehicle');
            const selectedVehicle = vehiclesData?.data?.find((v: any) => v._id === selectedVehicleId) as any;

            // Auto-fill odometer when a vehicle is selected
            if (selectedVehicle && methods.getValues('startOdometer') === 0) {
              methods.setValue('startOdometer', selectedVehicle.mileage);
            }

            return (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Trip Code ID</label>
                    <input
                      type="text"
                      {...methods.register('tripId')}
                      placeholder="e.g. TRIP-401"
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {methods.formState.errors.tripId && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.tripId.message as string}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Assigned Vehicle</label>
                    <select
                      {...methods.register('vehicle')}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Select available vehicle...</option>
                      {vehiclesData?.data
                        ?.filter((v: any) => v.status === 'Active')
                        ?.map((v: any) => (
                          <option key={v._id} value={v._id}>
                            {v.plateNumber} - {v.make} {v.model} (Max: {v.capacity?.payload || 0}kg)
                          </option>
                        ))}
                    </select>
                    {methods.formState.errors.vehicle && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.vehicle.message as string}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Assigned Operator</label>
                    <select
                      {...methods.register('driver')}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">Select active operator...</option>
                      {driversData?.data
                        ?.filter((d: any) => d.status === 'Active')
                        ?.map((d: any) => (
                          <option key={d._id} value={d._id}>
                            {d.user?.name || 'N/A'} - License: {d.licenseNumber}
                          </option>
                        ))}
                    </select>
                    {methods.formState.errors.driver && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.driver.message as string}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Start Odometer (mi)</label>
                    <input
                      type="number"
                      {...methods.register('startOdometer')}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {methods.formState.errors.startOdometer && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.startOdometer.message as string}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Origin Location</label>
                    <input
                      type="text"
                      {...methods.register('startLocation')}
                      placeholder="e.g. Dallas, TX"
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Destination Location</label>
                    <input
                      type="text"
                      {...methods.register('endLocation')}
                      placeholder="e.g. Houston, TX"
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Estimated Departure</label>
                    <input
                      type="datetime-local"
                      {...methods.register('estimatedStartTime')}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Estimated Arrival</label>
                    <input
                      type="datetime-local"
                      {...methods.register('estimatedEndTime')}
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border-t pt-3 flex flex-col gap-3">
                  <span className="text-[11px] font-bold text-indigo-650 uppercase tracking-widest">Freight & Cargo Specification</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Cargo Description</label>
                      <input
                        type="text"
                        {...methods.register('cargoDescription')}
                        placeholder="e.g. Electronics, Produce"
                        className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        {...methods.register('cargoWeight')}
                        className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                      {/* Client-side capacity warning validation */}
                      {selectedVehicle && methods.watch('cargoWeight') > ((selectedVehicle as any).capacity?.payload || 0) && (
                        <span className="text-xs text-rose-600 block mt-1.5 font-semibold">
                          Warning: Weight exceeds payload capacity ({(selectedVehicle as any).capacity?.payload}kg)!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDispatchOpen(false)}
                    className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={dispatchMutation.isPending}
                    className="px-4 py-2 text-sm bg-indigo-650 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {dispatchMutation.isPending ? 'Dispatching...' : 'Dispatch Trip'}
                  </button>
                </div>
              </>
            );
          }}
        </Form>
      </Modal>

      {/* Complete Trip Odometer Modal */}
      <Modal isOpen={completeTripId !== null} onClose={() => setCompleteTripId(null)} title="Finalize Trip Dispatch">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-550">
            Please record the ending odometer reading. This value will sync to the vehicle's mileage register automatically.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Ending Odometer (mi)</label>
            <input
              type="number"
              value={endOdometerVal}
              onChange={(e) => setEndOdometerVal(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => setCompleteTripId(null)}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteSubmit}
              disabled={completeMutation.isPending}
              className="px-4 py-2 text-sm bg-indigo-650 text-white rounded-lg hover:bg-indigo-700"
            >
              {completeMutation.isPending ? 'Submitting...' : 'Complete & Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation Popup */}
      <ConfirmPopup
        isOpen={cancelTripId !== null}
        onClose={() => setCancelTripId(null)}
        onConfirm={() => { if (cancelTripId) cancelMutation.mutate(cancelTripId); }}
        title="Abort Trip Dispatch"
        message="Are you sure you want to cancel this trip? The driver and vehicle status logs will reset back to Active."
      />

      {/* View Detailed Trip dossier */}
      <Modal isOpen={inspectedTrip !== null} onClose={() => setInspectedTrip(null)} title="Dispatch Record">
        {inspectedTrip && (
          <div className="flex flex-col gap-5">
            <div className="border-b pb-3">
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 font-bold px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                {inspectedTrip.status}
              </span>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
                Trip ID: {inspectedTrip.tripId}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Origin Location</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{inspectedTrip.startLocation?.name}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Destination</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{inspectedTrip.endLocation?.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Operator Assigned</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{inspectedTrip.driver?.user?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Vehicle Utilized</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">
                  {inspectedTrip.vehicle?.plateNumber || 'N/A'} ({inspectedTrip.vehicle?.model})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Estimated Timeline</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-350">
                  Out: {formatDate(inspectedTrip.estimatedStartTime)}
                  <br />
                  In: {formatDate(inspectedTrip.estimatedEndTime)}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Odometers</span>
                <span className="text-xs font-semibold text-slate-850 dark:text-white">
                  Start: {inspectedTrip.startOdometer} mi
                  <br />
                  End: {inspectedTrip.endOdometer ? `${inspectedTrip.endOdometer} mi` : 'En Route'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
