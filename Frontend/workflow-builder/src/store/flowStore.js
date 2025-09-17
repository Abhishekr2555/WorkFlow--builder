import { create } from "zustand";

export const useFlowStore = create((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  setSelectedEdge: (edge) => set({ selectedEdge: edge }),
  clearEdgeSelection: () => set({ selectedEdge: null }),
  deleteSelectedEdge: () =>
    set((state) => {
      if (!state.selectedEdge) return {};
      const id = state.selectedEdge.id;
      const edges = state.edges.filter((e) => e.id !== id);
      return { edges, selectedEdge: null };
    }),
  // Support both direct array sets and functional updates receiving current state
  setNodes: (updater) =>
    set((state) => ({
      nodes:
        typeof updater === "function"
          ? updater(Array.isArray(state.nodes) ? state.nodes : [])
          : Array.isArray(updater)
          ? updater
          : state.nodes,
    })),
  setEdges: (updater) =>
    set((state) => ({
      edges:
        typeof updater === "function"
          ? updater(Array.isArray(state.edges) ? state.edges : [])
          : Array.isArray(updater)
          ? updater
          : state.edges,
    })),
  setFlow: (nodes, edges) => set({ nodes, edges }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  clearSelection: () => set({ selectedNode: null }),
  addNode: (type, position = { x: 100, y: 100 }, data = {}) =>
    set((state) => {
      const id = `${Date.now()}`;
      const newNode = { id, type, position, data };
      return {
        nodes: [...state.nodes, newNode],
        selectedNode: newNode,
      };
    }),
  deleteNode: (id) =>
    set((state) => {
      const nodes = state.nodes.filter((n) => n.id !== id);
      const edges = state.edges.filter(
        (e) => e.source !== id && e.target !== id
      );
      const selectedNode =
        state.selectedNode?.id === id ? null : state.selectedNode;
      return { nodes, edges, selectedNode };
    }),
  deleteSelectedNode: () =>
    set((state) => {
      if (!state.selectedNode) return {};
      const id = state.selectedNode.id;
      const nodes = state.nodes.filter((n) => n.id !== id);
      const edges = state.edges.filter(
        (e) => e.source !== id && e.target !== id
      );
      return { nodes, edges, selectedNode: null };
    }),
  updateNodeConfig: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
      selectedNode:
        state.selectedNode?.id === id
          ? {
              ...state.selectedNode,
              data: { ...state.selectedNode.data, ...data },
            }
          : state.selectedNode,
    })),
}));
