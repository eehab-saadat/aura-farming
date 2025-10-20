import React, { useState, useMemo } from "react";

interface DemandRecord {
  id: string;
  date: string;
  store: string;
  demand: number;
}

interface DataTableProps {
  records: DemandRecord[];
  onUpdateRecord: (
    id: string,
    field: keyof DemandRecord,
    value: string | number
  ) => void;
  onDeleteRecord: (id: string) => void;
}

type SortField = keyof DemandRecord;
type SortDirection = "asc" | "desc";

const DataTable: React.FC<DataTableProps> = ({
  records,
  onUpdateRecord,
  onDeleteRecord,
}) => {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof DemandRecord;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const itemsPerPage = 10;

  // Generate mock data if no records exist
  const mockRecords: DemandRecord[] = useMemo(() => {
    if (records.length > 0) return records;

    const stores = [
      "Downtown Store",
      "Mall Location",
      "Suburban Branch",
      "Airport Outlet",
      "Online Warehouse",
    ];

    const mockData: DemandRecord[] = [];
    const today = new Date();

    for (let i = 0; i < 50; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));

      mockData.push({
        id: `mock-${i}`,
        date: date.toISOString().split("T")[0],
        store: stores[Math.floor(Math.random() * stores.length)],
        demand: Math.floor(Math.random() * 200) + 10,
      });
    }

    return mockData;
  }, [records]);

  const allRecords = records.length > 0 ? records : mockRecords;

  // Sort records
  const sortedRecords = useMemo(() => {
    return [...allRecords].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [allRecords, sortField, sortDirection]);

  // Paginate records
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCellDoubleClick = (
    record: DemandRecord,
    field: keyof DemandRecord
  ) => {
    if (field === "id") return; // Don't allow editing ID
    setEditingCell({ id: record.id, field });
    setEditValue(record[field].toString());
  };

  const handleCellEdit = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.key === "Enter") {
      handleCellSave();
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const handleCellSave = () => {
    if (editingCell) {
      const value =
        editingCell.field === "demand" ? parseFloat(editValue) : editValue;
      if (value !== undefined && !isNaN(value as number)) {
        onUpdateRecord(editingCell.id, editingCell.field, value);
      }
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleCellBlur = () => {
    handleCellSave();
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null;
    return (
      <svg
        className={`w-4 h-4 ml-1 inline ${
          sortDirection === "desc" ? "rotate-180" : ""
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Demand Records ({allRecords.length})
          </h3>
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("date")}
              >
                Date
                <SortIcon field="date" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("store")}
              >
                Store
                <SortIcon field="store" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("demand")}
              >
                Demand
                <SortIcon field="demand" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                  onDoubleClick={() => handleCellDoubleClick(record, "date")}
                >
                  {editingCell?.id === record.id &&
                  editingCell.field === "date" ? (
                    <input
                      type="date"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleCellEdit}
                      onBlur={handleCellBlur}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      autoFocus
                    />
                  ) : (
                    new Date(record.date).toLocaleDateString()
                  )}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                  onDoubleClick={() => handleCellDoubleClick(record, "store")}
                >
                  {editingCell?.id === record.id &&
                  editingCell.field === "store" ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleCellEdit}
                      onBlur={handleCellSave}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      autoFocus
                    >
                      <option value="Downtown Store">Downtown Store</option>
                      <option value="Mall Location">Mall Location</option>
                      <option value="Suburban Branch">Suburban Branch</option>
                      <option value="Airport Outlet">Airport Outlet</option>
                      <option value="Online Warehouse">Online Warehouse</option>
                    </select>
                  ) : (
                    record.store
                  )}
                </td>
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                  onDoubleClick={() => handleCellDoubleClick(record, "demand")}
                >
                  {editingCell?.id === record.id &&
                  editingCell.field === "demand" ? (
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleCellEdit}
                      onBlur={handleCellBlur}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      autoFocus
                    />
                  ) : (
                    `${record.demand} units`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCellDoubleClick(record, "demand")}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedRecords.length)} of{" "}
            {sortedRecords.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
