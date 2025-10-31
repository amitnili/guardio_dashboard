import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import mermaid from "mermaid";

export default function FlowDiagram() {
  const navigate = useNavigate();
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      themeVariables: {
        primaryColor: "#3B82F6",
        primaryTextColor: "#1F2937",
        primaryBorderColor: "#60A5FA",
        lineColor: "#6B7280",
        secondaryColor: "#10B981",
        tertiaryColor: "#F59E0B",
        noteBkgColor: "#FEF3C7",
        noteTextColor: "#92400E",
        noteBorderColor: "#F59E0B",
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
        padding: 20,
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
      ValidateFormat -->|No| InlineError[Show Inline Error Message]:::warningNode

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

      classDef entryNode fill:#DBEAFE,stroke:#3B82F6,stroke-width:3px,color:#1E40AF
      classDef successNode fill:#D1FAE5,stroke:#10B981,stroke-width:3px,color:#065F46
      classDef errorNode fill:#FEE2E2,stroke:#EF4444,stroke-width:3px,color:#991B1B
      classDef warningNode fill:#FED7AA,stroke:#F59E0B,stroke-width:3px,color:#92400E
      classDef infoNode fill:#DBEAFE,stroke:#3B82F6,stroke-width:2px,color:#1E40AF
      classDef normalNode fill:#F3F4F6,stroke:#9CA3AF,stroke-width:2px,color:#374151
      classDef decisionNode fill:#FEF3C7,stroke:#F59E0B,stroke-width:2px,color:#92400E
  `;

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">
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
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <CardTitle className="text-xl font-semibold text-gray-900">
              User Flow Diagram
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Visual representation of all user states, validation checks, and skip logic. Users can skip phone entry twice before continuing without verification.
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-white rounded-lg">
              <div
                ref={mermaidRef}
                className="mermaid"
                style={{ textAlign: "center" }}
              >
                {flowchartDefinition}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Legend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500" />
                <span className="text-sm text-gray-700">Entry Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-500" />
                <span className="text-sm text-gray-700">Success State</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-500" />
                <span className="text-sm text-gray-700">Error State</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-500" />
                <span className="text-sm text-gray-700">Warning / Conflict</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-400" />
                <span className="text-sm text-gray-700">Normal State</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-yellow-50 border-2 border-yellow-500" />
                <span className="text-sm text-gray-700">Decision Point</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-50 border-2 border-blue-400" />
                <span className="text-sm text-gray-700">Informational</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>
            Last updated: {new Date().toLocaleDateString()} • For internal review and stakeholder presentation
          </p>
        </div>
      </div>
    </div>
  );
}
