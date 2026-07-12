import React from 'react';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: string;
  status: string;
}

export const Fleet: React.FC = () => {
  const columns: Column<Vehicle>[] = [
    { header: 'Plate Number', accessor: 'plateNumber' },
    { header: 'Model', accessor: 'model' },
    { header: 'Type', accessor: 'type' },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const mockVehicles = [
    { id: '1', plateNumber: 'TX-9082', model: 'Freightliner Cascadia', type: 'Heavy Truck', status: 'Active' },
    { id: '2', plateNumber: 'CA-1123', model: 'Peterbilt 579', type: 'Heavy Truck', status: 'Maintenance' },
    { id: '3', plateNumber: 'NY-8874', model: 'Volvo VNL 860', type: 'Heavy Truck', status: 'Active' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Fleet Operations</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and track fleet assets</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value="" onChange={() => {}} placeholder="Search vehicles..." />
        <FilterDropdown
          label="Status"
          options={[
            { label: 'Active', value: 'Active' },
            { label: 'Maintenance', value: 'Maintenance' },
          ]}
          selectedValue=""
          onChange={() => {}}
        />
      </div>

      <Table columns={columns} data={mockVehicles} />
    </div>
  );
};
