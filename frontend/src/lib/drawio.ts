import { SystemArchitecture } from '@/types';

// ── AWS service → Draw.io mxgraph.aws4 icon mapping ───────────────────────
// Icons match exactly what the diagrams Python library uses (same AWS icon set)
const SERVICE_STYLES: Record<string, { resIcon: string; fillColor: string }> = {
  // Compute — orange
  ec2:              { resIcon: 'mxgraph.aws4.ec2',                          fillColor: '#FF9900' },
  ecs:              { resIcon: 'mxgraph.aws4.ecs',                          fillColor: '#FF9900' },
  eks:              { resIcon: 'mxgraph.aws4.eks',                          fillColor: '#FF9900' },
  fargate:          { resIcon: 'mxgraph.aws4.fargate',                      fillColor: '#FF9900' },
  lambda:           { resIcon: 'mxgraph.aws4.lambda',                       fillColor: '#FF9900' },
  batch:            { resIcon: 'mxgraph.aws4.batch',                        fillColor: '#FF9900' },
  // Storage — green
  s3:               { resIcon: 'mxgraph.aws4.s3',                           fillColor: '#7AA116' },
  ebs:              { resIcon: 'mxgraph.aws4.elastic_block_store',          fillColor: '#7AA116' },
  efs:              { resIcon: 'mxgraph.aws4.elastic_file_system',          fillColor: '#7AA116' },
  // Database — red
  rds:              { resIcon: 'mxgraph.aws4.rds',                          fillColor: '#C7131F' },
  aurora:           { resIcon: 'mxgraph.aws4.aurora',                       fillColor: '#C7131F' },
  dynamodb:         { resIcon: 'mxgraph.aws4.dynamodb',                     fillColor: '#C7131F' },
  elasticache:      { resIcon: 'mxgraph.aws4.elasticache',                  fillColor: '#C7131F' },
  documentdb:       { resIcon: 'mxgraph.aws4.documentdb',                   fillColor: '#C7131F' },
  redshift:         { resIcon: 'mxgraph.aws4.redshift',                     fillColor: '#C7131F' },
  athena:           { resIcon: 'mxgraph.aws4.athena',                       fillColor: '#C7131F' },
  glue:             { resIcon: 'mxgraph.aws4.glue',                         fillColor: '#C7131F' },
  opensearch:       { resIcon: 'mxgraph.aws4.opensearch_service',           fillColor: '#C7131F' },
  // Networking — purple
  alb:              { resIcon: 'mxgraph.aws4.application_load_balancer',    fillColor: '#8C4FFF' },
  nlb:              { resIcon: 'mxgraph.aws4.network_load_balancer',        fillColor: '#8C4FFF' },
  cloudfront:       { resIcon: 'mxgraph.aws4.cloudfront',                   fillColor: '#8C4FFF' },
  api_gateway:      { resIcon: 'mxgraph.aws4.api_gateway',                  fillColor: '#8C4FFF' },
  route53:          { resIcon: 'mxgraph.aws4.route_53',                     fillColor: '#8C4FFF' },
  internet_gateway: { resIcon: 'mxgraph.aws4.internet_gateway',             fillColor: '#8C4FFF' },
  transit_gateway:  { resIcon: 'mxgraph.aws4.transit_gateway',              fillColor: '#8C4FFF' },
  nat_gateway:      { resIcon: 'mxgraph.aws4.nat_gateway',                  fillColor: '#8C4FFF' },
  // Security — dark red
  waf:              { resIcon: 'mxgraph.aws4.waf',                          fillColor: '#DD344C' },
  shield:           { resIcon: 'mxgraph.aws4.shield',                       fillColor: '#DD344C' },
  iam:              { resIcon: 'mxgraph.aws4.role',                         fillColor: '#DD344C' },
  kms:              { resIcon: 'mxgraph.aws4.key_management_service',       fillColor: '#DD344C' },
  secrets_manager:  { resIcon: 'mxgraph.aws4.secrets_manager',              fillColor: '#DD344C' },
  cognito:          { resIcon: 'mxgraph.aws4.cognito',                      fillColor: '#DD344C' },
  // Messaging — magenta
  sqs:              { resIcon: 'mxgraph.aws4.sqs',                          fillColor: '#E7157B' },
  sns:              { resIcon: 'mxgraph.aws4.sns',                          fillColor: '#E7157B' },
  kinesis:          { resIcon: 'mxgraph.aws4.kinesis',                      fillColor: '#E7157B' },
  eventbridge:      { resIcon: 'mxgraph.aws4.eventbridge',                  fillColor: '#E7157B' },
  mq:               { resIcon: 'mxgraph.aws4.mq',                          fillColor: '#E7157B' },
  msk:              { resIcon: 'mxgraph.aws4.managed_streaming_for_kafka',  fillColor: '#E7157B' },
  step_functions:   { resIcon: 'mxgraph.aws4.step_functions',               fillColor: '#E7157B' },
  // Operations — pink/purple
  cloudwatch:       { resIcon: 'mxgraph.aws4.cloudwatch',                   fillColor: '#E7157B' },
  cloudtrail:       { resIcon: 'mxgraph.aws4.cloudtrail',                   fillColor: '#E7157B' },
  x_ray:            { resIcon: 'mxgraph.aws4.x_ray',                        fillColor: '#E7157B' },
  sagemaker:        { resIcon: 'mxgraph.aws4.sagemaker',                    fillColor: '#FF9900' },
  codepipeline:     { resIcon: 'mxgraph.aws4.codepipeline',                 fillColor: '#FF9900' },
  codebuild:        { resIcon: 'mxgraph.aws4.codebuild',                    fillColor: '#FF9900' },
};

// Build the style string for a service icon node
function nodeStyle(serviceType: string): string {
  const s = SERVICE_STYLES[serviceType];
  const fill  = s ? s.fillColor : '#232F3E';
  const shape = s
    ? `shape=mxgraph.aws4.resourceIcon;resIcon=${s.resIcon};`
    : `shape=mxgraph.aws4.general;`;
  return (
    `outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;` +
    `fillColor=${fill};labelBackgroundColor=#ffffff;` +
    `align=center;html=1;fontSize=11;fontStyle=0;aspect=fixed;` +
    `verticalLabelPosition=bottom;verticalAlign=top;` +
    shape
  );
}

// ── Layer definitions (mirrors diagram_generator.py) ──────────────────────
const LAYERS: Array<{
  name: string;
  types: Set<string>;
  fill: string;
  stroke: string;
}> = [
  { name: 'Edge / Gateway',  types: new Set(['alb','nlb','cloudfront','api_gateway','route53','internet_gateway','transit_gateway','nat_gateway','waf','shield']), fill: '#fff2cc', stroke: '#d6b656' },
  { name: 'Compute',         types: new Set(['ec2','ecs','eks','fargate','lambda','batch']),                                                                        fill: '#dae8fc', stroke: '#6c8ebf' },
  { name: 'Messaging',       types: new Set(['sqs','sns','kinesis','eventbridge','mq','msk','step_functions']),                                                     fill: '#ffe6cc', stroke: '#d79b00' },
  { name: 'Data & Storage',  types: new Set(['rds','aurora','dynamodb','elasticache','documentdb','redshift','s3','ebs','efs','athena','glue','opensearch']),       fill: '#d5e8d4', stroke: '#82b366' },
  { name: 'Security',        types: new Set(['iam','kms','secrets_manager','cognito']),                                                                             fill: '#f8cecc', stroke: '#b85450' },
  { name: 'Operations',      types: new Set(['cloudwatch','cloudtrail','x_ray','sagemaker','codepipeline','codebuild']),                                            fill: '#e1d5e7', stroke: '#9673a6' },
];
const ALL_LAYER_TYPES = new Set(LAYERS.flatMap(l => Array.from(l.types)));

// ── Helpers ────────────────────────────────────────────────────────────────
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Main export ────────────────────────────────────────────────────────────
export function generateDrawioXml(architecture: SystemArchitecture): string {
  const cells: string[] = [];
  let id = 2;
  const nextId = () => String(id++);

  // Map component name → absolute cell id (for edge wiring)
  const nameToId = new Map<string, string>();

  // ── Layout constants ────────────────────────────────────────────────────
  const NODE_W        = 60;   // icon is square
  const NODE_H        = 60;
  const LABEL_BELOW_H = 24;   // text label rendered below the icon
  const H_GAP         = 48;   // gap between nodes inside a cluster
  const CLUSTER_PAD   = 32;   // inner padding of each layer box
  const LABEL_H       = 28;   // height reserved for swimlane header
  const CLUSTER_VGAP  = 64;   // vertical gap between clusters
  const CENTER_X      = 620;  // horizontal centre of the canvas

  // ── Internet / Users node (uses AWS4 users icon) ─────────────────────────
  const internetId = nextId();
  const internetSz = 60;
  cells.push(
    `<mxCell id="${internetId}" value="Internet / Users" ` +
    `style="outlineConnect=0;fontColor=#232F3E;gradientColor=none;strokeColor=none;` +
    `fillColor=#232F3E;labelBackgroundColor=#ffffff;align=center;html=1;fontSize=12;fontStyle=1;` +
    `aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;shape=mxgraph.aws4.users;" ` +
    `vertex="1" parent="1">` +
    `<mxGeometry x="${CENTER_X - internetSz / 2}" y="40" width="${internetSz}" height="${internetSz}" as="geometry"/>` +
    `</mxCell>`
  );

  // ── Assign components to layers ─────────────────────────────────────────
  const activeLayers: Array<{
    name: string;
    fill: string;
    stroke: string;
    components: SystemArchitecture['components'];
  }> = [];
  for (const layer of LAYERS) {
    const comps = architecture.components.filter(c => layer.types.has(c.serviceType as string));
    if (comps.length) activeLayers.push({ ...layer, components: comps });
  }
  const otherComps = architecture.components.filter(c => !ALL_LAYER_TYPES.has(c.serviceType as string));
  if (otherComps.length) {
    activeLayers.push({ name: 'Other', fill: '#f5f5f5', stroke: '#666666', components: otherComps });
  }

  // ── Render layers as swimlane clusters ─────────────────────────────────
  // Extra space after internet node accounts for its label below
  let currentY = 40 + internetSz + LABEL_BELOW_H + CLUSTER_VGAP;
  let firstLayerFirstNodeId: string | null = null;

  for (const { name, fill, stroke, components } of activeLayers) {
    const nodeRow  = components.length;
    const clusterW = nodeRow * NODE_W + (nodeRow - 1) * H_GAP + CLUSTER_PAD * 2;
    // Height = swimlane header + icon + label-below + padding
    const clusterH = LABEL_H + CLUSTER_PAD + NODE_H + LABEL_BELOW_H + CLUSTER_PAD;
    const clusterX = CENTER_X - clusterW / 2;

    const clusterId = nextId();
    cells.push(
      `<mxCell id="${clusterId}" value="${esc(name)}" ` +
      `style="swimlane;startSize=${LABEL_H};fillColor=${fill}55;strokeColor=${stroke};` +
      `fontStyle=1;fontSize=12;rounded=1;arcSize=4;strokeWidth=2;" ` +
      `vertex="1" parent="1">` +
      `<mxGeometry x="${clusterX}" y="${currentY}" width="${clusterW}" height="${clusterH}" as="geometry"/>` +
      `</mxCell>`
    );

    // Nodes inside the cluster — coordinates relative to cluster origin
    for (let i = 0; i < components.length; i++) {
      const comp   = components[i];
      const nodeX  = CLUSTER_PAD + i * (NODE_W + H_GAP);
      const nodeY  = LABEL_H + CLUSTER_PAD;   // below swimlane header
      const nodeId = nextId();
      nameToId.set(comp.name, nodeId);
      if (firstLayerFirstNodeId === null) firstLayerFirstNodeId = nodeId;

      cells.push(
        `<mxCell id="${nodeId}" value="${esc(comp.name)}" ` +
        `style="${nodeStyle(comp.serviceType as string)}" ` +
        `vertex="1" parent="${clusterId}">` +
        `<mxGeometry x="${nodeX}" y="${nodeY}" width="${NODE_W}" height="${NODE_H}" as="geometry"/>` +
        `</mxCell>`
      );
    }

    currentY += clusterH + CLUSTER_VGAP;
  }

  // ── Internet → first edge-layer node ───────────────────────────────────
  if (firstLayerFirstNodeId !== null) {
    const eId = nextId();
    cells.push(
      `<mxCell id="${eId}" value="" ` +
      `style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;strokeColor=#232F3E;strokeWidth=2;" ` +
      `edge="1" source="${internetId}" target="${firstLayerFirstNodeId}" parent="1">` +
      `<mxGeometry relative="1" as="geometry"/>` +
      `</mxCell>`
    );
  }

  // ── Architecture connections ────────────────────────────────────────────
  for (const conn of (architecture.connections ?? [])) {
    const srcId = nameToId.get(conn.from);
    const dstId = nameToId.get(conn.to);
    if (!srcId || !dstId) continue;
    const eId = nextId();
    cells.push(
      `<mxCell id="${eId}" value="${conn.protocol ? esc(conn.protocol) : ''}" ` +
      `style="edgeStyle=orthogonalEdgeStyle;html=1;strokeColor=#555555;fontSize=10;" ` +
      `edge="1" source="${srcId}" target="${dstId}" parent="1">` +
      `<mxGeometry relative="1" as="geometry"/>` +
      `</mxCell>`
    );
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" ` +
    `connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1654" pageHeight="1169" math="0" shadow="0">\n` +
    `  <root>\n` +
    `    <mxCell id="0"/>\n` +
    `    <mxCell id="1" parent="0"/>\n` +
    cells.map(c => `    ${c}`).join('\n') + '\n' +
    `  </root>\n` +
    `</mxGraphModel>`
  );
}
