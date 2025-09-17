"use client";
import { useFlowStore } from "@/store/flowStore";
import { useRef } from "react";

export default function ImportExportButtons() {
  const { nodes, edges, setFlow } = useFlowStore();
  const fileInputRef = useRef(null);

  // Helper to read file as text
  const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const flow = JSON.parse(content);

      if (!flow.nodes || !flow.edges) {
        throw new Error("Missing required data");
      }

      setFlow(flow.nodes, flow.edges);
    } catch (err) {
      console.error("Failed to import workflow:", err);
      alert("Invalid or corrupted workflow file.");
    } finally {
      event.target.value = ""; // reset input so user can re-upload same file
    }
  };

  const handleExport = () => {
    const workflowData = {
      nodes: nodes.map(({ id, type, position, data }) => ({
        id,
        type,
        position,
        data: { ...data },
      })),
      edges: edges.map((edge) => ({ ...edge })),
    };

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "workflow.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-2 flex justify-end items-center gap-2">
      {/* Hidden file input */}
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImport}
      />

      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Import from File
        </button>
      </div>
      <div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-gray-700 text-white rounded shadow hover:bg-gray-800 transition"
        >
          Export Workflow
        </button>
      </div>
    </div>
  );
}
