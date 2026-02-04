/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Standard "Medical Record" styling


const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 11,
        lineHeight: 1.5,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#111827', // DVM Black
        paddingBottom: 10,
    },
    headerLeft: {
        flexDirection: 'column',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    subLogoText: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
    },
    headerRight: {
        textAlign: 'right',
        fontSize: 10,
        color: '#666',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
        textTransform: 'uppercase',
        backgroundColor: '#f3f4f6',
        padding: 4,
    },
    textBlock: {
        textAlign: 'justify',
        paddingLeft: 4,
    },
    metaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 10,
    },
    metaColumn: {
        width: '50%',
        flexDirection: 'column',
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        width: 80,
        fontSize: 10,
        color: '#555',
    },
    value: {
        fontSize: 10,
        color: '#000',
    },
});

interface ReportData {
    patientName: string;
    caseId: string;
    specialistName: string;
    date: string;
    finalDiagnosis: string;
    clinicalInterpretation: string;
    treatmentPlan: string;
    followUp: string;
    clientSummary: string;
}

export const FinalReportPDF = ({ data }: { data: ReportData }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.logoText}>DVM LEAGUE</Text>
                    <Text style={styles.subLogoText}>American Specialists. American Standards.</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text>Case ID: {data.caseId.slice(0, 8)}</Text>
                    <Text>Date: {data.date}</Text>
                    <Text>Specialist: {data.specialistName}</Text>
                </View>
            </View>

            {/* Signalment */}
            <View style={styles.metaGrid}>
                <View style={styles.metaColumn}>
                    <View style={styles.metaRow}>
                        <Text style={styles.label}>Patient Name:</Text>
                        <Text style={styles.value}>{data.patientName}</Text>
                    </View>
                </View>
                <View style={styles.metaColumn}>
                    <View style={styles.metaRow}>
                        <Text style={styles.label}>Consult Type:</Text>
                        <Text style={styles.value}>Complete Case Consult</Text>
                    </View>
                </View>
            </View>

            {/* Clinical Sections */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Final Diagnosis</Text>
                <Text style={styles.textBlock}>{data.finalDiagnosis || 'Pending'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Clinical Interpretation</Text>
                <Text style={styles.textBlock}>{data.clinicalInterpretation || 'Pending'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Treatment Plan</Text>
                <Text style={styles.textBlock}>{data.treatmentPlan || 'Pending'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Follow-Up Recommendations</Text>
                <Text style={styles.textBlock}>{data.followUp || 'Pending'}</Text>
            </View>

            {/* Footer / Client Summary */}
            <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionTitle}>Client-Friendly Summary</Text>
                <Text style={{ ...styles.textBlock, fontStyle: 'italic', color: '#4b5563' }}>
                    {data.clientSummary || 'Pending'}
                </Text>
            </View>

        </Page>
    </Document>
);
