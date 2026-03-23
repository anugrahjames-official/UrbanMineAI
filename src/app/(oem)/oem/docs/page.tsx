import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Download, Filter, FileText, Verified, AlertCircle, Link as LinkIcon, ChevronLeft, ChevronRight, UploadCloud, Lock } from "lucide-react";
import { getComplianceDocs } from "@/app/actions/oem";
import { format } from "date-fns";
import { CopyHash } from "@/components/ui/copy-hash"; // We will create this or inline it. Let's inline a simple version or use client component wrapping the hash.

// Let's create a small inline client component for the hash copy
import ClientHashBadge from "./ClientHashBadge"; 

export default async function ComplianceVaultPage() {
  const docs = await getComplianceDocs() as any[];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5 z-0" style={{ backgroundImage: 'radial-gradient(#19e66b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Header */}
      <header className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <nav className="flex text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-white">Compliance Vault</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-white">Document Repository</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="gap-2 border-white/5 bg-surface-dark h-11">
            <UploadCloud size={18} /> Upload Document
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Compliance Score" value="98%" icon={<Verified size={24} className="text-primary" />} />
        <StatCard title="Total Documents" value={docs.length.toString()} icon={<FileText size={24} className="text-blue-400" />} />
        <StatCard title="Pending Review" value="0" icon={<AlertCircle size={24} className="text-warning" />} />
      </div>

      {/* Filters & Actions */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            className="w-full bg-surface-dark border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary placeholder:text-gray-600"
            placeholder="Search by ID, name or hash..."
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select className="bg-surface-dark border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-400 focus:ring-1 focus:ring-primary cursor-pointer hover:text-white transition-colors">
            <option>All Types</option>
            <option>Form-6</option>
            <option>EPR Certificate</option>
          </select>
          <Button variant="secondary" size="icon" className="h-11 w-11 border-white/5 bg-surface-dark"><Filter size={18} /></Button>
          <Button variant="secondary" className="gap-2 border-white/5 bg-surface-dark h-11 hidden sm:flex">
            <Download size={18} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Documents Table */}
      <Card className="relative z-10 p-0 border-white/5 overflow-hidden shadow-2xl bg-surface-darker/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-widest border-b border-white/5">
              <tr>
                <th className="px-6 py-5">Document Name</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Date Generated</th>
                <th className="px-6 py-5">Blockchain Hash</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {docs.length > 0 ? (
                docs.map((doc) => {
                  const d = new Date(doc.created_at);
                  return (
                    <DocRow
                      key={doc.id}
                      name={`${doc.doc_type || 'Form-6'} Submission`}
                      id={`UM-${doc.id.substring(0, 8)}`}
                      type={doc.doc_type || "Govt Compliance"}
                      date={format(d, "MMM dd, yyyy")}
                      time={format(d, "HH:mm a")}
                      hash={doc.hash ? `${doc.hash.substring(0, 8)}...${doc.hash.slice(-4)}` : "Pending"}
                      fullHash={doc.hash}
                      status="verified"
                      pdfUrl={doc.pdf_url}
                    />
                  );
                })
              ) : (
                <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No compliance documents found yet.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - static for now */}
        {docs.length > 0 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/5">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Showing <span className="text-white">1</span> to <span className="text-white">{docs.length}</span> of <span className="text-white">{docs.length}</span> results
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg border-white/5"><ChevronLeft size={14} /></Button>
              <Button variant="secondary" size="sm" className="h-8 rounded-lg border-primary/30 bg-primary/10 text-primary font-bold px-3">1</Button>
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg border-white/5"><ChevronRight size={14} /></Button>
            </div>
          </div>
        )}
      </Card>

      {/* Security Footer */}
      <div className="relative z-10 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest pt-4">
        <Lock size={12} className="text-primary" />
        <span>All documents are cryptographically secured on the UrbanChain Ledger.</span>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="flex items-center gap-5 border-white/5 hover:border-primary/20 transition-all group bg-surface-dark/80 backdrop-blur-md">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/5 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{value}</p>
      </div>
    </Card>
  );
}

function DocRow({
  name,
  id,
  type,
  date,
  time,
  hash,
  fullHash,
  status,
  pdfUrl
}: {
  name: string;
  id: string;
  type: string;
  date: string;
  time: string;
  hash: string;
  fullHash: string;
  status: "verified" | "pending";
  pdfUrl?: string;
}) {
  return (
    <tr className="hover:bg-white/5 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-error/10 flex items-center justify-center text-error border border-error/20">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-bold text-white group-hover:text-primary transition-colors">{name}</p>
            <p className="text-[10px] text-gray-500 font-medium">ID: {id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2.5 py-1 rounded-md bg-white/5 text-[10px] font-bold text-gray-400 border border-white/5">
          {type}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-white font-medium">{date}</p>
        <p className="text-[10px] text-gray-500">{time}</p>
      </td>
      <td className="px-6 py-4">
        <ClientHashBadge shortHash={hash} fullHash={fullHash} />
      </td>
      <td className="px-6 py-4 text-center">
        <StatusBadge variant={status === 'verified' ? 'success' : 'warning'}>
          {status}
        </StatusBadge>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {pdfUrl ? (
             <a href={pdfUrl} target="_blank" rel="noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-500 hover:text-primary transition-colors"
                  title="Download Document"
                >
                  <Download size={18} />
                </Button>
             </a>
          ) : (
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="h-9 w-9 text-gray-500 opacity-50 transition-colors"
              >
                <Download size={18} />
              </Button>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-primary transition-colors">
            <LinkIcon size={18} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
