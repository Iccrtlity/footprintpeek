import { useState } from 'react';
import './index.css';

interface FingerprintData {
  userAgent: string;
  language: string;
  platform: string;
  cores: number | string;
  memory: number | string;
  screen: string;
  timezone: string;
  cookies: boolean;
  doNotTrack: string;
  canvas: string;
}

function App() {
  const [results, setResults] = useState<FingerprintData | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getCanvasFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unsupported';
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 60, 60);
    ctx.fillStyle = '#666';
    ctx.font = '12px system-ui';
    ctx.fillText('Test', 8, 35);
    return btoa(ctx.getImageData(0, 0, 60, 60).data.join('')).slice(0, 24);
  };

  const calculateScore = (data: FingerprintData): number => {
    let s = 85;
    if (data.doNotTrack === 'No') s -= 20;
    if (data.userAgent.toLowerCase().includes('chrome')) s -= 10;
    return Math.max(20, Math.round(s));
  };

  const runAudit = async () => {
    setLoading(true);

    const data: FingerprintData = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cores: navigator.hardwareConcurrency ?? 'unknown',
      memory: (navigator as any).deviceMemory ?? 'unknown',
      screen: `${screen.width} × ${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookies: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack ?? 'No',
      canvas: getCanvasFingerprint()
    };

    const privacyScore = calculateScore(data);

    setTimeout(() => {
      setResults(data);
      setScore(privacyScore);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="max-w-2xl mx-auto pt-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold mb-2">FootprintPeek</h1>
          <p className="text-zinc-600">See how unique your browser is</p>
          <p className="text-sm text-zinc-500 mt-1">Private • Local • No data sent</p>
        </div>

        {!results && !loading && (
          <div className="text-center">
            <button
              onClick={runAudit}
              className="bg-zinc-900 text-white px-10 py-4 rounded-xl text-lg font-medium hover:bg-black transition"
            >
              Start Scan
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-zinc-500">Analyzing browser...</div>
        )}

        {results && score !== null && (
          <div className="space-y-8">
            <div className="bg-white border rounded-2xl p-8 text-center">
              <div className="text-6xl font-semibold mb-1">{score}</div>
              <p className="text-sm uppercase tracking-widest text-zinc-500">Privacy Score</p>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <h3 className="font-medium mb-4">Detected Fingerprint</h3>
              <pre className="bg-zinc-100 p-5 rounded-xl text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <h3 className="font-medium mb-4">What you can do</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">• Use a privacy-focused browser like Brave or Firefox</li>
                <li className="flex items-start gap-3">• Install an ad/tracker blocker</li>
                <li className="flex items-start gap-3">• Clear your cookies and cache regularly</li>
                <li className="flex items-start gap-3">• Use a reputable VPN</li>
              </ul>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 border rounded-xl hover:bg-zinc-100 transition"
            >
              Scan Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;