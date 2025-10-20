import React, { useState } from "react";

interface DemandRecord {
  id: string;
  date: string;
  demand: number;
}

interface QuickAddFormProps {
  onRecordAdded: (record: DemandRecord) => Promise<void>;
}

const QuickAddForm: React.FC<QuickAddFormProps> = ({ onRecordAdded }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    demand: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.demand || parseFloat(formData.demand) <= 0) {
      newErrors.demand = "Demand must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newRecord: DemandRecord = {
      id: Date.now().toString(),
      date: formData.date,
      demand: parseFloat(formData.demand),
    };

    await onRecordAdded(newRecord);

    // Clear form
    setFormData({
      date: new Date().toISOString().split("T")[0],
      demand: "",
    });

    setIsSubmitting(false);
    setShowSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddAnother = () => {
    // Keep the date and store, just clear demand
    setFormData((prev) => ({
      ...prev,
      demand: "",
    }));
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Quick Add Demand Record
          </h3>
          <p className="text-gray-600 text-sm">Add new demand data quickly</p>
        </div>

        {showSuccess && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">
              Record added successfully!
            </span>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 items-end"
      >
        {/* Date Input */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.date ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Demand Input */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Demand
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.demand}
              onChange={(e) => handleInputChange("demand", e.target.value)}
              placeholder="Enter demand..."
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                errors.demand ? "border-red-300" : "border-gray-300"
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">units</span>
            </div>
          </div>
          {errors.demand && (
            <p className="mt-1 text-sm text-red-600">{errors.demand}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding...</span>
              </div>
            ) : (
              "Add Record"
            )}
          </button>

          <button
            type="button"
            onClick={handleAddAnother}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Add Another
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickAddForm;
