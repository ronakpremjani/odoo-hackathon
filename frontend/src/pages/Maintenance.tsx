import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Plus, CheckSquare, Eye } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { Form } from '../components/forms/Form';
import { z } from 'zod';
import { formatDate, formatCurrency } from '../lib/utils';

// Maintenance Schedule Validation Schema
const maintenanceSchema = z.object({
  maintenanceId: z.string().min(2, 'Maintenance reference is required'),
  vehicle: z.string().min(1, 'Please select a vehicle'),
  type: z.enum(['Preventative', 'Corrective', 'Inspection', 'Breakdown']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  description: z.string().min(3, 'Description must explain scope of work'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  performedBy: z.string().optional(),
});

interface MaintenanceLog {
  _id: string;
  maintenanceId: string;
  vehicle: {
    _id: string;
    plateNumber: string;
    model: string;
  };
  type: string;
  priority: string;
  description: string;
  cost: number;
  status: string;
  scheduledDate: string;
  performedBy?: string;
}

export const Maintenance = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [resolveLogId, setResolveLogId] = useState<string | null>(null);
  const [resolveCost, setResolveCost] = useState<number>(0);
  const [resolvePerformedBy, setResolvePerformedBy] = useState<string>('');
  const [inspectedLog, setInspectedLog] = useState<MaintenanceLog | null>(null);

  // Fetch Maintenance Logs
  const { data, isLoading } = useQuery({
    queryKey: ['maintenances', currentPage, search, statusFilter],
    queryFn: () =>
      apiClient
        .get('/maintenances', {
          params: {
            page: currentPage,
            limit: 10,
            maintenanceId: search || undefined,
            status: statusFilter || undefined,
            populate: 'vehicle',
          },
        })
        .then((res) => res.data.data),
  });

  // Fetch all vehicles for the schedule dropdown
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehiclesListMaintenance'],
    queryFn: () => apiClient.get('/vehicles?limit=100').then((res) => res.data.data),
  });

  // Schedule Maintenance Mutation
  const scheduleMutation = useMutation({
    mutationFn: (newLog: any) => apiClient.post('/maintenances', newLog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      addToast('Maintenance task scheduled. Vehicle is now flagged In Maintenance.', 'success');
      setIsScheduleOpen(false);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to schedule maintenance', 'error');
    },
  });

  // Complete Maintenance Mutation
  const resolveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      apiClient.put(`/maintenances/${id}`, { status: 'Completed', ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      addToast('Maintenance task completed. Vehicle is now Active.', 'success');
      setResolveLogId(null);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to resolve maintenance log', 'error');
    },
  });

  const handleScheduleSubmit = (formData: any) => {
    const payload = {
      maintenanceId: formData.maintenanceId,
      vehicle: formData.vehicle,
      type: formData.type,
      priority: formData.priority,
      description: formData.description,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
      performedBy: formData.performedBy,
    };
    scheduleMutation.mutate(payload);
  };

  const handleResolveSubmit = () => {
    if (resolveLogId) {
      resolveMutation.mutate({
        id: resolveLogId,
        payload: {
          cost: resolveCost,
          performedBy: resolvePerformedBy,
          completedDate: new Date().toISOString(),
        },
      });
    }
  };

  const columns: Column<MaintenanceLog>[] = [
    { header: 'Log ID', accessor: 'maintenanceId', sortable: true, sortKey: 'maintenanceId' },
    { header: 'Vehicle Plate', accessor: (row) => row.vehicle?.plateNumber || 'N/A' },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Priority',
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${
            row.priority === 'High' || row.priority === 'Urgent'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {row.priority}
        </span>
      ),
    },
    { header: 'Repair Cost', accessor: (row) => formatCurrency(row.cost || 0) },
    { header: 'Date Scheduled', accessor: (row) => formatDate(row.scheduledDate) },
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
          {row.status !== 'Completed' && (
            <button
              onClick={() => {
                setResolveLogId(row._id);
                setResolveCost(row.cost || 0);
                setResolvePerformedBy(row.performedBy || '');
              }}
              title="Mark Resolved & Complete"
              className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setInspectedLog(row)}
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
          <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Maintenance Logs</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule preventative work, log breakdowns, and track vehicle repair states</p>
        </div>
        <button
          onClick={() => setIsScheduleOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Maintenance
        </button>
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

      <Table columns={columns} data={data?.data || []} isLoading={isLoading} />
      
      {data && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(data.total / 10) || 1}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Schedule Maintenance Modal */}
      <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Schedule Vehicle Maintenance">
        <Form schema={maintenanceSchema} onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
          {(methods) => (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Maintenance Code</label>
                  <input
                    type="text"
                    {...methods.register('maintenanceId')}
                    placeholder="e.g. MAIN-901"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.maintenanceId && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.maintenanceId.message as string}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Select Vehicle</label>
                  <select
                    {...methods.register('vehicle')}
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Choose vehicle to repair...</option>
                    {vehiclesData?.data
                      ?.filter((v: any) => v.status !== 'Retired' && v.status !== 'In Maintenance')
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Work Type</label>
                  <select
                    {...methods.register('type')}
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Preventative">Preventative</option>
                    <option value="Corrective">Corrective</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Breakdown">Breakdown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Priority</label>
                  <select
                    {...methods.register('priority')}
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Scheduled Date</label>
                <input
                  type="date"
                  {...methods.register('scheduledDate')}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                {methods.formState.errors.scheduledDate && (
                  <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.scheduledDate.message as string}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Job Description & Scope</label>
                <textarea
                  rows={3}
                  {...methods.register('description')}
                  placeholder="Details of defects, tasks to perform..."
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                {methods.formState.errors.description && (
                  <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.description.message as string}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Assigned Mechanic / Shop</label>
                <input
                  type="text"
                  {...methods.register('performedBy')}
                  placeholder="e.g. Master Diesel Repair"
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleMutation.isPending}
                  className="px-4 py-2 text-sm bg-indigo-650 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Repair'}
                </button>
              </div>
            </>
          )}
        </Form>
      </Modal>

      {/* Complete/Resolve Maintenance Modal */}
      <Modal isOpen={resolveLogId !== null} onClose={() => setResolveLogId(null)} title="Finalize Maintenance Task">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-500">
            Please register the final repair invoices and confirm the mechanic/shop performing the fix. This updates the asset operational cost ledger.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Actual Repair Cost ($)</label>
            <input
              type="number"
              value={resolveCost}
              onChange={(e) => setResolveCost(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Mechanic / Shop</label>
            <input
              type="text"
              value={resolvePerformedBy}
              onChange={(e) => setResolvePerformedBy(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => setResolveLogId(null)}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleResolveSubmit}
              disabled={resolveMutation.isPending}
              className="px-4 py-2 text-sm bg-indigo-650 text-white rounded-lg hover:bg-indigo-700"
            >
              {resolveMutation.isPending ? 'Resolving...' : 'Complete & Re-active Asset'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Inspect Maintenance details */}
      <Modal isOpen={inspectedLog !== null} onClose={() => setInspectedLog(null)} title="Maintenance Log Dossier">
        {inspectedLog && (
          <div className="flex flex-col gap-4">
            <div className="border-b pb-3">
              <span className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 font-bold px-2.5 py-0.5 rounded">
                {inspectedLog.status}
              </span>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
                Log Code: {inspectedLog.maintenanceId}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Vehicle</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">
                  {inspectedLog.vehicle?.plateNumber || 'N/A'} - {inspectedLog.vehicle?.model}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Repair Type / Priority</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">
                  {inspectedLog.type} ({inspectedLog.priority})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Repair Vendor</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{inspectedLog.performedBy || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Repair Cost</span>
                <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400">{formatCurrency(inspectedLog.cost || 0)}</span>
              </div>
            </div>

            <div className="border-t pt-3 flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-bold text-slate-400">Repair Task Description</span>
              <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded border">
                {inspectedLog.description}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
