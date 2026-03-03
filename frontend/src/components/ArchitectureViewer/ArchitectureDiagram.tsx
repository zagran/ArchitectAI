import { useState, useRef, useEffect, useCallback } from 'react';
import { SystemArchitecture } from '@/types';
import {
  CloudIcon, ServerIcon, CircleStackIcon, ShieldCheckIcon, GlobeAltIcon,
  ArrowDownTrayIcon, ClipboardDocumentIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import { generateDrawioXml } from '@/lib/drawio';

interface ArchitectureDiagramProps {
  architecture: SystemArchitecture;
}

// ─── Service mappings ──────────────────────────────────────────────────────────

const serviceIcons: Record<string, any> = {
  alb: GlobeAltIcon, nlb: GlobeAltIcon, cloudfront: GlobeAltIcon,
  api_gateway: GlobeAltIcon, route53: GlobeAltIcon,
  ec2: ServerIcon, ecs: ServerIcon, eks: ServerIcon, fargate: ServerIcon,
  lambda: CloudIcon, s3: CloudIcon, ebs: CloudIcon, efs: CloudIcon,
  rds: CircleStackIcon, dynamodb: CircleStackIcon, elasticache: CircleStackIcon,
  aurora: CircleStackIcon, redshift: CircleStackIcon, documentdb: CircleStackIcon,
  default: ShieldCheckIcon,
};

const serviceColors: Record<string, { bg: string; border: string; text: string }> = {
  alb:          { bg: '#fff7ed', border: '#f97316', text: '#9a3412' },
  nlb:          { bg: '#fff7ed', border: '#f97316', text: '#9a3412' },
  cloudfront:   { bg: '#eef2ff', border: '#818cf8', text: '#3730a3' },
  api_gateway:  { bg: '#eef2ff', border: '#818cf8', text: '#3730a3' },
  route53:      { bg: '#eef2ff', border: '#818cf8', text: '#3730a3' },
  ec2:          { bg: '#eff6ff', border: '#60a5fa', text: '#1e40af' },
  ecs:          { bg: '#eff6ff', border: '#60a5fa', text: '#1e40af' },
  eks:          { bg: '#eff6ff', border: '#60a5fa', text: '#1e40af' },
  fargate:      { bg: '#eff6ff', border: '#60a5fa', text: '#1e40af' },
  lambda:       { bg: '#fefce8', border: '#facc15', text: '#713f12' },
  rds:          { bg: '#f5f3ff', border: '#a78bfa', text: '#4c1d95' },
  aurora:       { bg: '#f5f3ff', border: '#a78bfa', text: '#4c1d95' },
  dynamodb:     { bg: '#f5f3ff', border: '#a78bfa', text: '#4c1d95' },
  elasticache:  { bg: '#fff1f2', border: '#fb7185', text: '#881337' },
  documentdb:   { bg: '#f5f3ff', border: '#a78bfa', text: '#4c1d95' },
  redshift:     { bg: '#f5f3ff', border: '#a78bfa', text: '#4c1d95' },
  s3:           { bg: '#f0fdf4', border: '#4ade80', text: '#14532d' },
  ebs:          { bg: '#f0fdf4', border: '#4ade80', text: '#14532d' },
  efs:          { bg: '#f0fdf4', border: '#4ade80', text: '#14532d' },
  sqs:          { bg: '#fdf4ff', border: '#e879f9', text: '#701a75' },
  sns:          { bg: '#fdf4ff', border: '#e879f9', text: '#701a75' },
  kinesis:      { bg: '#fdf4ff', border: '#e879f9', text: '#701a75' },
  waf:          { bg: '#fff1f2', border: '#fb7185', text: '#881337' },
  cognito:      { bg: '#fff1f2', border: '#fb7185', text: '#881337' },
  cloudwatch:   { bg: '#fef3c7', border: '#fbbf24', text: '#92400e' },
  default:      { bg: '#f8fafc', border: '#94a3b8', text: '#334155' },
};

const EDGE_TYPES    = new Set(['alb', 'nlb', 'cloudfront', 'api_gateway', 'route53', 'internet_gateway', 'waf']);
const COMPUTE_TYPES = new Set(['ec2', 'ecs', 'eks', 'fargate', 'lambda', 'batch']);
const DATA_TYPES    = new Set(['rds', 'aurora', 'dynamodb', 'elasticache', 'documentdb', 'redshift', 's3', 'ebs', 'efs', 'glacier']);
const MSG_TYPES     = new Set(['sqs', 'sns', 'kinesis', 'eventbridge', 'mq', 'msk']);
const SEC_TYPES     = new Set(['iam', 'kms', 'secrets_manager', 'cognito', 'acm', 'shield', 'guardduty']);
const OPS_TYPES     = new Set(['cloudwatch', 'x_ray', 'cloudtrail', 'config', 'ssm']);

// ─── Mermaid code generation ───────────────────────────────────────────────────

function generateMermaidCode(architecture: SystemArchitecture): string {
  const lines: string[] = [
    'flowchart TD',
    '  classDef edge fill:#eef2ff,stroke:#818cf8,color:#3730a3',
    '  classDef compute fill:#eff6ff,stroke:#60a5fa,color:#1e40af',
    '  classDef data fill:#f5f3ff,stroke:#a78bfa,color:#4c1d95',
    '  classDef msg fill:#fdf4ff,stroke:#e879f9,color:#701a75',
    '  classDef sec fill:#fff1f2,stroke:#fb7185,color:#881337',
    '  classDef ops fill:#fef3c7,stroke:#fbbf24,color:#92400e',
    '  classDef internet fill:#f0fdf4,stroke:#4ade80,color:#14532d',
    '',
    '  Internet([🌐 Internet / Users]):::internet',
  ];

  const edgeComps = architecture.components.filter(c => EDGE_TYPES.has(c.serviceType));

  for (const comp of architecture.components) {
    const sid = comp.id.replace(/[^a-zA-Z0-9]/g, '_');
    const name = comp.name.replace(/"/g, "'");
    const st = comp.serviceType ?? '';
    const costLabel = comp.estimatedMonthlyCost != null ? `\n$${comp.estimatedMonthlyCost.toFixed(0)}/mo` : '';

    let shape: string;
    let cls: string;
    if (EDGE_TYPES.has(st)) {
      shape = `["${name}\n${st}${costLabel}"]`; cls = 'edge';
    } else if (COMPUTE_TYPES.has(st)) {
      shape = `["${name}\n${st}${costLabel}"]`; cls = 'compute';
    } else if (DATA_TYPES.has(st)) {
      shape = `[("${name}\n${st}${costLabel}")]`; cls = 'data';
    } else if (MSG_TYPES.has(st)) {
      shape = `>"${name}\n${st}${costLabel}"]`; cls = 'msg';
    } else if (SEC_TYPES.has(st)) {
      shape = `{"${name}\n${st}${costLabel}"}`; cls = 'sec';
    } else {
      shape = `["${name}\n${st}${costLabel}"]`; cls = 'ops';
    }
    lines.push(`  ${sid}${shape}:::${cls}`);
  }

  lines.push('');

  // Internet → first edge layer
  for (const comp of edgeComps) {
    const sid = comp.id.replace(/[^a-zA-Z0-9]/g, '_');
    lines.push(`  Internet --> ${sid}`);
  }

  // Architecture connections
  for (const conn of architecture.connections) {
    const fromComp = architecture.components.find(c => c.name === conn.from || c.id === conn.from);
    const toComp   = architecture.components.find(c => c.name === conn.to   || c.id === conn.to);
    if (!fromComp || !toComp) continue;
    const fid = fromComp.id.replace(/[^a-zA-Z0-9]/g, '_');
    const tid = toComp.id.replace(/[^a-zA-Z0-9]/g, '_');
    const arrow = conn.protocol ? `-- ${conn.protocol} -->` : '-->';
    lines.push(`  ${fid} ${arrow} ${tid}`);
  }

  return lines.join('\n');
}

// ─── Mermaid renderer ──────────────────────────────────────────────────────────

let mermaidIdCounter = 0;

function MermaidRenderer({ code }: { code: string }) {
  const [svgHtml, setSvgHtml] = useState('');
  const [renderError, setRenderError] = useState('');
  const idRef = useRef(`mermaid-${++mermaidIdCounter}`);

  useEffect(() => {
    let cancelled = false;
    setSvgHtml('');
    setRenderError('');

    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
        const uid = `mermaid-${++mermaidIdCounter}`;
        idRef.current = uid;
        const { svg } = await mermaid.render(uid, code);
        if (!cancelled) setSvgHtml(svg);
      } catch (e) {
        if (!cancelled) setRenderError(e instanceof Error ? e.message : 'Render failed');
      }
    })();

    return () => { cancelled = true; };
  }, [code]);

  if (renderError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
        <strong>Mermaid error:</strong> {renderError}
      </div>
    );
  }

  if (!svgHtml) {
    return (
      <div className="flex items-center justify-center h-48 text-secondary-400 text-sm">
        <div className="w-5 h-5 border-2 border-secondary-300 border-t-transparent rounded-full animate-spin mr-2" />
        Rendering…
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-auto rounded-lg bg-white"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}

// ─── Drag-and-drop canvas ──────────────────────────────────────────────────────

const NODE_W = 192;
const NODE_H = 72;
const GAP_X  = 48;
const GAP_Y  = 88;
const CANVAS_PAD = 60;
const INTERNET_ID = '__internet__';

interface NodePos { x: number; y: number }

function buildInitialPositions(architecture: SystemArchitecture): Record<string, NodePos> {
  const layers: SystemArchitecture['components'][] = [
    architecture.components.filter(c => EDGE_TYPES.has(c.serviceType)),
    architecture.components.filter(c => COMPUTE_TYPES.has(c.serviceType)),
    architecture.components.filter(c => MSG_TYPES.has(c.serviceType)),
    architecture.components.filter(c => DATA_TYPES.has(c.serviceType)),
    architecture.components.filter(c => SEC_TYPES.has(c.serviceType)),
    architecture.components.filter(c => OPS_TYPES.has(c.serviceType)),
    architecture.components.filter(c =>
      !EDGE_TYPES.has(c.serviceType) && !COMPUTE_TYPES.has(c.serviceType) &&
      !DATA_TYPES.has(c.serviceType) && !MSG_TYPES.has(c.serviceType) &&
      !SEC_TYPES.has(c.serviceType)  && !OPS_TYPES.has(c.serviceType)
    ),
  ].filter(l => l.length > 0);

  const maxPerRow = Math.max(...layers.map(l => l.length), 1);
  const totalWidth = maxPerRow * NODE_W + (maxPerRow - 1) * GAP_X + CANVAS_PAD * 2;

  const positions: Record<string, NodePos> = {};

  // Internet node at top center
  positions[INTERNET_ID] = { x: (totalWidth - NODE_W) / 2, y: CANVAS_PAD };

  layers.forEach((layer, li) => {
    const rowWidth = layer.length * NODE_W + (layer.length - 1) * GAP_X;
    const startX = (totalWidth - rowWidth) / 2;
    const y = CANVAS_PAD + (li + 1) * (NODE_H + GAP_Y);
    layer.forEach((comp, ci) => {
      positions[comp.id] = { x: startX + ci * (NODE_W + GAP_X), y };
    });
  });

  return positions;
}

function DraggableCanvas({ architecture }: { architecture: SystemArchitecture }) {
  const [positions, setPositions] = useState<Record<string, NodePos>>({});
  const dragRef = useRef<{ id: string; startMX: number; startMY: number; startNX: number; startNY: number } | null>(null);

  // Build initial layout whenever architecture changes
  useEffect(() => {
    setPositions(buildInitialPositions(architecture));
  }, [architecture]);

  const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const pos = positions[id];
    if (!pos) return;
    dragRef.current = { id, startMX: e.clientX, startMY: e.clientY, startNX: pos.x, startNY: pos.y };
  }, [positions]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { id, startMX, startMY, startNX, startNY } = dragRef.current;
      setPositions(prev => ({
        ...prev,
        [id]: { x: startNX + e.clientX - startMX, y: startNY + e.clientY - startMY },
      }));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const nodeCenter = (id: string) => {
    const p = positions[id];
    if (!p) return null;
    return { x: p.x + NODE_W / 2, y: p.y + NODE_H / 2 };
  };

  const allX = Object.values(positions).map(p => p.x + NODE_W);
  const allY = Object.values(positions).map(p => p.y + NODE_H);
  const svgW = Math.max(...allX, 600) + CANVAS_PAD;
  const svgH = Math.max(...allY, 400) + CANVAS_PAD;

  const edgeComps = architecture.components.filter(c => EDGE_TYPES.has(c.serviceType));

  return (
    <div className="relative overflow-auto rounded-lg border border-secondary-200 bg-[#fafafa]" style={{ height: 540 }}>
      {/* SVG connection layer */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={svgW} height={svgH}
        style={{ minWidth: svgW, minHeight: svgH }}
      >
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
          <marker id="arrow-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
          </marker>
        </defs>

        {/* Internet → edge layer lines */}
        {edgeComps.map(comp => {
          const from = nodeCenter(INTERNET_ID);
          const to   = nodeCenter(comp.id);
          if (!from || !to) return null;
          return (
            <line key={`inet-${comp.id}`}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke="#94a3b8" strokeWidth={1.5}
              strokeDasharray="6 3"
              markerEnd="url(#arrow)"
            />
          );
        })}

        {/* Architecture connections */}
        {architecture.connections.map((conn, i) => {
          const fc = architecture.components.find(c => c.name === conn.from || c.id === conn.from);
          const tc = architecture.components.find(c => c.name === conn.to   || c.id === conn.to);
          if (!fc || !tc) return null;
          const from = nodeCenter(fc.id);
          const to   = nodeCenter(tc.id);
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          return (
            <g key={i}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#cbd5e1" strokeWidth={1.5}
                markerEnd="url(#arrow)"
              />
              {conn.protocol && (
                <text x={mx} y={my - 6} textAnchor="middle" fill="#94a3b8" fontSize={10} fontFamily="monospace">
                  {conn.protocol}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Absolute-positioned nodes */}
      <div className="absolute inset-0" style={{ width: svgW, height: svgH }}>
        {/* Internet node */}
        {positions[INTERNET_ID] && (
          <div
            className="absolute flex items-center justify-center rounded-full border-2 border-green-400 bg-green-50 text-green-800 text-xs font-semibold cursor-grab active:cursor-grabbing select-none shadow-sm"
            style={{ left: positions[INTERNET_ID].x, top: positions[INTERNET_ID].y, width: NODE_W, height: NODE_H }}
            onMouseDown={e => onMouseDown(e, INTERNET_ID)}
          >
            <GlobeAltIcon className="h-5 w-5 mr-1.5 text-green-600" />
            Internet / Users
          </div>
        )}

        {/* Architecture component nodes */}
        {architecture.components.map(comp => {
          const pos = positions[comp.id];
          if (!pos) return null;
          const st = comp.serviceType ?? '';
          const Icon = serviceIcons[st] ?? serviceIcons.default;
          const colors = serviceColors[st] ?? serviceColors.default;

          return (
            <div
              key={comp.id}
              className="absolute rounded-xl border-2 px-3 py-2 cursor-grab active:cursor-grabbing select-none shadow-sm transition-shadow hover:shadow-md"
              style={{
                left: pos.x, top: pos.y,
                width: NODE_W, height: NODE_H,
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text,
              }}
              onMouseDown={e => onMouseDown(e, comp.id)}
            >
              <div className="flex items-center h-full gap-2">
                <Icon className="h-6 w-6 flex-shrink-0 opacity-80" />
                <div className="min-w-0">
                  <p className="font-semibold text-xs leading-tight truncate">{comp.name}</p>
                  <p className="text-xs opacity-60 uppercase tracking-wide">{st}</p>
                  {comp.estimatedMonthlyCost != null && (
                    <p className="text-xs opacity-50">${comp.estimatedMonthlyCost.toFixed(0)}/mo</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

type Tab = 'diagram' | 'mermaid';

export default function ArchitectureDiagram({ architecture }: ArchitectureDiagramProps) {
  const [tab, setTab] = useState<Tab>('diagram');
  const [mermaidCode, setMermaidCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMermaidCode(generateMermaidCode(architecture));
  }, [architecture]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportDrawio = () => {
    const xml  = generateDrawioXml(architecture);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${architecture.name.replace(/\s+/g, '_')}_diagram.drawio`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-secondary-900">Architecture Diagram</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-secondary-400">
            {architecture.components.length} components · {architecture.connections.length} connections
          </span>
          <button
            onClick={handleExportDrawio}
            className="flex items-center px-3 py-1.5 text-sm border border-secondary-300 text-secondary-600 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
            Draw.io
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary-100 rounded-lg mb-5 w-fit">
        {([
          { id: 'diagram' as Tab, label: 'Interactive Diagram' },
          { id: 'mermaid' as Tab, label: 'Mermaid Code' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === t.id
                ? 'bg-white text-secondary-900 shadow-sm'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Interactive drag-and-drop diagram ── */}
      {tab === 'diagram' && (
        <div>
          <p className="text-xs text-secondary-400 mb-3">
            Drag nodes to rearrange. Arrows show data flow between components.
          </p>
          <DraggableCanvas architecture={architecture} />
        </div>
      )}

      {/* ── Tab: Mermaid code + rendered preview ── */}
      {tab === 'mermaid' && (
        <div className="space-y-5">
          {/* Rendered preview */}
          <div>
            <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide mb-2">Preview</p>
            <div className="rounded-lg border border-secondary-200 p-4 overflow-auto">
              <MermaidRenderer code={mermaidCode} />
            </div>
          </div>

          {/* Editable code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Mermaid Source</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-secondary-500 hover:text-secondary-700 px-2 py-1 rounded hover:bg-secondary-100 transition-colors"
              >
                {copied ? (
                  <><CheckIcon className="h-3.5 w-3.5 text-green-500" /> Copied!</>
                ) : (
                  <><ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy</>
                )}
              </button>
            </div>
            <textarea
              value={mermaidCode}
              onChange={e => setMermaidCode(e.target.value)}
              className="w-full h-72 font-mono text-xs bg-secondary-950 text-green-400 rounded-lg p-4 border border-secondary-800 resize-y focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={{ backgroundColor: '#0f172a' }}
              spellCheck={false}
            />
            <p className="text-xs text-secondary-400 mt-1">
              Edit the code above — the preview updates automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
