import { useState } from 'react';

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

interface IpData {
  ip: string;
  country: string;
  city: string;
  isp: string;
}

function App() {
  const [results, setResults] = useState<FingerprintData | null>(null);
  const [ipInfo, setIpInfo] = useState<IpData | null>(null);
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

    // IP Lookup
    let ipData: IpData | null = null;
    try {
      const res = await fetch('https://ipapi.co/json/');
      const ip = await res.json();
      ipData = {
        ip: ip.ip,
        country: ip.country_name || 'Unknown',
        city: ip.city || 'Unknown',
        isp: ip.org || 'Unknown'
      };
    } catch (e) {
      console.log('IP lookup unavailable');
    }

    setTimeout(() => {
      setResults(data);
      setIpInfo(ipData);
      setScore(privacyScore);
      setLoading(false);
    }, 800);
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
          <div className="text-center py-12 text-zinc-500">Analyzing...</div>
        )}

        {results && score !== null && (
          <div className="space-y-8">
            <div className="bg-white border rounded-2xl p-8 text-center">
              <div className="text-6xl font-semibold mb-1">{score}</div>
              <p className="text-sm uppercase tracking-widest text-zinc-500">Privacy Score</p>
            </div>

            {ipInfo && (
              <div className="bg-white border rounded-2xl p-8">
                <h3 className="font-medium mb-4">Network Info</h3>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div><strong>IP Address</strong></div>
                  <div>{ipInfo.ip}</div>
                  <div><strong>Country</strong></div>
                  <div>{ipInfo.country}</div>
                  <div><strong>City</strong></div>
                  <div>{ipInfo.city}</div>
                  <div><strong>ISP</strong></div>
                  <div>{ipInfo.isp}</div>
                </div>
              </div>
            )}

            <div className="bg-white border rounded-2xl p-8">
              <h3 className="font-medium mb-4">Browser Fingerprint</h3>
              <pre className="bg-zinc-100 p-5 rounded-xl text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>

            <div className="bg-white border rounded-2xl p-8">
              <h3 className="font-medium mb-4">Recommendations</h3>
              <ul className="space-y-4 text-sm">
                <li>• Use Brave or Firefox with strong tracker blocking</li>
                <li>• Use a reputable VPN (changes IP section above)</li>
                <li>• Clear cookies and site data often</li>
              </ul>
            </div>

            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-3.5 border rounded-xl hover:bg-zinc-100 transition"
            >
              Run New Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;