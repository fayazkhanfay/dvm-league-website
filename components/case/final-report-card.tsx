import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, FileText, Calendar, Paperclip, FileIcon, Download } from "lucide-react"

interface FinalReportCardProps {
    reportUrl: string
    specialistName: string
    submittedAt: string
    attachments?: any[]
}

export function FinalReportCard({ reportUrl, specialistName, submittedAt, attachments = [] }: FinalReportCardProps) {
    return (
        <Card className="mb-6 p-0 overflow-hidden border-2 border-brand-gold/50 shadow-md">
            {/* Header */}
            <div className="bg-brand-navy p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-brand-gold" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide">
                        Official Final Report / Medical Record
                    </h3>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 bg-white space-y-4">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-brand-gold/10 rounded-full">
                        <FileText className="h-6 w-6 text-brand-navy" />
                    </div>

                    <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-brand-navy text-lg">
                            Final Veterinary Specialist Report
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500">
                            <span>Specialist: {specialistName}</span>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Submitted: {submittedAt}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Button
                            className="w-full sm:w-auto bg-brand-navy hover:bg-brand-navy/90 text-white font-medium"
                            onClick={() => window.open(reportUrl, '_blank')}
                        >
                            <ShieldCheck className="mr-2 h-4 w-4 text-brand-gold" />
                            View Secure Record
                        </Button>
                        <p className="text-xs text-gray-400 sm:mt-0">
                            This document is a permanent medical record protected by secure signed access.
                        </p>
                    </div>

                    {/* Supporting Evidence Section */}
                    {attachments && attachments.length > 0 && (
                        <div className="border-t border-brand-navy/10 mt-6 pt-4">
                            <h4 className="text-xs font-bold text-brand-navy/70 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Paperclip className="h-3 w-3" />
                                Supporting Evidence & Labs
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {attachments.map((file) => (
                                    <a
                                        key={file.id}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-white rounded-md border border-brand-stone hover:border-brand-gold hover:shadow-sm transition-all group"
                                    >
                                        <div className="p-2 bg-brand-offwhite rounded-md group-hover:bg-brand-gold/10">
                                            <FileIcon className="h-5 w-5 text-brand-navy/70" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium text-brand-navy truncate">
                                                {file.file_name}
                                            </p>
                                            <p className="text-xs text-brand-navy/50 flex items-center gap-1">
                                                <Download className="h-3 w-3" /> Download
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
