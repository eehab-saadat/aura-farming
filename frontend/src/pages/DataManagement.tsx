import React, { useState, useRef, useMemo, useEffect } from "react";
import QuickAddForm from "../components/QuickAddForm";
import DataTable from "../components/DataTable";

interface SalesRecord {
  id: string;
  date: string;
  sales: number;
}

const DataManagement: React.FC = () => {
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const tableRef = useRef<HTMLDivElement>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/data");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Validate that we got an array
        if (!Array.isArray(data)) {
          throw new Error("API did not return an array of records");
        }

        const mappedData: SalesRecord[] = data
          .filter((item: any) => {
            // Filter out records with invalid date or sales
            return (
              item &&
              item.date &&
              item.sales !== null &&
              item.sales !== undefined &&
              !isNaN(Number(item.sales))
            );
          })
          .map((item: any, index: number) => ({
            id: index.toString(),
            date: item.date,
            sales: Number(item.sales), // Ensure sales is a number
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ); // Sort by date

        console.log("Fetched data:", mappedData);
        console.log("Raw API data:", data);
        setRecords(mappedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setRecords([]);
      }
    };
    fetchData();
  }, []);

  // Filter records based on date range
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Date range filter
      let matchesDateRange = true;
      if (startDate && endDate) {
        const recordDate = new Date(record.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDateRange = recordDate >= start && recordDate <= end;
      }

      return matchesDateRange;
    });
  }, [records, startDate, endDate]);

  const handleRecordAdded = async (record: SalesRecord) => {
    try {
      // Map to API format
      const apiRecord = {
        date: record.date,
        store: 1, // assume single store
        sales: record.sales,
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
        const mappedData: SalesRecord[] = data.map(
          (item: any, index: number) => ({
            id: index.toString(),
            date: item.date,
            sales: item.sales,
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
    field: keyof SalesRecord,
    value: string | number
  ) => {
    try {
      const index = parseInt(id);
      const updateData: any = {};
      if (field === "sales") {
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
          const mappedData: SalesRecord[] = data.map(
            (item: any, index: number) => ({
              id: index.toString(),
              date: item.date,
              sales: item.sales,
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
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = startDate !== "" || endDate !== "";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Data Management
        </h1>
      </div>

      {/* Quick Add Form */}
      <QuickAddForm onRecordAdded={handleRecordAdded} />

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
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
