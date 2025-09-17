import FlowCanvas from "@/components/FlowCanvas";
import ImportExportButtons from "@/components/ImportExportButtons";
import NodeConfigPanel from "@/components/NodeConfigPanel";
import NodePalette from "@/components/NodePalette";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex h-screen">
      <NodePalette />
      <div className="flex flex-col flex-1">
        <ImportExportButtons />
        <FlowCanvas />
      </div>
      <NodeConfigPanel />
    </div>
  );
}
