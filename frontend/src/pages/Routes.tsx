import React from 'react';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';

interface RouteDispatch {
  id: string;
  routeCode: string;
  origin: string;
  destination: string;
  driver: string;
  status: string;
}

export const Routes: React.FC = () => {
  const columns: Column<RouteDispatch>[] = [
    { header: 'Route Code', accessor: 'routeCode' },
    { header: 'Origin', accessor: 'origin' },
    { header: 'Destination', accessor: 'destination' },
    { header: 'Assigned Driver', accessor: 'driver' },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
              : row.status === 'In-Transit'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-450'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const mockRoutes = [
    { id: '1', routeCode: 'R-401', origin: 'Dallas, TX', destination: 'Houston, TX', driver: 'John Doe', status: 'In-Transit' },
    { id: '2', routeCode: 'R-402', origin: 'Chicago, IL', destination: 'Detroit, MI', driver: 'Bob Johnson', status: 'Completed' },
    { id: '3', routeCode: 'R-403', origin: 'Phoenix, AZ', destination: 'Los Angeles, CA', driver: 'Jane Smith', status: 'Pending' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Route Dispatch</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor transit status and load dispatch assignments</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value="" onChange={() => {}} placeholder="Search routes..." />
      </div>

      <Table columns={columns} data={mockRoutes} />
    </div>
  );
};
