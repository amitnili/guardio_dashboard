import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom Node Component with flowchart shapes
function CustomNode({ data }: { data: { label: string; nodeType: string; flowchartShape?: string } }) {
  const nodeStyles: Record<string, { bg: string; border: string; text: string }> = {
    entry: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" },
    success: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
    error: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
    warning: { bg: "#FED7AA", border: "#F59E0B", text: "#92400E" },
    info: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" },
    normal: { bg: "#F3F4F6", border: "#9CA3AF", text: "#374151" },
    decision: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
    retry: { bg: "#BFDBFE", border: "#2563EB", text: "#1E3A8A" },
    fallback: { bg: "#E9D5FF", border: "#9333EA", text: "#581C87" },
    uxFallback: { bg: "#BBF7D0", border: "#16A34A", text: "#14532D" },
  };

  const style = nodeStyles[data.nodeType] || nodeStyles.normal;
  const shape = data.flowchartShape || "rectangle";

  // Diamond shape for decisions
  if (shape === "diamond") {
    return (
      <div style={{ position: "relative", width: "180px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
        <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
        <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
        <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
        <svg width="180" height="120" style={{ position: "absolute", top: 0, left: 0 }}>
          <polygon
            points="90,5 175,60 90,115 5,60"
            fill={style.bg}
            stroke={style.border}
            strokeWidth="3"
            filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
          />
        </svg>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            color: style.text,
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "1.4",
            textAlign: "center",
            padding: "0 20px",
            maxWidth: "140px",
            wordWrap: "break-word",
          }}
        >
          {data.label}
        </div>
      </div>
    );
  }

  // Oval shape for start/end
  if (shape === "oval") {
    return (
      <div
        style={{
          background: style.bg,
          border: `3px solid ${style.border}`,
          borderRadius: "50px",
          padding: "14px 24px",
          minWidth: "180px",
          maxWidth: "300px",
          color: style.text,
          fontWeight: 600,
          fontSize: "14px",
          lineHeight: "1.4",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          wordWrap: "break-word",
          position: "relative",
        }}
      >
        <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
        <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
        <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
        <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
        {data.label}
      </div>
    );
  }

  // Parallelogram shape for user inputs
  if (shape === "parallelogram") {
    return (
      <div style={{ position: "relative", width: "220px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
        <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
        <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
        <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
        <svg width="220" height="80" style={{ position: "absolute", top: 0, left: 0 }}>
          <polygon
            points="20,5 210,5 200,75 10,75"
            fill={style.bg}
            stroke={style.border}
            strokeWidth="3"
            filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
          />
        </svg>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            color: style.text,
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "1.4",
            textAlign: "center",
            padding: "0 20px",
            maxWidth: "180px",
            wordWrap: "break-word",
          }}
        >
          {data.label}
        </div>
      </div>
    );
  }

  // Rectangle shape for actions (default)
  return (
    <div
      style={{
        background: style.bg,
        border: `3px solid ${style.border}`,
        borderRadius: "6px",
        padding: "12px 16px",
        minWidth: "160px",
        maxWidth: "280px",
        color: style.text,
        fontWeight: 600,
        fontSize: "14px",
        lineHeight: "1.4",
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordWrap: "break-word",
        position: "relative",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
      {data.label}
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export default function FlowDiagram() {
  const navigate = useNavigate();

  // Define all nodes with increased spacing and perfect alignment
  const initialNodes: Node[] = [
    // Start
    { id: "start", type: "custom", position: { x: 600, y: 60 }, data: { label: "User Lands on Phone Collection Page", nodeType: "entry", flowchartShape: "oval" } },

    // User decides to enter phone or skip
    { id: "userChoice", type: "custom", position: { x: 600, y: 280 }, data: { label: "User Action", nodeType: "decision", flowchartShape: "diamond" } },

    // Main phone entry path
    { id: "inputPhone", type: "custom", position: { x: 400, y: 500 }, data: { label: "User Enters Phone Number", nodeType: "normal", flowchartShape: "parallelogram" } },

    // Format validation
    { id: "validateFormat", type: "custom", position: { x: 400, y: 700 }, data: { label: "Valid Format?", nodeType: "decision", flowchartShape: "diamond" } },

    // Format error - retry entry
    { id: "inlineError", type: "custom", position: { x: 150, y: 700 }, data: { label: "Show Error: Invalid Format", nodeType: "warning", flowchartShape: "rectangle" } },

    // Submit to server
    { id: "submitToServer", type: "custom", position: { x: 400, y: 900 }, data: { label: "Submit to Server", nodeType: "normal", flowchartShape: "rectangle" } },

    // Validation result
    { id: "validationResult", type: "custom", position: { x: 400, y: 1100 }, data: { label: "Validation Successful?", nodeType: "decision", flowchartShape: "diamond" } },

    // Error - offer retry
    { id: "retryOption", type: "custom", position: { x: 650, y: 1100 }, data: { label: "Show Error - Retry?", nodeType: "error", flowchartShape: "rectangle" } },

    // Success
    { id: "success", type: "custom", position: { x: 400, y: 1300 }, data: { label: "Phone Validated Successfully ✓", nodeType: "success", flowchartShape: "rectangle" } },

    // Skip path - first skip
    { id: "firstSkip", type: "custom", position: { x: 850, y: 500 }, data: { label: "Skip - Show Prompt", nodeType: "info", flowchartShape: "rectangle" } },

    // Second chance decision
    { id: "secondChoice", type: "custom", position: { x: 850, y: 700 }, data: { label: "Skip Again or Enter?", nodeType: "decision", flowchartShape: "diamond" } },

    // Continue without phone
    { id: "continueWithout", type: "custom", position: { x: 850, y: 900 }, data: { label: "Continue Without Phone", nodeType: "info", flowchartShape: "rectangle" } },

    // Next page (convergence point)
    { id: "nextPage", type: "custom", position: { x: 600, y: 1500 }, data: { label: "Proceed to Next Page", nodeType: "success", flowchartShape: "rectangle" } },

    // Activation complete
    { id: "activation", type: "custom", position: { x: 600, y: 1700 }, data: { label: "User Activation Complete", nodeType: "success", flowchartShape: "oval" } },
  ];

  // Define simplified edges - only core flow connections
  const initialEdges: Edge[] = [
    // Main flow
    { id: "e1", source: "start", target: "userChoice", type: "straight", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },

    // User decision branches
    { id: "e2", source: "userChoice", target: "inputPhone", label: "Enter Phone", type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e3", source: "userChoice", target: "firstSkip", label: "Skip", type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },

    // Phone validation path
    { id: "e4", source: "inputPhone", target: "validateFormat", type: "straight", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e5", source: "validateFormat", target: "inlineError", label: "Invalid", type: "straight", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e6", source: "validateFormat", target: "submitToServer", label: "Valid", type: "straight", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e7", source: "inlineError", target: "inputPhone", animated: true, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },

    // Server validation
    { id: "e8", source: "submitToServer", target: "validationResult", type: "straight", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e9", source: "validationResult", target: "success", label: "Success", type: "straight", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e10", source: "validationResult", target: "retryOption", label: "Error", type: "straight", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e11", source: "retryOption", target: "submitToServer", animated: true, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e12", source: "success", target: "nextPage", type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },

    // Skip path
    { id: "e13", source: "firstSkip", target: "secondChoice", type: "straight", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e14", source: "secondChoice", target: "inputPhone", label: "Enter", animated: true, type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e15", source: "secondChoice", target: "continueWithout", label: "Skip", type: "straight", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
    { id: "e16", source: "continueWithout", target: "nextPage", type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },

    // Final step
    { id: "e17", source: "nextPage", target: "activation", type: "straight", markerEnd: { type: MarkerType.ArrowClosed, color: '#000000' }, style: { stroke: '#000000', strokeWidth: 3 } },
  ];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Debug logging
  console.log('=== FLOW DIAGRAM DEBUG ===');
  console.log('Total nodes:', nodes.length);
  console.log('Total edges:', edges.length);
  console.log('First 3 edges:', edges.slice(0, 3));

  const nodeConnections = nodes.map((node: Node) => {
    const incoming = edges.filter((e: Edge) => e.target === node.id).length;
    const outgoing = edges.filter((e: Edge) => e.source === node.id).length;
    return { id: node.id, incoming, outgoing, total: incoming + outgoing };
  });

  const disconnected = nodeConnections.filter((nc: { id: string; incoming: number; outgoing: number; total: number }) => nc.total === 0);
  console.log('Disconnected nodes:', disconnected.length > 0 ? disconnected : 'NONE - ALL CONNECTED ✓');

  return (
    <>
      <style>{`
        /* FORCE ARROW VISIBILITY */
        .react-flow__edge-path {
          stroke: #000000 !important;
          stroke-width: 3px !important;
        }

        .react-flow__edge {
          pointer-events: all !important;
        }

        .react-flow__handle {
          width: 8px !important;
          height: 8px !important;
          background: #555 !important;
          border: 2px solid white !important;
        }

        marker {
          overflow: visible !important;
        }

        marker path {
          fill: #000000 !important;
          stroke: #000000 !important;
        }

        .react-flow__arrowhead {
          fill: #000000 !important;
        }

        .react-flow__arrowhead path {
          fill: #000000 !important;
          stroke: #000000 !important;
        }

        .react-flow__edge-text {
          font-size: 12px;
          font-weight: 700;
          fill: #1F2937;
        }

        .react-flow__edge-textbg {
          fill: white;
          fill-opacity: 0.9;
        }

        .react-flow__attribution {
          display: none;
        }
      `}</style>
      <div className="min-h-screen bg-[#F9FAFB] p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Guardio – Phone Number Collection Flow
              </h1>
              <p className="text-gray-600 mt-1">
                Complete user journey with {edges.length} connections between {nodes.length} steps
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Flow Diagram Legend */}
          <Card className="shadow-sm border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-blue-100 border-2 border-blue-500 rounded-full flex items-center justify-center text-xs font-semibold">Oval</div>
                  <span className="text-gray-700">Start/End</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-yellow-100 border-2 border-yellow-600" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}></div>
                  <span className="text-gray-700">Decision</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-gray-100 border-2 border-gray-500 rounded flex items-center justify-center text-xs font-semibold">Box</div>
                  <span className="text-gray-700">Action</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-8 bg-gray-100 border-2 border-gray-500" style={{ clipPath: "polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)" }}></div>
                  <span className="text-gray-700">Input</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-black"></div>
                    <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-black border-b-4 border-b-transparent"></div>
                  </div>
                  <span className="text-gray-700 font-bold">Connection Arrow</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flow Diagram Card */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="text-xl font-semibold text-gray-900">
                User Flow Diagram - Core User Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div style={{ height: "900px", width: "100%" }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.2, minZoom: 0.4, maxZoom: 1.0 }}
                  minZoom={0.3}
                  maxZoom={1.5}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  panOnDrag={true}
                  zoomOnScroll={true}
                  zoomOnPinch={true}
                  defaultEdgeOptions={{
                    type: 'straight',
                    animated: false,
                    style: {
                      stroke: '#000000',
                      strokeWidth: 3,
                    },
                    markerEnd: {
                      type: MarkerType.ArrowClosed,
                      color: '#000000',
                      width: 20,
                      height: 20,
                    },
                  }}
                >
                  <Background color="#e5e7eb" gap={16} />
                  <MiniMap
                    nodeColor={(node: Node) => {
                      const nodeType = node.data.nodeType;
                      const colorMap: Record<string, string> = {
                        entry: "#3B82F6",
                        success: "#10B981",
                        error: "#EF4444",
                        warning: "#F59E0B",
                        info: "#3B82F6",
                        normal: "#9CA3AF",
                        decision: "#F59E0B",
                        retry: "#2563EB",
                        fallback: "#9333EA",
                        uxFallback: "#16A34A",
                      };
                      return colorMap[nodeType as string] || "#9CA3AF";
                    }}
                    position="bottom-right"
                  />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
