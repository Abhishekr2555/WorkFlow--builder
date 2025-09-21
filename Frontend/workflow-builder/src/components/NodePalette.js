"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { Plus, Code, Clock, Zap, GitBranch } from "lucide-react";
import { useFlowStore } from "@/store/flowStore";

const cn = (...args) => twMerge(clsx(args));

const nodeTypes = [
  {
    id: "apiCall",
    name: "API Call",
    icon: <Zap className="w-5 h-5" />,
    description: "Make HTTP requests to external APIs",
    color: "bg-blue-500",
  },
  {
    id: "condition",
    name: "Condition",
    icon: <GitBranch className="w-5 h-5" />,
    description: "Add conditional logic to your workflow",
    color: "bg-green-500",
  },
  {
    id: "delay",
    name: "Delay",
    icon: <Clock className="w-5 h-5" />,
    description: "Add time delays between actions",
    color: "bg-yellow-500",
  },
  {
    id: "python",
    name: "Python Code",
    icon: <Code className="w-5 h-5" />,
    description: "Execute custom Python scripts",
    color: "bg-purple-500",
  },
];

const NodeCard = ({ nodeType, onAdd, onDragStart }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e, nodeType.id);
      }}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300 group",
        isDragging && "opacity-50 rotate-2 scale-95"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg text-white", nodeType.color)}>
            {nodeType.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {nodeType.name}
            </h3>
          </div>
        </div>
        <button
          onClick={() => onAdd(nodeType.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          title={`Add ${nodeType.name}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        {nodeType.description}
      </p>
    </motion.div>
  );
};

export default function NodePalette() {
  const { addNode, nodes, edges, setFlow } = useFlowStore();
  const fileInputRef = useRef(null);

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleAddNode = (type) => {
    addNode(type);
  };

  // Helper: read file as text
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

      if (!flow.nodes || !flow.edges) throw new Error("Missing required data");

      setFlow(flow.nodes, flow.edges);
    } catch (err) {
      console.error("Failed to import workflow:", err);
      alert("Invalid or corrupted workflow file.");
    } finally {
      event.target.value = "";
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Node Palette</h2>
          <p className="text-sm text-gray-600 mt-1">
            Drag nodes to canvas or click + to add
          </p>
        </div>

        {/* Node List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <AnimatePresence>
            {nodeTypes.map((nodeType) => (
              <NodeCard
                key={nodeType.id}
                nodeType={nodeType}
                onAdd={handleAddNode}
                onDragStart={handleDragStart}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Import / Export Buttons */}
        <div className="p-4 border-t border-gray-200 bg-white flex flex-col gap-2">
          <input
            type="file"
            accept="application/json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Import Workflow
          </button>
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
          >
            Export Workflow
          </button>
        </div>
      </div>
    </div>
  );
}
