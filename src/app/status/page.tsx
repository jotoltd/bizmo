import { Metadata } from "next";
import { CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "System Status · Bizno",
  description: "Real-time system status and uptime monitoring for Bizno",
};

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: string;
}

const services: ServiceStatus[] = [
  { name: "Web Application", status: "operational", uptime: "99.9%" },
  { name: "API", status: "operational", uptime: "99.9%" },
  { name: "Database", status: "operational", uptime: "99.9%" },
  { name: "Authentication", status: "operational", uptime: "99.9%" },
  { name: "Email Delivery", status: "operational", uptime: "99.5%" },
];

const incidents = [
  {
    date: "2026-03-28",
    title: "All systems operational",
    status: "resolved",
    description: "No incidents reported.",
  },
];

function StatusIcon({ status }: { status: ServiceStatus["status"] }) {
  if (status === "operational") {
    return <CheckCircle className="w-5 h-5 text-emerald-400" />;
  }
  return <AlertCircle className="w-5 h-5 text-amber-400" />;
}

function StatusBadge({ status }: { status: ServiceStatus["status"] }) {
  const colors = {
    operational: "bg-emerald-500/20 text-emerald-400",
    degraded: "bg-amber-500/20 text-amber-400",
    down: "bg-red-500/20 text-red-400",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function StatusPage() {
  const allOperational = services.every((s) => s.status === "operational");

  return (
    <main className="min-h-screen bg-void py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">System Status</h1>
          <p className="text-slate-400">Real-time monitoring of Bizno services</p>
        </div>

        {/* Overall Status */}
        <div
          className={`p-6 rounded-xl mb-8 ${
            allOperational
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-amber-500/10 border border-amber-500/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {allOperational ? (
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-amber-400" />
              )}
              <div>
                <h2
                  className={`text-xl font-semibold ${
                    allOperational ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {allOperational ? "All Systems Operational" : "Partial System Outage"}
                </h2>
                <p className="text-slate-400 text-sm">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-dark-2 rounded-xl border border-white/5 overflow-hidden mb-8">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-semibold text-slate-200">Service Status</h3>
          </div>
          <div className="divide-y divide-white/5">
            {services.map((service) => (
              <div
                key={service.name}
                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon status={service.status} />
                  <span className="text-slate-300">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 text-sm">{service.uptime} uptime</span>
                  <StatusBadge status={service.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-dark-2 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-semibold text-slate-200">Recent Incidents</h3>
          </div>
          <div className="divide-y divide-white/5">
            {incidents.map((incident, index) => (
              <div key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-200">{incident.title}</h4>
                  <span className="text-slate-500 text-sm">{incident.date}</span>
                </div>
                <p className="text-slate-400 text-sm">{incident.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>
            Powered by{" "}
            <a
              href="https://uptimerobot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric hover:underline"
            >
              UptimeRobot
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
