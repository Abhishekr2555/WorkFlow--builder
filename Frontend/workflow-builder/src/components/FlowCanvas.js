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
import dagre from "dagre";

// ✅ Importing Dialog + Chat UI from your provided code
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CheckCircle, Play, X, Zap } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "./ui/button";

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

  // --- Workflow states ---
  const [workflowOutput, setWorkflowOutput] = useState(null);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [validateResult, setValidateResult] = useState(null);
  const [validateLoading, setValidateLoading] = useState(false);
  const [validateError, setValidateError] = useState(null);
  const [executeResult, setExecuteResult] = useState(null);
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState(null);
  const [generateResult, setGenerateResult] = useState(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState(null);

  const getLayoutedElements = (nodes, edges, direction = "TB") => {
    if (!nodes || nodes.length === 0) {
      return { nodes: [], edges: edges || [] };
    }

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: direction,
      nodesep: 50,
      ranksep: 50,
      marginx: 20,
      marginy: 20,
    });

    const nodeWidth = 180;
    const nodeHeight = 60;

    nodes.forEach((node) => {
      if (node.id) {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      }
    });

    const addedEdges = new Set();
    const validEdges = [];

    (edges || []).forEach((edge) => {
      const edgeKey = `${edge.source}-${edge.target}`;
      if (
        addedEdges.has(edgeKey) ||
        edge.source === edge.target ||
        !dagreGraph.hasNode(edge.source) ||
        !dagreGraph.hasNode(edge.target)
      ) {
        return;
      }
      dagreGraph.setEdge(edge.source, edge.target);
      addedEdges.add(edgeKey);
      validEdges.push(edge);
    });

    try {
      dagre.layout(dagreGraph);
    } catch (error) {
      console.error("Dagre layout error:", error);
      return {
        nodes: nodes.map((node, index) => ({
          ...node,
          position: { x: index * 200, y: 100 },
        })),
        edges: validEdges,
      };
    }

    const layoutedNodes = nodes.map((node) => {
      if (!node.id || !dagreGraph.hasNode(node.id)) {
        return { ...node, position: node.position || { x: 0, y: 0 } };
      }
      const { x, y } = dagreGraph.node(node.id);
      return {
        ...node,
        position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 },
      };
    });

    return { nodes: layoutedNodes, edges: validEdges };
  };

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
      setWorkflowOutput(data.result || data || null);
      setIsOutputOpen(true);
    } catch (err) {
      setExecuteError(err.message);
    } finally {
      setExecuteLoading(false);
    }
  };

  // const generateWorkflow = async (userInput) => {
  //   if (!userInput) return;
  //   setGenerateLoading(true);
  //   setGenerateError(null);
  //   setGenerateResult(null);
  //   try {
  //     const response = await fetch(`${backendUrl}/workflow/generate`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ user_input: userInput }),
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       throw new Error(`Generation failed: ${response.status} - ${errorText}`);
  //     }

  //     const data = await response.json();
  //     const workflow = data?.workflow || data?.generated || data;
  //     if (!workflow?.nodes || !Array.isArray(workflow.nodes)) {
  //       throw new Error("Invalid workflow structure received from backend");
  //     }

  //     const mappedNodes = workflow.nodes.map((n, i) => ({
  //       id: n.id ? n.id.toString() : `node-${i}`,
  //       type: n.type || "default",
  //       position: n.position || { x: i * 200, y: 100 },
  //       data: { label: n.label || `${n.type || "Node"} (${n.id || i})`, ...n },
  //     }));

  //     const mappedEdges = (workflow.edges || []).map((e, i) => ({
  //       id: e.id ? e.id.toString() : `edge-${i}`,
  //       source: e.source || e.from || "",
  //       target: e.target || e.to || "",
  //       type: "smoothstep",
  //     }));

  //     if (mappedNodes.length > 0) {
  //       const { nodes: layoutedNodes, edges: layoutedEdges } =
  //         getLayoutedElements(mappedNodes, mappedEdges, "TB");
  //       setNodes(layoutedNodes);
  //       setEdges(layoutedEdges);
  //       setGenerateResult(JSON.stringify(workflow, null, 2));
  //     } else {
  //       throw new Error("No nodes found in generated workflow");
  //     }
  //   } catch (err) {
  //     setGenerateError(err.message);
  //   } finally {
  //     setGenerateLoading(false);
  //   }
  // };

  const generateWorkflow = async (userInput) => {
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
          current_workflow: {
            nodes: transformNodes(nodes), // 👈 send current state
            edges,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Generation failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const workflow = data?.workflow || data?.generated || data;

      if (!workflow?.nodes || !Array.isArray(workflow.nodes)) {
        throw new Error("Invalid workflow structure received from backend");
      }

      // 🔧 Step 2: MERGE nodes & edges instead of replacing
      const mappedNodes = workflow.nodes.map((n, i) => ({
        id: n.id ? n.id.toString() : `node-${Date.now()}-${i}`,
        type: n.type || "default",
        position: n.position || { x: i * 200, y: 100 },
        data: { label: n.label || `${n.type || "Node"} (${n.id || i})`, ...n },
      }));

      const mappedEdges = (workflow.edges || []).map((e, i) => ({
        id: e.id ? e.id.toString() : `edge-${Date.now()}-${i}`,
        source: e.source || e.from || "",
        target: e.target || e.to || "",
        type: "smoothstep",
      }));

      // merge with old
      setNodes((prevNodes) => {
        const existingIds = new Set(prevNodes.map((n) => n.id));
        return [
          ...prevNodes,
          ...mappedNodes.filter((n) => !existingIds.has(n.id)), // avoid duplicates
        ];
      });

      setEdges((prevEdges) => {
        const existingIds = new Set(prevEdges.map((e) => e.id));
        return [
          ...prevEdges,
          ...mappedEdges.filter((e) => !existingIds.has(e.id)), // avoid duplicates
        ];
      });

      setGenerateResult(JSON.stringify(workflow, null, 2));
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerateLoading(false);
    }
  };

  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex-1 h-screen flex flex-col">
      <div className="p-4 flex items-center justify-between bg-gray-50 border-b">
        <h2 className="text-xl font-semibold">Workflow Builder</h2>

        <div className="flex items-center gap-3">
          <Button
            onClick={validateWorkflow}
            variant="outline"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Validate
          </Button>
          <Button
            onClick={executeWorkflow}
            variant="outline"
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>

          <DialogPrimitive.Root open={chatOpen} onOpenChange={setChatOpen}>
            <DialogPrimitive.Trigger asChild>
              <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl shadow hover:bg-purple-700 transition">
                <Zap size={16} /> Generate
              </button>
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40" />
              <DialogPrimitive.Content className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-xl p-4 flex flex-col">
                <DialogPrimitive.Title asChild>
                  <VisuallyHidden>Generate Workflow</VisuallyHidden>
                </DialogPrimitive.Title>

                {/* Visible header */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold">Generate Workflow</h3>
                  <DialogPrimitive.Close>
                    <X size={18} className="cursor-pointer" />
                  </DialogPrimitive.Close>
                </div>

                {/* Chat-like interface */}
                <ChatInterface
                  onSubmit={(msg) => {
                    generateWorkflow(msg);
                    setChatOpen(false);
                  }}
                />
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        </div>
      </div>

      {/* Output Dialog for workflow execution result */}
      <DialogPrimitive.Root open={isOutputOpen} onOpenChange={setIsOutputOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40" />
          <DialogPrimitive.Content
            className="fixed top-1/2 left-1/2 max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-xl p-4 flex flex-col"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <DialogPrimitive.Title asChild>
              <div className="text-lg font-bold mb-2">
                Workflow Execution Output
              </div>
            </DialogPrimitive.Title>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3">Execution Result</h3>
              <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 border">
                <pre className="text-sm whitespace-pre-wrap text-gray-800">
                  {workflowOutput
                    ? JSON.stringify(workflowOutput, null, 2)
                    : "No output available"}
                </pre>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div
        className="flex-1"
        onDrop={(event) => {
          event.preventDefault();
          const type = event.dataTransfer.getData("application/reactflow");
          const position = { x: event.clientX - 250, y: event.clientY - 50 };
          setNodes((nds) =>
            nds.concat({
              id: `${+new Date()}`,
              type,
              position,
              data: { label: `${type} node` },
            })
          );
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        tabIndex={0}
      >
        <ReactFlow
          nodes={Array.isArray(nodes) ? nodes : []}
          edges={Array.isArray(edges) ? edges : []}
          nodeTypes={nodeTypes}
          onNodesChange={(changes) =>
            setNodes((nds) => applyNodeChanges(changes, nds))
          }
          onEdgesChange={(changes) =>
            setEdges((eds) => applyEdgeChanges(changes, eds))
          }
          onConnect={(connection) =>
            setEdges((eds) =>
              addEdge({ ...connection, type: "smoothstep" }, eds)
            )
          }
          onEdgeClick={onEdgeClick}
          onNodeClick={(_, node) => setSelectedNode(node)} // 👈 NEW
          onPaneClick={clearSelection}
          connectionMode="loose"
          defaultEdgeOptions={{ type: "smoothstep" }}
          fitView
        >
          <Background variant="dots" gap={12} size={2} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

function ChatInterface({ onSubmit }) {
  const [message, setMessage] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <textarea
        className="border rounded-lg p-2 text-sm"
        placeholder="Describe the workflow you want..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={() => onSubmit(message)}
        className="bg-primary text-white py-2 rounded-lg shadow hover:opacity-90"
      >
        Generate
      </button>
    </div>
  );
}
