import { Body, Button, Container, Head, Html, Hr, Section, Text } from "@react-email/components"

interface GPCaseUpdateEmailProps {
  gpName: string
  patientName: string
  caseId: string
  caseLink: string
  specialistName: string
}

export default function GPCaseUpdateEmail({
  gpName,
  patientName,
  caseId,
  caseLink,
  specialistName,
}: GPCaseUpdateEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Text style={heading}>Final Report Available</Text>

            <Text style={paragraph}>Dear Dr. {gpName},</Text>

            <Text style={paragraph}>
              Dr. {specialistName} has completed the final report for {patientName}. You can now view the full diagnosis,
              treatment plan, and client summary on your dashboard.
            </Text>

            <Section style={infoBox}>
              <Text style={infoLabel}>Patient:</Text>
              <Text style={infoValue}>{patientName}</Text>

              <Text style={infoLabel}>Specialist:</Text>
              <Text style={infoValue}>Dr. {specialistName}</Text>

              <Text style={infoLabel}>Case ID:</Text>
              <Text style={infoValue}>{caseId.slice(0, 8).toUpperCase()}</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={caseLink}>
                View Final Report
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              DVM League - Specialist Consults on Demand
              <br />
              Questions? Reply to this email
            </Text>
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
