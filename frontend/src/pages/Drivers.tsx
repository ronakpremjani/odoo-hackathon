import React from 'react';
import { Table, Column } from '../components/tables/Table';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterDropdown } from '../components/ui/FilterDropdown';

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  complianceStatus: string;
  phone: string;
}

export const Drivers: React.FC = () => {
  const columns: Column<Driver>[] = [
    { header: 'Driver Name', accessor: 'name' },
    { header: 'License Number', accessor: 'licenseNumber' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Compliance',
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.complianceStatus === 'Compliant'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450'
          }`}
        >
          {row.complianceStatus}
        </span>
      ),
    },
  ];

  const mockDrivers = [
    { id: '1', name: 'John Doe', licenseNumber: 'DL-90821', complianceStatus: 'Compliant', phone: '+1 555-0199' },
    { id: '2', name: 'Jane Smith', licenseNumber: 'DL-11234', complianceStatus: 'Non-Compliant', phone: '+1 555-0182' },
    { id: '3', name: 'Bob Johnson', licenseNumber: 'DL-88749', complianceStatus: 'Compliant', phone: '+1 555-0177' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Driver Profiles</h1>
        <p className="text-sm text-slate-500 mt-1">Manage transport operators and licensing status</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput value="" onChange={() => {}} placeholder="Search drivers..." />
        <FilterDropdown
          label="Compliance"
          options={[
            { label: 'Compliant', value: 'Compliant' },
            { label: 'Non-Compliant', value: 'Non-Compliant' },
          ]}
          selectedValue=""
          onChange={() => {}}
        />
      </div>

      <Table columns={columns} data={mockDrivers} />
    </div>
  );
};
