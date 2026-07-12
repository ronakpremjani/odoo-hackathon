import { useState } from 'react';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';
import { Pagination } from '../components/ui/Pagination';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Eye, Check, X } from 'lucide-react';

interface ExpenseItem {
  id: string;
  expenseId: string;
  category: string;
  amount: number;
  date: string;
  status: string;
  vehicle: string;
}

export const Expenses = () => {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: '1', expenseId: 'EXP-101', category: 'Fuel', amount: 320, date: '2026-07-10', status: 'Pending', vehicle: 'TX-9082' },
    { id: '2', expenseId: 'EXP-102', category: 'Maintenance', amount: 1200, date: '2026-07-08', status: 'Approved', vehicle: 'CA-1123' },
    { id: '3', expenseId: 'EXP-103', category: 'Toll', amount: 45, date: '2026-07-12', status: 'Paid', vehicle: 'NY-8874' },
  ]);

  const handleApprove = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'Approved' } : e))
    );
    addToast('Expense claim approved', 'success');
  };

  const handleReject = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'Rejected' } : e))
    );
    addToast('Expense claim rejected', 'error');
  };

  const columns: Column<ExpenseItem>[] = [
    { header: 'Expense ID', accessor: 'expenseId', sortable: true, sortKey: 'expenseId' },
    { header: 'Vehicle', accessor: 'vehicle' },
    { header: 'Category', accessor: 'category' },
    { header: 'Amount', accessor: (row) => `$${row.amount.toLocaleString()}` },
    { header: 'Date', accessor: 'date' },
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
                onClick={() => handleApprove(row.id)}
                title="Approve"
                className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(row.id)}
                title="Reject"
                className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => addToast(`Viewing Invoice ${row.expenseId}`, 'info')}
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredExpenses = expenses
    .filter((e) => e.expenseId.toLowerCase().includes(search.toLowerCase()))
    .filter((e) => (categoryFilter ? e.category === categoryFilter : true));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Finance Expenses</h1>
        <p className="text-sm text-slate-500 mt-1">Review operational financial outlays, payroll, tolls, and repair invoices</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search expense ID..." />
        <FilterDropdown
          label="Category"
          options={[
            { label: 'Fuel', value: 'Fuel' },
            { label: 'Maintenance', value: 'Maintenance' },
            { label: 'Toll', value: 'Toll' },
            { label: 'Other', value: 'Other' },
          ]}
          selectedValue={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      <Table columns={columns} data={filteredExpenses} />
      <Pagination currentPage={currentPage} totalPages={1} onPageChange={setCurrentPage} />
    </motion.div>
  );
};
