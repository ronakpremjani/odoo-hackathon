import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-white border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isLoading}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-slate-700 bg-white border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-400">
            Page <span className="font-semibold text-slate-950 dark:text-white">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-950 dark:text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="relative inline-flex items-center rounded-l-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                  page === currentPage
                    ? 'z-10 bg-indigo-600 text-white'
                    : 'text-slate-900 dark:text-slate-300 ring-1 ring-inset ring-slate-300 dark:ring-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                } transition-all`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="relative inline-flex items-center rounded-r-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
