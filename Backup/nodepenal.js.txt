"use client";
import { useFlowStore } from "@/store/flowStore";

const nodeTypes = [
  { type: "apiCall", label: "API Call" },
  { type: "condition", label: "Condition" },
  { type: "delay", label: "Delay" },
  { type: "python", label: "Python Code" },
];

export default function NodePalette() {
  const { addNode } = useFlowStore();
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="p-4 w-48 bg-gray-100 border-r">
      <h3 className="font-bold mb-2">Nodes</h3>
      {nodeTypes.map((n) => (
        <div
          key={n.type}
          onDragStart={(e) => onDragStart(e, n.type)}
          draggable
          className="p-2 mb-2 bg-white border rounded cursor-grab shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <span>{n.label}</span>
            <button
              className="text-xs px-2 py-0.5 rounded bg-blue-500 text-white"
              onClick={() => addNode(n.type)}
              title="Add"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </aside>
  );
}
