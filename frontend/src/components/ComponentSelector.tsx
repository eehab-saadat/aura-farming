import React, { useState } from "react";

interface ComponentSelectorProps {
  components: string[];
  selectedComponent: string;
  onSelect: (component: string) => void;
}

const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  components,
  selectedComponent,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredComponents = components.filter((component) =>
    component.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (component: string) => {
    onSelect(component);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Component
      </label>

      {/* Selected component display / input trigger */}
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : selectedComponent}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search components..."
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
                onClick={() => handleSelect(component)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  component === selectedComponent
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-900"
                }`}
              >
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

export default ComponentSelector;
