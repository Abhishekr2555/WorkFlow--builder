import { Handle, Position } from "@xyflow/react";

const ApiCallNode = ({ data }) => {
  return (
    <div className="rounded-lg border border-gray-300 bg-white shadow-md p-3 w-56">
      {/* Node Title */}
      <div className="font-bold text-sm mb-2 text-blue-600">API Call Node</div>

      {/* URL */}
      <div className="text-xs text-gray-500">URL:</div>
      <div className="text-xs truncate mb-2">{data?.url || "No URL set"}</div>

      {/* Method */}
      <div className="text-xs text-gray-500">Method:</div>
      <div className="text-xs font-mono">{data?.method || "GET"}</div>

      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-green-500"
      />
    </div>
  );
};

export default ApiCallNode;
