import React from 'react';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';

interface Incident {
  id: string;
  incidentType: string;
  vehicle: string;
  driver: string;
  severity: string;
  date: string;
}

export const Safety: React.FC = () => {
  const columns: Column<Incident>[] = [
    { header: 'Incident Type', accessor: 'incidentType' },
    { header: 'Vehicle', accessor: 'vehicle' },
    { header: 'Driver', accessor: 'driver' },
    {
      header: 'Severity',
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.severity === 'High'
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450'
          }`}
        >
          {row.severity}
        </span>
      ),
    },
    { header: 'Reported Date', accessor: 'date' },
  ];

  const mockIncidents = [
    { id: '1', incidentType: 'Over-speeding Alert', vehicle: 'TX-9082', driver: 'John Doe', severity: 'Medium', date: '2026-07-10' },
    { id: '2', incidentType: 'Hard Braking Event', vehicle: 'CA-1123', driver: 'Jane Smith', severity: 'Low', date: '2026-07-11' },
    { id: '3', incidentType: 'Collision Near miss', vehicle: 'NY-8874', driver: 'Bob Johnson', severity: 'High', date: '2026-07-12' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Safety & Incidents</h1>
        <p className="text-sm text-slate-500 mt-1">Review safety triggers and logging compliance records</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value="" onChange={() => {}} placeholder="Search incident logs..." />
      </div>

      <Table columns={columns} data={mockIncidents} />
    </div>
  );
};
