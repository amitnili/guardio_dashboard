import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import mermaid from "mermaid";

export default function FlowDiagram() {
  const navigate = useNavigate();
  const mermaidRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom and Pan state - 100% = readable baseline
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      themeVariables: {
        primaryColor: "#3B82F6",
        primaryTextColor: "#111827",
        primaryBorderColor: "#60A5FA",
        lineColor: "#6B7280",
        secondaryColor: "#10B981",
        tertiaryColor: "#F59E0B",
        noteBkgColor: "#FEF3C7",
        noteTextColor: "#92400E",
        noteBorderColor: "#F59E0B",
        fontSize: "18px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      },
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: "basis",
        padding: 40,
        nodeSpacing: 100,
        rankSpacing: 110,
        wrappingWidth: 350,
      },
    });

    if (mermaidRef.current) {
      mermaid.contentLoaded();
    }
  }, []);

  const flowchartDefinition = `
    flowchart TD
      Start([User Lands on Phone Collection Page]):::entryNode

      Start --> UserChoice{User Action}:::decisionNode

      UserChoice -->|Enter Phone Number| InputPhone[User Enters Phone Number]:::normalNode
      UserChoice -->|Skip| FirstSkip[First Skip - Show Prompt]:::infoNode

      InputPhone --> ValidateFormat{Valid Format?}:::decisionNode

      ValidateFormat -->|Yes| SubmitToServer[Submit to Server]:::normalNode
      ValidateFormat -->|No| InlineError[Show error: Incorrect Phone, try again]:::warningNode

      InlineError --> InputPhone

      SubmitToServer --> ServerValidation{Server Validation}:::decisionNode

      ServerValidation -->|Success| CheckExisting{Number Already Exists?}:::decisionNode
      ServerValidation -->|Network Error| NetworkError[Show: Temporary Issue - Please Try Again]:::errorNode
      ServerValidation -->|Timeout| TimeoutError[Show: Request Timed Out]:::errorNode
      ServerValidation -->|500 Error| ServerError[Show: Server Error - Please Try Again]:::errorNode

      CheckExisting -->|No - New Number| Success[Validation Success ✓]:::successNode
      CheckExisting -->|Yes - Duplicate| Conflict[Show: Number Already Registered]:::warningNode

      Conflict --> OfferLogin[Suggest: Login Instead?]:::normalNode
      OfferLogin -->|User Clicks Login| RedirectLogin[Redirect to Login]:::normalNode
      OfferLogin -->|User Retries| InputPhone

      NetworkError --> RetryOption{User Action}:::decisionNode
      TimeoutError --> RetryOption
      ServerError --> RetryOption

      RetryOption -->|Retry| SubmitToServer
      RetryOption -->|Cancel| Abort[User Aborts Process]:::errorNode

      Success --> NextPage[Proceed to Next Page]:::successNode

      FirstSkip --> SecondChoice{User Action on Prompt}:::decisionNode
      SecondChoice -->|Enter Phone Number| InputPhone
      SecondChoice -->|Skip Again| SecondSkip[Second Skip Detected]:::infoNode

      SecondSkip --> ContinueWithout[Continue Onboarding Without Phone]:::infoNode
      ContinueWithout --> NextPage

      NextPage --> Activation([User Activation Complete]):::successNode

      Abort --> End([Session Ended]):::errorNode
      RedirectLogin --> End

      classDef entryNode fill:#DBEAFE,stroke:#3B82F6,stroke-width:3px,color:#1E40AF,font-weight:600
      classDef successNode fill:#D1FAE5,stroke:#10B981,stroke-width:3px,color:#065F46,font-weight:600
      classDef errorNode fill:#FEE2E2,stroke:#EF4444,stroke-width:3px,color:#991B1B,font-weight:600
      classDef warningNode fill:#FED7AA,stroke:#F59E0B,stroke-width:3px,color:#92400E,font-weight:600
      classDef infoNode fill:#DBEAFE,stroke:#3B82F6,stroke-width:2px,color:#1E40AF,font-weight:600
      classDef normalNode fill:#F3F4F6,stroke:#9CA3AF,stroke-width:2px,color:#374151,font-weight:600
      classDef decisionNode fill:#FEF3C7,stroke:#F59E0B,stroke-width:2px,color:#92400E,font-weight:600
  `;

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  // Pan/Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <>
      <style>{`
        /* Optimized Mermaid Diagram - 100% = Readable Baseline */
        .mermaid {
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          text-rendering: optimizeLegibility !important;
        }

        .mermaid svg {
          max-width: none !important;
          height: auto !important;
          shape-rendering: geometricPrecision !important;
        }

        .mermaid .edgeLabel {
          background-color: transparent !important;
          padding: 6px 10px !important;
          border-radius: 4px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #222222 !important;
          box-shadow: none !important;
          border: none !important;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.9),
                       0 0 4px rgba(255, 255, 255, 0.8) !important;
          white-space: nowrap !important;
        }

        .mermaid .edgePath path {
          stroke-width: 2.5px !important;
          vector-effect: non-scaling-stroke !important;
        }

        .mermaid .node rect,
        .mermaid .node circle,
        .mermaid .node polygon {
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.12));
          rx: 10px !important;
          ry: 10px !important;
        }

        .mermaid .label {
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #111827 !important;
          -webkit-font-smoothing: antialiased !important;
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }

        .mermaid .nodeLabel {
          padding: 12px 16px !important;
          line-height: 1.6 !important;
          max-width: 350px !important;
        }

        .mermaid .cluster rect {
          rx: 10px !important;
          ry: 10px !important;
        }

        /* Ensure nodes expand to fit text */
        .mermaid .node {
          min-width: fit-content !important;
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
              Complete user journey and validation states
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

        {/* Flow Diagram Card */}
        <Card className="shadow-sm border-gray-200 relative">
          {/* Zoom Controls - Fixed Top Right */}
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-white border border-gray-300 rounded-lg shadow-lg px-3 py-2">
            <button
              onClick={handleFitToScreen}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
              title="Fit to Screen"
            >
              <Maximize2 className="w-4 h-4 text-gray-700" />
            </button>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Reset View"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
            >
              <Plus className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <CardTitle className="text-xl font-semibold text-gray-900">
              User Flow Diagram
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div
              ref={containerRef}
              className="bg-white rounded-lg overflow-hidden relative"
              style={{
                height: "calc(100vh - 280px)",
                minHeight: "800px",
                cursor: isDragging ? "grabbing" : "grab",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                  transformOrigin: "top center",
                  transition: isDragging ? "none" : "transform 0.2s ease-out",
                  width: "100%",
                  minHeight: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  paddingTop: "30px",
                }}
              >
                <div
                  ref={mermaidRef}
                  className="mermaid"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  {flowchartDefinition}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
