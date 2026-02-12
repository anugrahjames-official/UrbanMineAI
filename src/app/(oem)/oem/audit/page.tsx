"use client";

import { getComplianceLogs } from "@/app/actions/oem";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function OemAuditPage() {
  const logs = await getComplianceLogs();

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Audit Logs</h1>
        <p className="text-sm text-gray-400">Recent compliance events and transaction trails.</p>
      </header>

      <div className="space-y-3">
        {logs.length > 0 ? (
          logs.map((log) => (
            <Card key={log.id} className="border-white/5 flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${log.status === 'verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                  {log.status === 'verified' ? <CheckCircle size={18} /> : <Clock size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Batch from {(log.supplier as any)?.email || 'Unknown Supplier'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {formatDistanceToNow(new Date(log.created_at))} ago • ID: {log.id.substring(0, 8)}
                  </p>
                </div>
              </div>
              <StatusBadge variant={log.status === 'verified' ? 'success' : 'warning'}>
                {log.status}
              </StatusBadge>
            </Card>
          ))
        ) : (
          <Card className="border-white/5 py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Clock size={20} className="text-gray-500" />
            </div>
            <p className="text-white font-medium">No audit logs found</p>
            <p className="text-sm text-gray-500">Compliance events will be recorded here.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
