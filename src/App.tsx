/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

interface FailingEndpoint {
  url: string;
  method?: string;
  status?: number;
  count: number;
  impact?: string;
}

interface ActivityEvent {
  timestamp: string;
  message: string;
  level: string;
}

interface AnalyzerStats {
  system_health: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  total_requests: number;
  status_2xx: number;
  status_4xx: number;
  status_5xx: number;
  error_rate_percent: number;
  five_xx_rate_percent: number;
  p50_ms: number;
  p95_ms: number;
  top_failing_url: string;
  failing_endpoints: FailingEndpoint[];
  recent_activity: ActivityEvent[];
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<AnalyzerStats | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isBrokenDrill, setIsBrokenDrill] = useState(false);

  // Fetch /api/stats immediately with zero loading animations
  const loadStats = async (simulateFailure: boolean) => {
    if (simulateFailure) {
      setStats(null);
      setFetchError('HTTP 502 Bad Gateway: Upstream FastAPI process terminated. Nginx cannot reach 127.0.0.1:8000.');
      return;
    }

    try {
      const res = await fetch('/api/stats');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to reach /api/stats from upstream`);
      }
      const data: AnalyzerStats = await res.json();
      setStats(data);
      setFetchError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network failure';
      setFetchError(msg);
      setStats(null);
    }
  };

  useEffect(() => {
    loadStats(isBrokenDrill);
    const timer = setInterval(() => {
      loadStats(isBrokenDrill);
    }, 8000);
    return () => clearInterval(timer);
  }, [isBrokenDrill]);

  // Derive system health indicator based on real metrics
  const getDerivedHealth = (): { label: 'HEALTHY' | 'WARNING' | 'CRITICAL'; colorBg: string; colorText: string; border: string } => {
    if (fetchError || isBrokenDrill) {
      return { label: 'CRITICAL', colorBg: 'bg-red-950', colorText: 'text-red-400', border: 'border-red-600' };
    }
    if (!stats) {
      return { label: 'WARNING', colorBg: 'bg-yellow-950', colorText: 'text-yellow-400', border: 'border-yellow-600' };
    }
    if (stats.system_health === 'CRITICAL' || stats.five_xx_rate_percent >= 5.0 || stats.error_rate_percent >= 10.0) {
      return { label: 'CRITICAL', colorBg: 'bg-red-950', colorText: 'text-red-400', border: 'border-red-600' };
    }
    if (stats.system_health === 'WARNING' || stats.five_xx_rate_percent > 0.5 || stats.error_rate_percent > 3.0) {
      return { label: 'WARNING', colorBg: 'bg-amber-950', colorText: 'text-amber-400', border: 'border-amber-600' };
    }
    return { label: 'HEALTHY', colorBg: 'bg-emerald-950', colorText: 'text-emerald-400', border: 'border-emerald-600' };
  };

  const healthState = getDerivedHealth();

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif] selection:bg-neutral-800 selection:text-white">
      {/* 100vh Hero Section with Background Video */}
      <section className="relative w-full h-screen overflow-hidden flex flex-col justify-between">
        {/* Full-screen background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
          src="https://cdn.sceneai.art/Hero%20Section%20Video/01d1f8de-fec0-4bf5-8b48-9fc2dbc8c6b0.mp4"
        />

        {/* Dark gradient overlay: black at 10% opacity at top to 40% at bottom */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)',
          }}
        />

        {/* Navigation Bar */}
        <header className="relative z-20 w-full px-6 md:px-12 py-6 flex items-center justify-between">
          {/* Logo: text "LogPulse", white, semibold, text-xl, no icon */}
          <a href="#" className="text-white font-semibold text-xl tracking-tight select-none">
            LogPulse
          </a>

          {/* Desktop Menu items: Exactly 14px, font-normal, white at 90% opacity */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#overview" className="text-[14px] font-normal text-white/90 hover:text-white transition-none">
              Overview
            </a>
            <a href="#system-status" className="text-[14px] font-normal text-white/90 hover:text-white transition-none">
              Logs
            </a>
            <a href="#analytics" className="text-[14px] font-normal text-white/90 hover:text-white transition-none">
              Metrics
            </a>
            <a href="#incident-monitoring" className="text-[14px] font-normal text-white/90 hover:text-white transition-none">
              Alerts
            </a>
            <a href="#architecture-support" className="text-[14px] font-normal text-white/90 hover:text-white transition-none">
              Support
            </a>
          </nav>

          {/* Right action: transparent "View Dashboard" button, white border, 14px regular text */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsBrokenDrill(!isBrokenDrill)}
              className={`text-[12px] font-mono px-3 py-1.5 border transition-none cursor-pointer ${
                isBrokenDrill
                  ? 'bg-red-950 border-red-500 text-red-300'
                  : 'bg-black/40 border-neutral-600 text-neutral-300 hover:border-neutral-400'
              }`}
              title="Toggle Step 9 Incident Drill (Simulates upstream 502/500)"
            >
              {isBrokenDrill ? 'Drill: 502 Bad Gateway Active' : 'Step 9 Drill: Break /api/stats'}
            </button>
            <a
              href="#system-status"
              className="text-[14px] font-normal text-white bg-transparent border border-white px-5 py-2 hover:bg-white hover:text-black transition-none cursor-pointer"
            >
              View Dashboard
            </a>
          </div>

          {/* Mobile hamburger menu (hidden on desktop) */}
          <button
            type="button"
            aria-label="Toggle Navigation Menu"
            className="md:hidden text-white p-2 border border-white/30 focus:outline-none transition-none cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </header>

        {/* Mobile Menu Dropdown (show/hide toggle, no sliding) */}
        {mobileMenuOpen && (
          <div className="md:hidden relative z-30 bg-black/95 border-b border-white/10 px-6 py-6 flex flex-col space-y-4">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[14px] font-normal text-white/90 hover:text-white transition-none"
            >
              Overview
            </a>
            <a
              href="#system-status"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[14px] font-normal text-white/90 hover:text-white transition-none"
            >
              Logs
            </a>
            <a
              href="#analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[14px] font-normal text-white/90 hover:text-white transition-none"
            >
              Metrics
            </a>
            <a
              href="#incident-monitoring"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[14px] font-normal text-white/90 hover:text-white transition-none"
            >
              Alerts
            </a>
            <a
              href="#architecture-support"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[14px] font-normal text-white/90 hover:text-white transition-none"
            >
              Support
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsBrokenDrill(!isBrokenDrill);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center text-[12px] font-mono border border-neutral-600 py-2 text-neutral-300 transition-none"
              >
                {isBrokenDrill ? 'Drill: 502 Bad Gateway Active' : 'Step 9 Drill: Break /api/stats'}
              </button>
              <a
                href="#system-status"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-[14px] font-normal text-white bg-transparent border border-white py-2.5 hover:bg-white hover:text-black transition-none"
              >
                View Dashboard
              </a>
            </div>
          </div>
        )}

        {/* Hero content (centered, text-center) */}
        <div id="overview" className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto text-center">
          <h1
            className="text-white font-medium text-[38px] md:text-[56px] tracking-tight mb-4"
            style={{ lineHeight: 1.1 }}
          >
            Monitor Every Log
            <br />
            Resolve Every Incident
          </h1>
          <p className="text-white/80 font-normal text-[15px] md:text-[18px] max-w-2xl mx-auto mb-8">
            Analyze application logs, detect failures, track latency, and respond to production incidents before they impact your users.
          </p>
          <a
            href="#system-status"
            className="inline-block bg-white text-black font-medium text-[15px] px-[26px] py-[12px] shadow-sm hover:shadow-md transition-none select-none cursor-pointer"
          >
            View System Status
          </a>
        </div>

        {/* Bottom indicator */}
        <div className="relative z-20 pb-4 text-center">
          <a
            href="#system-status"
            className="text-[12px] tracking-widest uppercase text-white/60 hover:text-white transition-none"
          >
            ↓ Live System Status & Access Log Metrics
          </a>
        </div>
      </section>

      {/* System Status Section (Directly Below Hero) */}
      <section id="system-status" className="bg-neutral-950 border-t border-neutral-900 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header & Status Indicator Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-neutral-800 gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Log Analyzer Telemetry • GET /api/stats
              </span>
              <h2 className="text-2xl font-medium text-white tracking-tight mt-1">System Status</h2>
            </div>

            {/* Clear Status Indicator: HEALTHY / WARNING / CRITICAL */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-400">STATUS:</span>
              <span
                className={`px-4 py-1.5 text-xs font-mono font-bold tracking-wider border ${healthState.colorBg} ${healthState.colorText} ${healthState.border}`}
              >
                {healthState.label}
              </span>
            </div>
          </div>

          {/* Drill Alert Banner if /api/stats is broken */}
          {fetchError && (
            <div className="mb-8 p-4 bg-red-950/80 border border-red-700 text-red-200 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-sm">INCIDENT DRILL ACTIVE: Upstream Failure Detected</strong>
                <button
                  onClick={() => setIsBrokenDrill(false)}
                  className="underline text-neutral-300 hover:text-white cursor-pointer"
                >
                  Reset Drill
                </button>
              </div>
              <p>{fetchError}</p>
              <div className="text-neutral-400 text-[11px] pt-1 border-t border-red-900">
                <strong>SRE Triage Steps on EC2:</strong>
                <br />1. Check Nginx error log: <code className="text-red-300">sudo tail -n 20 /var/log/nginx/error.log</code>
                <br />2. Check backend app process: <code className="text-red-300">ps aux | grep uvicorn</code> or <code className="text-red-300">sudo systemctl status fastapi</code>
                <br />3. Inspect HTTP return codes: <code className="text-red-300">curl -I http://127.0.0.1:8000/health</code>
              </div>
            </div>
          )}

          {/* Core System Status Cards:
              • 5xx Error Rate
              • P95 Response Time
              • Total Requests
              • Top Failing URL
              • Current System Health
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. 5xx Error Rate */}
            <div className="p-5 bg-neutral-900/80 border border-neutral-800">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                5xx Error Rate
              </div>
              <div className="text-3xl font-mono font-medium text-white">
                {stats ? `${stats.five_xx_rate_percent.toFixed(2)}%` : fetchError ? 'ERR' : '---'}
              </div>
              <div className="text-[11px] font-mono text-neutral-500 mt-2">
                Threshold: &gt; 5.0% (SNS Alert)
              </div>
            </div>

            {/* 2. P95 Response Time */}
            <div className="p-5 bg-neutral-900/80 border border-neutral-800">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                P95 Latency
              </div>
              <div className="text-3xl font-mono font-medium text-white">
                {stats ? `${stats.p95_ms}ms` : fetchError ? 'ERR' : '---'}
              </div>
              <div className="text-[11px] font-mono text-neutral-500 mt-2">
                {stats ? `P50: ${stats.p50_ms}ms` : 'Target: < 500ms'}
              </div>
            </div>

            {/* 3. Total Requests */}
            <div className="p-5 bg-neutral-900/80 border border-neutral-800">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Total Requests
              </div>
              <div className="text-3xl font-mono font-medium text-white">
                {stats ? stats.total_requests.toLocaleString() : fetchError ? 'ERR' : '---'}
              </div>
              <div className="text-[11px] font-mono text-neutral-500 mt-2">
                Parsed from access.log
              </div>
            </div>

            {/* 4. Top Failing URL */}
            <div className="p-5 bg-neutral-900/80 border border-neutral-800 col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Top Failing URL
              </div>
              <div className="text-sm font-mono text-amber-300 break-all line-clamp-2">
                {stats ? stats.top_failing_url : fetchError ? 'Upstream unavailable' : 'None detected'}
              </div>
              <div className="text-[11px] font-mono text-neutral-500 mt-2">
                Calculated by analyze.py regex pipeline
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Log Analytics Section */}
      <section id="analytics" className="bg-black py-16 px-6 md:px-12 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Real-time Ingestion Metrics
            </span>
            <h2 className="text-2xl font-medium text-white tracking-tight mt-1">Live Log Analytics</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Parsed from <code className="text-neutral-300">/var/log/nginx/access.log</code> via awk and Python pipelines
            </p>
          </div>

          {/* Cards for: Total Requests, 2xx Responses, 4xx Errors, 5xx Errors, Error Rate, P95 Latency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Total Requests */}
            <div className="p-6 bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3">
                <span>TOTAL REQUESTS</span>
                <span className="text-neutral-500">access.log lines</span>
              </div>
              <div className="text-3xl font-mono text-white font-medium">
                {stats ? stats.total_requests.toLocaleString() : '---'}
              </div>
              <div className="text-xs font-mono text-neutral-500 mt-3 pt-3 border-t border-neutral-900">
                Processed via <code className="text-neutral-400">awk '&#123;count++&#125;'</code>
              </div>
            </div>

            {/* Card 2: 2xx Responses */}
            <div className="p-6 bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3">
                <span>2XX SUCCESSFUL</span>
                <span className="text-emerald-400 font-bold">OK</span>
              </div>
              <div className="text-3xl font-mono text-emerald-400 font-medium">
                {stats ? stats.status_2xx.toLocaleString() : '---'}
              </div>
              <div className="text-xs font-mono text-neutral-500 mt-3 pt-3 border-t border-neutral-900">
                {stats ? `${((stats.status_2xx / stats.total_requests) * 100).toFixed(1)}% of total traffic` : '---'}
              </div>
            </div>

            {/* Card 3: 4xx Errors */}
            <div className="p-6 bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3">
                <span>4XX CLIENT ERRORS</span>
                <span className="text-amber-400 font-bold">CLIENT</span>
              </div>
              <div className="text-3xl font-mono text-amber-400 font-medium">
                {stats ? stats.status_4xx.toLocaleString() : '---'}
              </div>
              <div className="text-xs font-mono text-neutral-500 mt-3 pt-3 border-t border-neutral-900">
                404 Not Found, 401 Unauthorized, 403 Forbidden
              </div>
            </div>

            {/* Card 4: 5xx Errors */}
            <div className="p-6 bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3">
                <span>5XX SERVER ERRORS</span>
                <span className="text-rose-400 font-bold">CRITICAL</span>
              </div>
              <div className="text-3xl font-mono text-rose-400 font-medium">
                {stats ? stats.status_5xx.toLocaleString() : '---'}
              </div>
              <div className="text-xs font-mono text-neutral-500 mt-3 pt-3 border-t border-neutral-900">
                500 Internal, 502 Bad Gateway, 504 Timeout
              </div>
            </div>

            {/* Card 5: Error Rate */}
            <div className="p-6 bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3">
                <span>COMBINED ERROR RATE</span>
                <span className="text-neutral-500">(4xx + 5xx)</span>
              </div>
              <div className="text-3xl font-mono text-white font-medium">
                {stats ? `${stats.error_rate_percent.toFixed(2)}%` : '---'}
              </div>
              <div className="text-xs font-mono text-neutral-500 mt-3 pt-3 border-t border-neutral-900">
                Formula: <code className="text-neutral-400">(4xx + 5xx) / total * 100</code>
              </div>
            </div>

            {/* Card 6: P95 Latency */}
            <div className="p-6 bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-3">
                <span>P95 RESPONSE TIME</span>
                <span className="text-neutral-500">$request_time</span>
              </div>
              <div className="text-3xl font-mono text-white font-medium">
                {stats ? `${stats.p95_ms}ms` : '---'}
              </div>
              <div className="text-xs font-mono text-neutral-500 mt-3 pt-3 border-t border-neutral-900">
                95% of client requests served within this window
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Failing Endpoints Section */}
      <section className="bg-neutral-950 py-16 px-6 md:px-12 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Root Cause Identification
            </span>
            <h2 className="text-2xl font-medium text-white tracking-tight mt-1">Top Failing Endpoints</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Real HTTP failure signatures extracted from access logs by <code className="text-neutral-300">analyze.py</code>
            </p>
          </div>

          <div className="border border-neutral-800 bg-black overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Method & URL</th>
                  <th className="py-3 px-4">HTTP Status</th>
                  <th className="py-3 px-4">Failure Count</th>
                  <th className="py-3 px-4">Production Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {stats && stats.failing_endpoints && stats.failing_endpoints.length > 0 ? (
                  stats.failing_endpoints.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-900/40">
                      <td className="py-3.5 px-4 text-white font-semibold">
                        <span className="text-neutral-500 mr-2">{item.method || 'GET'}</span>
                        {item.url}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 border ${
                            (item.status || 500) >= 500
                              ? 'border-red-600 bg-red-950 text-red-400'
                              : 'border-amber-600 bg-amber-950 text-amber-400'
                          }`}
                        >
                          {item.status || '5xx'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-200">
                        {item.count.toLocaleString()} hits
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400">
                        {item.impact || 'Service degradation'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 px-4 text-center text-neutral-500">
                      {fetchError
                        ? 'Unable to query failing endpoints: API unavailable'
                        : 'No failing endpoints detected in current log rotation window.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recent System Activity Section */}
      <section className="bg-black py-16 px-6 md:px-12 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Audit Trail & Rotation Log
            </span>
            <h2 className="text-2xl font-medium text-white tracking-tight mt-1">Recent System Activity</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Active log monitoring events showing how Nginx access logs are ingested and processed
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {stats && stats.recent_activity && stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((act, i) => (
                <div key={i} className="p-4 bg-neutral-950 border border-neutral-800 flex items-start gap-4">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold border shrink-0 ${
                      act.level === 'CRITICAL'
                        ? 'border-red-500 bg-red-950 text-red-300'
                        : act.level === 'WARN'
                        ? 'border-amber-500 bg-amber-950 text-amber-300'
                        : act.level === 'INFO'
                        ? 'border-cyan-600 bg-cyan-950 text-cyan-300'
                        : 'border-emerald-600 bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {act.level}
                  </span>
                  <div className="flex-1">
                    <p className="text-neutral-200">{act.message}</p>
                    <span className="text-[11px] text-neutral-500">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-neutral-950 border border-neutral-800 text-neutral-500 text-center">
                Waiting for active analyzer ingestion events...
              </div>
            )}

            <div className="p-4 bg-neutral-900/30 border border-neutral-800/60 text-neutral-400 text-xs leading-relaxed">
              <span className="text-white font-semibold block mb-1">Nginx Access Log Ingestion Model:</span>
              Nginx appends every client HTTP transaction to <code className="text-neutral-300">/var/log/nginx/access.log</code> in append-only mode. Our analyzer runs in userspace on an hourly and 5-minute cron cadence to read raw bytes, parse upstream timing tokens, and populate system metrics without blocking client connections.
            </div>
          </div>
        </div>
      </section>

      {/* Incident Monitoring Section */}
      <section id="incident-monitoring" className="bg-neutral-950 py-16 px-6 md:px-12 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              SRE Component Architecture
            </span>
            <h2 className="text-2xl font-medium text-white tracking-tight mt-1">Incident Monitoring Flow</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Understanding the end-to-end telemetry pipeline from edge request to engineer pager alert
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
            {/* Box 1: Nginx */}
            <div className="p-5 bg-black border border-neutral-800">
              <div className="text-neutral-400 font-bold mb-2 flex items-center justify-between">
                <span>1. NGINX REVERSE PROXY</span>
                <span className="text-emerald-400">PORT 80</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Accepts incoming HTTP requests, serves static files (<code className="text-white">index.html</code>) directly, and forwards dynamic requests via <code className="text-white">proxy_pass http://127.0.0.1:8000;</code>. Logs client IP, method, status, and <code className="text-white">$request_time</code>.
              </p>
            </div>

            {/* Box 2: FastAPI */}
            <div className="p-5 bg-black border border-neutral-800">
              <div className="text-neutral-400 font-bold mb-2 flex items-center justify-between">
                <span>2. FASTAPI / SAMPLE APP</span>
                <span className="text-cyan-400">PORT 8000</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Asynchronous ASGI backend running behind Uvicorn. Exposes business routes along with <code className="text-white">/health</code> and <code className="text-white">/api/stats</code> which reads precomputed JSON metrics from the analyzer.
              </p>
            </div>

            {/* Box 3: analyze.sh */}
            <div className="p-5 bg-black border border-neutral-800">
              <div className="text-neutral-400 font-bold mb-2 flex items-center justify-between">
                <span>3. ANALYZE.SH (BASH)</span>
                <span className="text-amber-400">CORE PIPELINE</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Lightweight CLI troubleshooter using standard POSIX utilities: <code className="text-white">grep | awk | sort | uniq -c</code>. Quickly computes total requests, status code distribution, and top failing endpoints during interactive SSH triage.
              </p>
            </div>

            {/* Box 4: analyze.py */}
            <div className="p-5 bg-black border border-neutral-800">
              <div className="text-neutral-400 font-bold mb-2 flex items-center justify-between">
                <span>4. ANALYZE.PY (PYTHON)</span>
                <span className="text-indigo-400">PERCENTILES</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Regex parser extracting detailed metrics: p50 and p95 response time, failure rates, and slowest routes. Outputs clean JSON to <code className="text-white">/var/www/html/stats.json</code> for this frontend to display.
              </p>
            </div>

            {/* Box 5: alert.py */}
            <div className="p-5 bg-black border border-neutral-800">
              <div className="text-neutral-400 font-bold mb-2 flex items-center justify-between">
                <span>5. ALERT.PY (WATCHDOG)</span>
                <span className="text-rose-400">CRON (5 MIN)</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Scans the last 5 minutes of logs. If the 5xx error rate exceeds the 5% threshold, it formats an incident summary and calls the AWS SNS publish API via Boto3.
              </p>
            </div>

            {/* Box 6: AWS SNS */}
            <div className="p-5 bg-black border border-neutral-800">
              <div className="text-neutral-400 font-bold mb-2 flex items-center justify-between">
                <span>6. AWS SNS & IAM ROLE</span>
                <span className="text-purple-400">NOTIFICATION</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Dispatches urgent alert emails to on-call support engineers. Uses an attached EC2 IAM Role (<code className="text-white">sns:Publish</code>) via instance metadata, ensuring zero hardcoded AWS secret keys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browser Request Lifecycle & Nginx Access Log Deep-Dive */}
      <section id="architecture-support" className="bg-black py-16 px-6 md:px-12 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto font-mono text-xs">
          <div className="mb-6">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">
              SRE Interview Preparation • Networking & Protocol Inspection
            </span>
            <h2 className="text-2xl font-medium text-white tracking-tight mt-1 font-sans">
              Browser Request Lifecycle in Nginx Access Logs
            </h2>
          </div>

          <div className="bg-neutral-950 p-6 border border-neutral-800 space-y-4 text-neutral-300">
            <p>
              When a user loads LogPulse in a web browser, several distinct network requests occur. Here is how each request appears in <code className="text-emerald-400">/var/log/nginx/access.log</code>:
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-black border border-neutral-800">
                <span className="text-white font-bold block mb-1">1. Initial HTML Document (GET /):</span>
                <code className="text-neutral-400 block text-[11px] overflow-x-auto">
                  198.51.100.24 - - [04/Oct/2026:12:45:01 +0000] "GET / HTTP/1.1" 200 4820 "-" "Mozilla/5.0..." 0.002
                </code>
                <span className="text-neutral-500 text-[11px] mt-1 block">
                  Status: <strong>200 OK</strong>. Nginx serves the file directly from disk without touching the Python backend. Response time is &lt; 2ms.
                </span>
              </div>

              <div className="p-3 bg-black border border-neutral-800">
                <span className="text-white font-bold block mb-1">2. Google Fonts & External Assets:</span>
                <span className="text-neutral-500 text-[11px] block">
                  Status: <strong>External CDN</strong>. Fetched directly by the client browser from <code className="text-neutral-400">fonts.googleapis.com</code>. This does NOT appear in your EC2 Nginx access log because requests never touch your server.
                </span>
              </div>

              <div className="p-3 bg-black border border-neutral-800">
                <span className="text-white font-bold block mb-1">3. Background Video (GET /video.mp4):</span>
                <code className="text-neutral-400 block text-[11px] overflow-x-auto">
                  198.51.100.24 - - [04/Oct/2026:12:45:02 +0000] "GET /hero.mp4 HTTP/1.1" 206 1048576 "-" "Mozilla/5.0..." 0.015
                </code>
                <span className="text-neutral-500 text-[11px] mt-1 block">
                  Status: <strong>206 Partial Content</strong>. Media players use HTTP Range headers (<code className="text-neutral-400">Range: bytes=0-1048575</code>) for chunked streaming.
                </span>
              </div>

              <div className="p-3 bg-black border border-neutral-800">
                <span className="text-white font-bold block mb-1">4. Telemetry Endpoint (GET /api/stats):</span>
                <code className="text-neutral-400 block text-[11px] overflow-x-auto">
                  198.51.100.24 - - [04/Oct/2026:12:45:03 +0000] "GET /api/stats HTTP/1.1" 200 892 "-" "LogPulse-Frontend" 0.042
                </code>
                <span className="text-neutral-500 text-[11px] mt-1 block">
                  Status: <strong>200 OK</strong> when FastAPI is healthy (<code className="text-neutral-400">$request_time = 0.042s</code>). When FastAPI crashes, Nginx cannot connect to the backend socket, immediately logging <strong>502 Bad Gateway</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-neutral-900 py-8 px-6 text-center text-xs text-neutral-600 font-mono">
        LogPulse SRE Dashboard • Ubuntu 22.04 LTS • Nginx Reverse Proxy • Amazon Support Engineer Capstone
      </footer>
    </div>
  );
}
