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
import { Plus, Trash2, Eye, ShieldAlert } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { Form } from '../components/forms/Form';
import { z } from 'zod';
import { formatDate } from '../lib/utils';

// Zod validation schema for Driver registration
const driverSchema = z.object({
  user: z.string().min(1, 'Please select a system user'),
  licenseNumber: z.string().min(3, 'License number is required'),
  licenseType: z.enum(['Class A', 'Class B', 'Class C', 'Commercial', 'Heavy Truck']),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  phone: z.string().min(5, 'Phone number is required'),
  emergencyName: z.string().min(1, 'Emergency contact name is required'),
  emergencyRelationship: z.string().min(1, 'Relationship is required'),
  emergencyPhone: z.string().min(5, 'Emergency phone number is required'),
});

interface Driver {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: string;
  status: string;
  phone: string;
  safetyScore: number;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export const Drivers = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [inspectedDriver, setInspectedDriver] = useState<Driver | null>(null);

  // Fetch Drivers
  const { data, isLoading } = useQuery({
    queryKey: ['drivers', currentPage, search, statusFilter],
    queryFn: () =>
      apiClient
        .get('/drivers', {
          params: {
            page: currentPage,
            limit: 10,
            status: statusFilter || undefined,
            populate: 'user',
          },
        })
        .then((res) => res.data.data),
  });

  // Fetch Users to populate selection dropdown
  const { data: usersData } = useQuery({
    queryKey: ['usersList'],
    queryFn: () => apiClient.get('/users?limit=100').then((res) => res.data.data),
  });

  // Create Driver Mutation
  const createMutation = useMutation({
    mutationFn: (newDriver: any) => apiClient.post('/drivers', newDriver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      addToast('Driver profile registered successfully', 'success');
      setIsCreateOpen(false);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to register driver profile', 'error');
    },
  });

  // Delete Driver Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/drivers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      addToast('Driver profile removed successfully', 'success');
      setDeleteId(null);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to remove driver profile', 'error');
    },
  });

  const handleCreateSubmit = (formData: any) => {
    const payload = {
      user: formData.user,
      licenseNumber: formData.licenseNumber,
      licenseType: formData.licenseType,
      licenseExpiry: formData.licenseExpiry,
      phone: formData.phone,
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRelationship,
        phone: formData.emergencyPhone,
      },
    };
    createMutation.mutate(payload);
  };

  // Perform search locally since it's cleaner for populated relationship structures
  const filteredDrivers =
    data?.data?.filter((driver: Driver) => {
      const matchSearch =
        driver.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        driver.licenseNumber?.toLowerCase().includes(search.toLowerCase()) ||
        driver.phone?.includes(search);
      return matchSearch;
    }) || [];

  const columns: Column<Driver>[] = [
    { header: 'Operator Name', accessor: (row) => row.user?.name || 'Unassigned User' },
    { header: 'License No.', accessor: 'licenseNumber' },
    { header: 'Type', accessor: 'licenseType' },
    { header: 'License Expiry', accessor: (row) => formatDate(row.licenseExpiry) },
    {
      header: 'Safety Score',
      accessor: (row) => (
        <span
          className={`font-bold ${
            row.safetyScore >= 85
              ? 'text-emerald-600'
              : row.safetyScore >= 70
              ? 'text-amber-600'
              : 'text-rose-600'
          }`}
        >
          {row.safetyScore || 100} / 100
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
              : row.status === 'On Trip'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
              : 'bg-rose-100 text-rose-800'
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
            onClick={() => setInspectedDriver(row)}
            title="Inspect profiles & emergency logs"
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row._id)}
            title="Remove profile record"
            className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600"
          >
            <Trash2 className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Operator Registry</h1>
          <p className="text-sm text-slate-500 mt-1">Manage transport operators, license validation dates, and emergency contacts</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-sm font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Register Operator
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, license number..." />
        <FilterDropdown
          label="Status"
          options={[
            { label: 'Active', value: 'Active' },
            { label: 'On Trip', value: 'On Trip' },
            { label: 'Suspended', value: 'Suspended' },
            { label: 'On Leave', value: 'On Leave' },
          ]}
          selectedValue={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <Table columns={columns} data={filteredDrivers} isLoading={isLoading} />
      
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
        title="Remove Driver Profile"
        message="Are you sure you want to remove this driver profile? This action will mark the driver document as deleted."
      />

      {/* Register Driver Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Register Transport Operator">
        <Form schema={driverSchema} onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          {(methods) => (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">System User Account</label>
                <select
                  {...methods.register('user')}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select User Profile...</option>
                  {usersData?.data?.map((u: any) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                {methods.formState.errors.user && (
                  <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.user.message as string}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">License Number</label>
                  <input
                    type="text"
                    {...methods.register('licenseNumber')}
                    placeholder="e.g. DL-90821"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.licenseNumber && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.licenseNumber.message as string}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">License Type</label>
                  <select
                    {...methods.register('licenseType')}
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Class A">Class A</option>
                    <option value="Class B">Class B</option>
                    <option value="Class C">Class C</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Heavy Truck">Heavy Truck</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">License Expiration Date</label>
                  <input
                    type="date"
                    {...methods.register('licenseExpiry')}
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.licenseExpiry && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.licenseExpiry.message as string}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Contact Phone</label>
                  <input
                    type="text"
                    {...methods.register('phone')}
                    placeholder="e.g. +1 555-0199"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.phone && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.phone.message as string}</span>
                  )}
                </div>
              </div>

              {/* Emergency Contact Block */}
              <div className="border-t pt-3 mt-1 flex flex-col gap-3">
                <span className="text-[11px] font-bold text-indigo-650 uppercase tracking-widest">Emergency Contact</span>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    {...methods.register('emergencyName')}
                    placeholder="Emergency Contact Name"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.emergencyName && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.emergencyName.message as string}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Relationship</label>
                    <input
                      type="text"
                      {...methods.register('emergencyRelationship')}
                      placeholder="e.g. Spouse, Brother"
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {methods.formState.errors.emergencyRelationship && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.emergencyRelationship.message as string}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      {...methods.register('emergencyPhone')}
                      placeholder="e.g. +1 555-0188"
                      className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {methods.formState.errors.emergencyPhone && (
                      <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.emergencyPhone.message as string}</span>
                    )}
                  </div>
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
                  {createMutation.isPending ? 'Saving...' : 'Register Operator'}
                </button>
              </div>
            </>
          )}
        </Form>
      </Modal>

      {/* Inspect Driver Details Modal */}
      <Modal isOpen={inspectedDriver !== null} onClose={() => setInspectedDriver(null)} title="Operator Dossier">
        {inspectedDriver && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-650 text-white flex items-center justify-center font-bold text-lg">
                {inspectedDriver.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{inspectedDriver.user?.name}</h4>
                <p className="text-xs text-slate-450">{inspectedDriver.user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">License Type / Number</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">
                  {inspectedDriver.licenseType} ({inspectedDriver.licenseNumber})
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">License Expiry</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">{formatDate(inspectedDriver.licenseExpiry)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Direct Contact Phone</span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{inspectedDriver.phone}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Compliance Status</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                    inspectedDriver.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {inspectedDriver.status}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 flex flex-col gap-3">
              <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                Emergency Operations Contact
              </h5>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Name</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">{inspectedDriver.emergencyContact?.name}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Relationship</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">{inspectedDriver.emergencyContact?.relationship}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Phone</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{inspectedDriver.emergencyContact?.phone}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
