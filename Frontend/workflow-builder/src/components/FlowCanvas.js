"use client";
import { useFlowStore } from "@/store/flowStore";
import {
  Background,
  Controls,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import ApiCallNode from "./CustomNodes/ApiCallNode";
import ConditionNode from "./CustomNodes/ConditionNode";
import DelayNode from "./CustomNodes/DelayNode";
import PythonNode from "./CustomNodes/PythonNode";

const nodeTypes = {
  apiCall: ApiCallNode,
  condition: ConditionNode,
  delay: DelayNode,
  python: PythonNode,
};

export default function FlowCanvas() {
  const transformNodes = (nodes) =>
    nodes.map((node) => ({
      ...node.data,
      id: node.id,
      type: node.type,
      position: node.position,
    }));
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNode,
    deleteSelectedNode,
    clearSelection,
    setSelectedEdge,
    deleteSelectedEdge,
    selectedEdge,
    clearEdgeSelection,
  } = useFlowStore();
  const onEdgeClick = useCallback(
    (event, edge) => {
      setSelectedEdge(edge);
    },
    [setSelectedEdge]
  );

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // --- Run workflow states ---
  const [error, setError] = useState(null);
  const [workflowOutput, setWorkflowOutput] = useState(null);
  // --- Validate workflow states ---
  const [validateResult, setValidateResult] = useState(null);
  const [validateLoading, setValidateLoading] = useState(false);
  const [validateError, setValidateError] = useState(null);

  // --- Execute workflow states ---
  const [executeResult, setExecuteResult] = useState(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState(null);

  // --- Generate workflow states ---
  const [generateResult, setGenerateResult] = useState(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  // --- Validate Workflow ---
  const validateWorkflow = async () => {
    setValidateLoading(true);
    setValidateError(null);
    setValidateResult(null);
    try {
      const response = await fetch(`${backendUrl}/workflow/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: transformNodes(nodes), edges }),
      });
      if (!response.ok) throw new Error("Validation failed");
      const data = await response.json();
      setValidateResult(data.message || JSON.stringify(data, null, 2));
    } catch (err) {
      setValidateError(err.message);
    } finally {
      setValidateLoading(false);
    }
  };

  // --- Execute Workflow ---
  const executeWorkflow = async () => {
    setExecuteLoading(true);
    setExecuteError(null);
    setExecuteResult(null);
    try {
      const response = await fetch(`${backendUrl}/workflow/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: transformNodes(nodes), edges }),
      });
      if (!response.ok) throw new Error("Execution failed");
      const data = await response.json();
      setExecuteResult(data.result || JSON.stringify(data, null, 2));
    } catch (err) {
      setExecuteError(err.message);
    } finally {
      setExecuteLoading(false);
    }
  };

  // --- Generate Workflow ---
  const generateWorkflow = async () => {
    const userInput = prompt("Enter input for workflow generation:");
    if (!userInput) return;

    setGenerateLoading(true);
    setGenerateError(null);
    setGenerateResult(null);

    try {
      const response = await fetch(`${backendUrl}/workflow/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_input: userInput,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setGenerateResult(data.generated || JSON.stringify(data, null, 2));
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerateLoading(false);
    }
  };

  const checkBackend = async () => {
    try {
      const response = await fetch(`${backendUrl}`);
      if (!response.ok) throw new Error("Backend not responding");
      const data = await response.json();
      console.log("data:", data);
      console.log("✅ Backend is working");
    } catch (err) {
      console.log(err.message);
    }
  };
  // --- ReactFlow handlers ---
  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nds) =>
        applyNodeChanges(changes, Array.isArray(nds) ? nds : [])
      ),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((eds) =>
        applyEdgeChanges(changes, Array.isArray(eds) ? eds : [])
      ),
    [setEdges]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }) => {
      if (Array.isArray(selectedNodes) && selectedNodes.length > 0) {
        setSelectedNode(selectedNodes[0]);
      } else {
        clearSelection();
      }
    },
    [setSelectedNode, clearSelection]
  );

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge({ ...connection, type: "smoothstep" }, eds));
    },
    [setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      const position = { x: event.clientX - 250, y: event.clientY - 50 };

      let newNode = {
        id: `${+new Date()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      // Add required fields based on node type
      switch (type) {
        case "apiCall":
          newNode.url = "https://example.com/api"; // default URL
          newNode.method = "GET"; // default method
          break;
        case "python":
          newNode.code = ""; // default empty code
          break;
        case "condition":
          newNode.condition = ""; // default empty condition
          break;
        case "delay":
          newNode.duration = 0; // default 0 seconds
          break;
        default:
          break;
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedNode();
      }
    },
    [deleteSelectedNode]
  );

  return (
    <div className="flex-1 h-screen flex flex-col">
      {/* Top Bar */}
      <div className="p-4 flex items-center gap-4 bg-gray-50 border-b">
        <button
          onClick={validateWorkflow}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          disabled={validateLoading}
        >
          {validateLoading ? "Validating..." : "Validate"}
        </button>
        <button
          onClick={executeWorkflow}
          className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition"
          disabled={executeLoading}
        >
          {executeLoading ? "Executing..." : "Execute"}
        </button>
        <button
          onClick={generateWorkflow}
          className="px-4 py-2 bg-orange-600 text-white rounded shadow hover:bg-orange-700 transition"
          disabled={generateLoading}
        >
          {generateLoading ? "Generating..." : "Generate"}
        </button>

        {/* <button
          onClick={checkBackend}
          className="px-4 py-2 bg-gray-700 text-white rounded shadow hover:bg-gray-800 transition"
        >
          Test
        </button> */}

        {(error || validateError || executeError || generateError) && (
          <span className="text-red-500 text-sm">
            {error || validateError || executeError || generateError}
          </span>
        )}
      </div>

      {/* Canvas */}
      <div
        className="flex-1"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onKeyDown={(e) => {
          if ((e.key === "Delete" || e.key === "Backspace") && selectedEdge) {
            deleteSelectedEdge();
            clearEdgeSelection();
          } else {
            onKeyDown(e);
          }
        }}
        tabIndex={0}
      >
        <ReactFlow
          nodes={Array.isArray(nodes) ? nodes : []}
          edges={Array.isArray(edges) ? edges : []}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onSelectionChange={onSelectionChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          connectionMode="loose"
          defaultEdgeOptions={{ type: "smoothstep" }}
          fitView
        >
          <Background variant="dots" gap={12} size={2} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Outputs Section */}
      <div className="p-4 border-t bg-white shadow-inner space-y-4 max-h-80 overflow-y-auto">
        {workflowOutput && (
          <OutputBlock title="Workflow Output" content={workflowOutput} />
        )}
        {validateResult && (
          <OutputBlock title="Validation Result" content={validateResult} />
        )}
        {executeResult && (
          <OutputBlock title="Execution Result" content={executeResult} />
        )}
        {generateResult && (
          <OutputBlock title="Generated Workflow" content={generateResult} />
        )}
      </div>
    </div>
  );
}

function OutputBlock({ title, content }) {
  return (
    <div>
      <h3 className="font-bold mb-2 text-lg text-green-700">{title}</h3>
      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
        {typeof content === "string"
          ? content
          : JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}
