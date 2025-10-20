import React from "react";
import CostInputForm from "../components/CostInputForm";

const CostConfig: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Cost Configuration
        </h1>
        <p className="text-gray-600">Configure costs and pricing parameters</p>
      </div>

      <div>
        <CostInputForm />
      </div>
    </div>
  );
};

export default CostConfig;
