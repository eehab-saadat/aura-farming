import React, { useState, useRef, useMemo } from "react";
import QuickAddForm from "../components/QuickAddForm";
import DataTable from "../components/DataTable";

interface DemandRecord {
  id: string;
  date: string;
  store: string;
  demand: number;
}

const DataManagement: React.FC = () => {
  const [records, setRecords] = useState<DemandRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const tableRef = useRef<HTMLDivElement>(null);

  const mockStores = [
    "Downtown Store",
    "Mall Location",
    "Suburban Branch",
    "Airport Outlet",
    "Online Warehouse",
  ];

  // Generate mock data if no records exist
  const allRecords = useMemo(() => {
    if (records.length > 0) return records;

    const mockData: DemandRecord[] = [];
    const today = new Date();

    for (let i = 0; i < 50; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));

      mockData.push({
        id: `mock-${i}`,
        date: date.toISOString().split("T")[0],
        store: mockStores[Math.floor(Math.random() * mockStores.length)],
        demand: Math.floor(Math.random() * 200) + 10,
      });
    }

    return mockData;
  }, [records]);

  // Filter records based on search and filters
  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        record.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.date.includes(searchTerm);

      // Store filter
      const matchesStore =
        storeFilter === "all" || record.store === storeFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRangeFilter !== "all") {
        const recordDate = new Date(record.date);
        const today = new Date();

        switch (dateRangeFilter) {
          case "7days":
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            matchesDateRange = recordDate >= sevenDaysAgo;
            break;
          case "30days":
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            matchesDateRange = recordDate >= thirtyDaysAgo;
            break;
          case "90days":
            const ninetyDaysAgo = new Date(today);
            ninetyDaysAgo.setDate(today.getDate() - 90);
            matchesDateRange = recordDate >= ninetyDaysAgo;
            break;
          case "custom":
            // For custom, we'll implement date picker later
            matchesDateRange = true;
            break;
        }
      }

      return matchesSearch && matchesStore && matchesDateRange;
    });
  }, [allRecords, searchTerm, storeFilter, dateRangeFilter]);

  const handleRecordAdded = (record: DemandRecord) => {
    setRecords((prev) => [record, ...prev]);

    // Scroll to the table after adding a record
    setTimeout(() => {
      tableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleUpdateRecord = (
    id: string,
    field: keyof DemandRecord,
    value: string | number
  ) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, [field]: value } : record
      )
    );
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setRecords((prev) => prev.filter((record) => record.id !== id));
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStoreFilter("all");
    setDateRangeFilter("all");
  };

  const hasActiveFilters =
    searchTerm !== "" || storeFilter !== "all" || dateRangeFilter !== "all";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Data Management
        </h1>
        <p className="text-gray-600">Import, export, and manage farming data</p>
      </div>

      {/* Quick Add Form */}
      <QuickAddForm onRecordAdded={handleRecordAdded} />

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by store or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store
              </label>
              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All Stores</option>
                {mockStores.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredRecords.length} of {allRecords.length} records
        </div>
      </div>

      {/* Records Table */}
      <div ref={tableRef}>
        <DataTable
          records={filteredRecords}
          onUpdateRecord={handleUpdateRecord}
          onDeleteRecord={handleDeleteRecord}
        />
      </div>
    </div>
  );
};

export default DataManagement;
