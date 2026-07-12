import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Plus, Eye, Check, X, DollarSign } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { Form } from '../components/forms/Form';
import { z } from 'zod';
import { formatDate, formatCurrency } from '../lib/utils';

// Expense Validation Schema
const expenseSchema = z.object({
  expenseId: z.string().min(2, 'Expense reference is required'),
  category: z.enum(['Fuel', 'Maintenance', 'Toll', 'Salary', 'Insurance', 'Other']),
  amount: z.preprocess((val) => Number(val), z.number().positive('Amount must be positive')),
  vehicle: z.string().optional(),
  description: z.string().min(3, 'Description is required'),
});

interface Expense {
  _id: string;
  expenseId: string;
  category: string;
  amount: number;
  date: string;
  status: string;
  vehicle?: {
    _id: string;
    plateNumber: string;
  };
  description: string;
}

export const Expenses = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [inspectedExpense, setInspectedExpense] = useState<Expense | null>(null);

  // Fetch Expenses
  const { data, isLoading } = useQuery({
    queryKey: ['expenses', currentPage, search, categoryFilter],
    queryFn: () =>
      apiClient
        .get('/expenses', {
          params: {
            page: currentPage,
            limit: 10,
            expenseId: search || undefined,
            category: categoryFilter || undefined,
            populate: 'vehicle',
          },
        })
        .then((res) => res.data.data),
  });

  // Fetch all vehicles for selectors
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehiclesListExpenses'],
    queryFn: () => apiClient.get('/vehicles?limit=100').then((res) => res.data.data),
  });

  // Create Expense Mutation
  const createMutation = useMutation({
    mutationFn: (newExpense: any) => apiClient.post('/expenses', newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      addToast('Expense claim logged successfully', 'success');
      setIsRecordOpen(false);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to log expense claim', 'error');
    },
  });

  // Approve Expense Mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/expenses/${id}`, { status: 'Approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardKpis'] });
      addToast('Expense claim approved', 'success');
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to approve expense claim', 'error');
    },
  });

  // Reject Expense Mutation
  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/expenses/${id}`, { status: 'Rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      addToast('Expense claim rejected', 'error');
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to reject expense claim', 'error');
    },
  });

  const handleCreateSubmit = (formData: any) => {
    const payload = {
      expenseId: formData.expenseId,
      category: formData.category,
      amount: formData.amount,
      vehicle: formData.vehicle || undefined,
      description: formData.description,
      date: new Date().toISOString(),
    };
    createMutation.mutate(payload);
  };

  const columns: Column<Expense>[] = [
    { header: 'Expense ID', accessor: 'expenseId', sortable: true, sortKey: 'expenseId' },
    { header: 'Vehicle Plate', accessor: (row) => row.vehicle?.plateNumber || 'General / Fleet' },
    { header: 'Category', accessor: 'category' },
    { header: 'Amount', accessor: (row) => formatCurrency(row.amount) },
    { header: 'Date Claimed', accessor: (row) => formatDate(row.date) },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.status === 'Paid' || row.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
              : row.status === 'Rejected'
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
          {row.status === 'Pending' && (
            <>
              <button
                onClick={() => approveMutation.mutate(row._id)}
                title="Approve Claims"
                className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => rejectMutation.mutate(row._id)}
                title="Reject Claims"
                className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setInspectedExpense(row)}
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
          <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Finance Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">Review operational financial outlays, payroll, tolls, and repair invoices</p>
        </div>
        <button
          onClick={() => setIsRecordOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Expense
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search expense ID..." />
        <FilterDropdown
          label="Category"
          options={[
            { label: 'Fuel', value: 'Fuel' },
            { label: 'Maintenance', value: 'Maintenance' },
            { label: 'Toll', value: 'Toll' },
            { label: 'Salary', value: 'Salary' },
            { label: 'Insurance', value: 'Insurance' },
            { label: 'Other', value: 'Other' },
          ]}
          selectedValue={categoryFilter}
          onChange={setCategoryFilter}
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

      {/* Record Expense Modal */}
      <Modal isOpen={isRecordOpen} onClose={() => setIsRecordOpen(false)} title="Record Expense Claim">
        <Form schema={expenseSchema} onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          {(methods) => (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Expense Code</label>
                  <input
                    type="text"
                    {...methods.register('expenseId')}
                    placeholder="e.g. EXP-101"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.expenseId && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.expenseId.message as string}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Select Vehicle</label>
                  <select
                    {...methods.register('vehicle')}
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Choose vehicle association...</option>
                    {vehiclesData?.data?.map((v: any) => (
                      <option key={v._id} value={v._id}>
                        {v.plateNumber} - {v.make} {v.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Category</label>
                  <select
                    {...methods.register('category')}
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Fuel">Fuel</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Toll">Toll</option>
                    <option value="Salary">Salary</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...methods.register('amount')}
                    placeholder="Claim value"
                    className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  {methods.formState.errors.amount && (
                    <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.amount.message as string}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase mb-1">Scope of Expense / Description</label>
                <textarea
                  rows={3}
                  {...methods.register('description')}
                  placeholder="Details of toll transaction, fuel top-up receipt etc..."
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                {methods.formState.errors.description && (
                  <span className="text-xs text-rose-500 block mt-1">{methods.formState.errors.description.message as string}</span>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsRecordOpen(false)}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-sm bg-indigo-650 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Logging...' : 'Submit Claim'}
                </button>
              </div>
            </>
          )}
        </Form>
      </Modal>

      {/* Inspect Expense Modal */}
      <Modal isOpen={inspectedExpense !== null} onClose={() => setInspectedExpense(null)} title="Expense Claim Details">
        {inspectedExpense && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b pb-3">
              <DollarSign className="w-6 h-6 text-indigo-650" />
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Expense Claim: {inspectedExpense.expenseId}
                </h4>
                <p className="text-xs text-slate-450">Category: {inspectedExpense.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Claim Amount</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(inspectedExpense.amount)}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Claim Status</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{inspectedExpense.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Asset Allocation</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">
                  {inspectedExpense.vehicle?.plateNumber || 'General Operation'}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Log Date</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{formatDate(inspectedExpense.date)}</span>
              </div>
            </div>

            <div className="border-t pt-3 flex flex-col gap-1.5">
              <span className="text-[9px] uppercase font-bold text-slate-400">Claim Descriptions / Details</span>
              <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded border">
                {inspectedExpense.description}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
