"use client";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  FileText,
  Table,
  FileSpreadsheet,
  Download,
  Activity,
  Receipt,
  Target,
  PieChart,
} from "lucide-react";
import api from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function ReportsPage() {
  const container = useRef(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { showToast } = useToast();

  useGSAP(() => {
    gsap.from(".report-card, .anim-header", {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });
  }, []);

  // Generic function to handle file downloads via Axios
  const handleDownload = async (
    endpoint: string,
    filename: string,
    type: "csv" | "pdf",
    reportName: string,
  ) => {
    try {
      setDownloading(`${reportName}-${type}`);

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      // Create a Blob from the PDF/CSV Stream
      const blob = new Blob([response.data], {
        type: type === "pdf" ? "application/pdf" : "text/csv",
      });

      // Create a hidden link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      showToast(`${reportName} downloaded successfully!`, "success");
    } catch (error: any) {
      console.error(`Failed to download ${filename}`, error);

      const errorMessage =
        error.response?.data?.message ||
        "Failed to generate report. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      title: "Transactions Report",
      description: "A complete history of your income and expenses.",
      icon: Receipt,
      endpoints: {
        csv: "/userreports/transactions/csv",
        pdf: "/userreports/transactions/pdf",
      },
      filename: "Transactions_Report",
    },
    {
      title: "Budgets Summary",
      description: "Monthly category limits and your spending status.",
      icon: PieChart,
      endpoints: {
        csv: "/userreports/budgets/csv",
        pdf: "/userreports/budgets/pdf",
      },
      filename: "Budgets_Report",
    },
    {
      title: "Goals Progress",
      description: "Track your savings targets and deadlines.",
      icon: Target,
      endpoints: {
        csv: "/userreports/export-goals/csv",
        pdf: "/userreports/export-goals/pdf",
      },
      filename: "Goals_Report",
    },
    {
      title: "Financial Trends",
      description: "Income vs Expense trends over time.",
      icon: Activity,
      endpoints: {
        csv: "/userreports/financial-trends/csv",
        pdf: "/userreports/financial-trends/pdf",
      },
      filename: "Financial_Trends_Report",
    },
  ];

  return (
    <div ref={container} className="space-y-8 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="anim-header">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Data Exports & Reports
        </h2>
        <p className="text-zinc-400 mt-1">
          Download your financial data for offline viewing, tax preparation, or
          business records.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const isDownloadingCSV = downloading === `${report.title}-csv`;
          const isDownloadingPDF = downloading === `${report.title}-pdf`;

          return (
            <div
              key={report.title}
              className="report-card bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative group flex flex-col justify-between"
            >
              <div className="flex items-start gap-4 mb-8">
                <div className="p-4 bg-zinc-800/50 rounded-xl text-blue-500 border border-zinc-700/50">
                  <Icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {report.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {report.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-auto border-t border-zinc-800 pt-4">
                {/* CSV Download Button */}
                <button
                  onClick={() =>
                    handleDownload(
                      report.endpoints.csv,
                      `${report.filename}.csv`,
                      "csv",
                      report.title,
                    )
                  }
                  disabled={isDownloadingCSV || isDownloadingPDF}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloadingCSV ? (
                    <span className="animate-pulse">Exporting...</span>
                  ) : (
                    <>
                      <Table size={18} className="text-green-500" />
                      <span>Export CSV</span>
                    </>
                  )}
                </button>

                {/* PDF Download Button */}
                <button
                  onClick={() =>
                    handleDownload(
                      report.endpoints.pdf,
                      `${report.filename}.pdf`,
                      "pdf",
                      report.title,
                    )
                  }
                  disabled={isDownloadingCSV || isDownloadingPDF}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-600/20 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloadingPDF ? (
                    <span className="animate-pulse">Generating...</span>
                  ) : (
                    <>
                      <FileText size={18} />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
