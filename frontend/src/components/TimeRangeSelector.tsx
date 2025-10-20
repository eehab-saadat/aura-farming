import React, { useState } from "react";

interface TimeRangeSelectorProps {
  selectedRange: number;
  onRangeChange: (days: number) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customDays, setCustomDays] = useState(30);

  const ranges = [
    { label: "30 days", value: 30 },
    { label: "60 days", value: 60 },
    { label: "90 days", value: 90 },
    { label: "Custom", value: "custom" },
  ];

  const handleRangeSelect = (range: number | string) => {
    if (range === "custom") {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      onRangeChange(range as number);
    }
  };

  const handleCustomRangeApply = () => {
    onRangeChange(customDays);
    setShowCustomPicker(false);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Time Range
      </label>

      {/* Range Toggle Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ranges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeSelect(range.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedRange === range.value && typeof range.value === "number"
                ? "bg-primary text-white shadow-md"
                : range.value === "custom" && showCustomPicker
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Custom Days Slider */}
      {showCustomPicker && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Custom Range: {customDays} days
              </label>
              <button
                onClick={handleCustomRangeApply}
                className="px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition-colors duration-200"
              >
                Apply
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="90"
                value={customDays}
                onChange={(e) => setCustomDays(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    (customDays / 90) * 100
                  }%, #e5e7eb ${(customDays / 90) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 days</span>
                <span>90 days</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;
