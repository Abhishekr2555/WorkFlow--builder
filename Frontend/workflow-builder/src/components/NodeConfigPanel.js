"use client";
import { useFlowStore } from "@/store/flowStore";

export default function NodeConfigPanel() {
  const { selectedNode, updateNodeConfig, deleteSelectedNode } = useFlowStore();

  if (!selectedNode) {
    return (
      <aside className="w-64 p-4 border-l bg-gray-50">
        <p>Select a node to edit its config</p>
      </aside>
    );
  }

  const handleChange = (field, value) => {
    updateNodeConfig(selectedNode.id, { [field]: value });
  };

  return (
    <aside className="w-64 p-4 border-l bg-gray-50">
      <h3 className="font-bold mb-2">Config: {selectedNode.type}</h3>
      <div className="mb-3">
        <button
          onClick={deleteSelectedNode}
          className="px-2 py-1 text-sm bg-red-500 text-white rounded"
        >
          Delete Node
        </button>
      </div>

      {selectedNode.type === "apiCall" && (
        <>
          <input
            className="border p-1 w-full mb-2"
            placeholder="URL"
            value={selectedNode.data?.url || ""}
            onChange={(e) => handleChange("url", e.target.value)}
          />
          <select
            className="border p-1 w-full"
            value={selectedNode?.data?.method || "GET"}
            onChange={(e) => handleChange("method", e.target.value)}
          >
            <option>GET</option>
            <option>POST</option>
          </select>
        </>
      )}

      {selectedNode.type === "condition" && (
        <input
          className="border p-1 w-full"
          placeholder="e.g., value > 10"
          value={selectedNode?.data?.condition || ""}
          onChange={(e) => handleChange("condition", e.target.value)}
        />
      )}

      {selectedNode.type === "delay" && (
        <input
          type="number"
          className="border p-1 w-full"
          placeholder="Duration (s)"
          value={selectedNode?.data?.duration || ""}
          onChange={(e) => handleChange("duration", +e.target.value)}
        />
      )}

      {selectedNode.type === "python" && (
        <textarea
          className="border p-1 w-full h-32"
          placeholder="Python code"
          value={selectedNode?.data?.code || ""}
          onChange={(e) => handleChange("code", e.target.value)}
        />
      )}
    </aside>
  );
}
