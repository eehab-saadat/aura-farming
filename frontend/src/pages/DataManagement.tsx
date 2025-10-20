import React, { useState, useRef, useMemo, useEffect } from "react";
import QuickAddForm from "../components/QuickAddForm";
import DataTable from "../components/DataTable";

interface DemandRecord {
  id: string;
  date: string;
  demand: number;
}

const DataManagement: React.FC = () => {
  const [records, setRecords] = useState<DemandRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const tableRef = useRef<HTMLDivElement>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/data");
        const data = await response.json();
        const mappedData: DemandRecord[] = data.map(
          (item: any, index: number) => ({
            id: index.toString(),
            date: item.date,
            demand: item.sales,
          })
        );
        setRecords(mappedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Filter records based on search and filters
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" || record.date.includes(searchTerm);

      // Store filter - removed, assume single store

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

      return matchesSearch && matchesDateRange;
    });
  }, [records, searchTerm, dateRangeFilter]);

  const handleRecordAdded = async (record: DemandRecord) => {
    try {
      // Map to API format
      const apiRecord = {
        date: record.date,
        store: 1, // assume single store
        sales: record.demand,
        dow: 1, // default
        week: 1,
        month: 1,
        day: 1,
        quarter: 1,
        is_weekend: 0,
        year: 2023,
      };
      const response = await fetch("http://127.0.0.1:5000/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([apiRecord]),
      });
      if (response.ok) {
        // Refetch data
        const fetchResponse = await fetch("http://127.0.0.1:5000/data");
        const data = await fetchResponse.json();
        const mappedData: DemandRecord[] = data.map(
          (item: any, index: number) => ({
            id: index.toString(),
            date: item.date,
            demand: item.sales,
          })
        );
        setRecords(mappedData);
      }
    } catch (error) {
      console.error("Error adding record:", error);
    }

    // Scroll to the table after adding a record
    setTimeout(() => {
      tableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleUpdateRecord = async (
    id: string,
    field: keyof DemandRecord,
    value: string | number
  ) => {
    try {
      const index = parseInt(id);
      const updateData: any = {};
      if (field === "demand") {
        updateData.sales = value;
      } else if (field === "date") {
        updateData.date = value;
      }
      const response = await fetch(`http://127.0.0.1:5000/data/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (response.ok) {
        // Update local state
        setRecords((prev) =>
          prev.map((record) =>
            record.id === id ? { ...record, [field]: value } : record
          )
        );
      }
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const index = parseInt(id);
        const response = await fetch(`http://127.0.0.1:5000/data/${index}`, {
          method: "DELETE",
        });
        if (response.ok) {
          // Refetch data to update indices
          const fetchResponse = await fetch("http://127.0.0.1:5000/data");
          const data = await fetchResponse.json();
          const mappedData: DemandRecord[] = data.map(
            (item: any, index: number) => ({
              id: index.toString(),
              date: item.date,
              store: item.store,
              demand: item.sales,
            })
          );
          setRecords(mappedData);
        }
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setDateRangeFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || dateRangeFilter !== "all";

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
          Showing {filteredRecords.length} of {records.length} records
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
