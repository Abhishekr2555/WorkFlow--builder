import { Handle, Position } from "@xyflow/react";

const DelayNode = ({ data = {} }) => {
  return (
    <div className="rounded-lg border border-gray-300 bg-white shadow-md p-3 w-48">
      <div className="font-bold text-sm mb-2 text-orange-600">Delay Node</div>

      <div className="text-xs text-gray-500">Duration (s):</div>
      <div className="text-xs font-mono">{data.duration || 1}</div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-orange-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-green-500"
      />
    </div>
  );
};

export default DelayNode;
