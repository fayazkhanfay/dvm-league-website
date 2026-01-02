import { Card } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertCircle, ClipboardList } from "lucide-react"

interface ClinicalHistoryProps {
  presenting_complaint: string
  brief_history: string
  pe_findings: string
  medications: string
  diagnostics_performed: string | null
  treatments_attempted: string | null
  gp_questions: string
  created_at: string
}

export function ClinicalHistory({
  presenting_complaint,
  brief_history,
  pe_findings,
  medications,
  diagnostics_performed,
  treatments_attempted,
  gp_questions,
  created_at,
}: ClinicalHistoryProps) {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900 font-bold text-lg">Primary Question</AlertTitle>
        <AlertDescription>
          <p className="text-blue-800 text-base font-medium whitespace-pre-wrap mt-2">{gp_questions}</p>
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Full Medical Record</h3>
        </div>

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base font-semibold">Clinical Information</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Presenting Complaint</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{presenting_complaint}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-1">Brief History</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{brief_history}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-1">Physical Exam Findings</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{pe_findings}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-1">Current Medications</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{medications}</p>
                </div>

                {diagnostics_performed && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Diagnostics Performed</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{diagnostics_performed}</p>
                  </div>
                )}

                {treatments_attempted && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Treatments Attempted</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{treatments_attempted}</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  )
}
