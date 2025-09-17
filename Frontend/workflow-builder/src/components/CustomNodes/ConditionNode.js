import { Handle, Position } from "@xyflow/react";

const ConditionNode = ({ data = {} }) => {
  return (
    <div className="rounded-lg border border-gray-300 bg-white shadow-md p-3 w-56">
      <div className="font-bold text-sm mb-2 text-purple-600">
        Condition Node
      </div>

      <div className="text-xs text-gray-500">Condition:</div>
      <div className="text-xs font-mono">{data.condition || "value > 10"}</div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-green-500"
      />
    </div>
  );
};

export default ConditionNode;
