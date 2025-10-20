import React, { useState } from "react";

interface MultiComponentSelectorProps {
  components: string[];
  selectedComponents: string[];
  onSelect: (components: string[]) => void;
  placeholder?: string;
}

const MultiComponentSelector: React.FC<MultiComponentSelectorProps> = ({
  components,
  selectedComponents,
  onSelect,
  placeholder = "Select components...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredComponents = components.filter((component) =>
    component.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleComponent = (component: string) => {
    const newSelected = selectedComponents.includes(component)
      ? selectedComponents.filter((c) => c !== component)
      : [...selectedComponents, component];
    onSelect(newSelected);
  };

  const handleRemoveComponent = (component: string) => {
    onSelect(selectedComponents.filter((c) => c !== component));
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Component(s)
      </label>

      {/* Selected components display */}
      {selectedComponents.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedComponents.map((component) => (
            <span
              key={component}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {component}
              <button
                type="button"
                onClick={() => handleRemoveComponent(component)}
                className="ml-1 inline-flex items-center p-0.5 rounded-full text-primary hover:bg-primary hover:text-white"
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input trigger */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />

        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredComponents.length > 0 ? (
            filteredComponents.map((component, index) => (
              <div
                key={index}
                onClick={() => handleToggleComponent(component)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                  selectedComponents.includes(component)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-900"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedComponents.includes(component)}
                  onChange={() => {}} // Handled by onClick
                  className="mr-2"
                />
                {component}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No components found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiComponentSelector;
