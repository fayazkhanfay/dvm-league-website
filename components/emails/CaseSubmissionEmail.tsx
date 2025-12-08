import { Body, Button, Container, Head, Html, Hr, Section, Text } from "@react-email/components"

interface CaseSubmissionEmailProps {
  gpName: string
  patientName: string
  caseId: string
  caseLink: string
}

export default function CaseSubmissionEmail({ gpName, patientName, caseId, caseLink }: CaseSubmissionEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>Case Confirmation</Text>

            <Text style={paragraph}>Dear Dr. {gpName},</Text>

            <Text style={paragraph}>
              We have successfully received your case for <strong>{patientName}</strong>.
            </Text>

            <Text style={paragraph}>
              Reference ID: <strong>{caseId}</strong>
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={caseLink}>
                View Case Status
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>DVM League - Specialist Consults on Demand</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

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
