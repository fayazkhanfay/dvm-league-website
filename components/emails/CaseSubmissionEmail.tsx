import { Body, Button, Container, Head, Html, Hr, Section, Text } from "@react-email/components"

interface CaseSubmissionEmailProps {
  gpName: string
  patientName: string
  caseId: string
  caseLink: string
  // New Fields
  patientSignalment: string
  presentingComplaint: string
  gpQuestions: string
}

export default function CaseSubmissionEmail({
  gpName,
  patientName,
  caseId,
  caseLink,
  patientSignalment,
  presentingComplaint,
  gpQuestions,
}: CaseSubmissionEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>Case Submission Confirmed</Text>

            <Text style={paragraph}>Dear Dr. {gpName},</Text>

            <Text style={paragraph}>
              We have successfully received your case for <strong>{patientName}</strong>. It has been posted to the league and is awaiting specialist review.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Patient:</Text>
              <Text style={infoValue}>{patientName}</Text>

              <Text style={infoLabel}>Signalment:</Text>
              <Text style={infoValue}>{patientSignalment}</Text>

              <Text style={infoLabel}>Presenting Complaint:</Text>
              <Text style={infoValue}>{presentingComplaint}</Text>

              <Text style={infoLabel}>Primary Question:</Text>
              <Text style={infoValue}>{gpQuestions || "No specific questions listed."}</Text>

              <Text style={infoLabel}>Reference ID:</Text>
              <Text style={infoValue}>{caseId.slice(0, 8).toUpperCase()}</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={caseLink}>
                View Case Status
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              DVM League - Specialist Consults on Demand
              <br />
              We will notify you immediately when a specialist claims this case.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// STYLES (Same as Specialist Email)
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
}

const box = {
  padding: "32px",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a2b4b",
  marginBottom: "24px",
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#1a2b4b",
  marginBottom: "16px",
}

const infoBox = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "24px",
}

const infoLabel = {
  fontSize: "14px",
  fontWeight: "bold",
  color: "#6b7280",
  marginBottom: "4px",
  marginTop: "12px",
}

const infoValue = {
  fontSize: "16px",
  color: "#1a2b4b",
  marginTop: "0",
  marginBottom: "0",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#d4af37",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
}

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
}

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "center" as const,
}
