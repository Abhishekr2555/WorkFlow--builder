import { Handle, Position } from "@xyflow/react";

const PythonNode = ({ data = {} }) => {
  return (
    <div className="rounded-lg border border-gray-300 bg-white shadow-md p-3 w-64">
      <div className="font-bold text-sm mb-2 text-green-600">
        Python Executor
      </div>

      <div className="text-xs text-gray-500">Code:</div>
      <pre className="text-xs bg-gray-100 p-2 rounded max-h-24 overflow-auto">
        {data.code || 'print("Hello, World!")'}
      </pre>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-green-500"
      />
    </div>
  );
};

export default PythonNode;
