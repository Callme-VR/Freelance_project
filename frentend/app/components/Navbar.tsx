"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Plus, LayoutDashboard, UploadCloud, History } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Roster", icon: UploadCloud },
  { href: "/batches", label: "History", icon: History },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--bg-base)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "var(--radius-sm)",
              background: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#080c16",
            }}
          >
            <Award size={18} strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Cert<span style={{ color: "var(--gold)" }}>Gen</span>
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-muted)",
              marginLeft: 4,
              paddingLeft: 8,
              borderLeft: "1px solid var(--border)",
            }}
          >
            Console
          </span>
        </Link>

        {/* Nav Links */}
        <nav style={{ display: "flex", gap: 4 }}>
          {links.map((l) => {
            const active = path === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  background: active ? "var(--bg-surface)" : "transparent",
                  border: `1px solid ${active ? "var(--border)" : "transparent"}`,
                  transition: "background-color 0.12s ease-out, border-color 0.12s ease-out, color 0.12s ease-out",
                }}
              >
                <Icon size={14} style={{ color: active ? "var(--gold)" : "var(--text-muted)" }} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Action */}
        <Link href="/upload" className="btn btn-primary" style={{ padding: "6px 14px", minHeight: 34 }}>
          <Plus size={14} strokeWidth={2.5} />
          New Batch
        </Link>
      </div>
    </header>
  );
}
