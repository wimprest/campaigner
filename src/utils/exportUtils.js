import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import toast from 'react-hot-toast'
// Note: MJML to HTML conversion happens via external service or server
// Browser can't run mjml2html directly

// Export entire campaign as JSON
export const exportCampaignJSON = (flowDataOrNodes, edgesOrCampaignName, campaignNameLegacy) => {
  // Handle both old and new signatures
  let flowData, campaignName

  if (typeof flowDataOrNodes === 'object' && flowDataOrNodes.campaignName) {
    // New signature: exportCampaignJSON({ campaignName, nodes, edges }, campaignName)
    flowData = {
      version: '1.0',
      campaignName: flowDataOrNodes.campaignName,
      nodes: flowDataOrNodes.nodes,
      edges: flowDataOrNodes.edges,
      exportDate: new Date().toISOString(),
      metadata: {
        nodeCount: flowDataOrNodes.nodes.length,
        edgeCount: flowDataOrNodes.edges.length,
        nodeTypes: [...new Set(flowDataOrNodes.nodes.map(n => n.type))]
      }
    }
    campaignName = edgesOrCampaignName || flowDataOrNodes.campaignName || 'campaign'
  } else {
    // Old signature: exportCampaignJSON(nodes, edges, campaignName)
    const nodes = flowDataOrNodes
    const edges = edgesOrCampaignName
    campaignName = campaignNameLegacy || 'campaign'

    flowData = {
      version: '1.0',
      campaignName: campaignName,
      nodes,
      edges,
      exportDate: new Date().toISOString(),
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        nodeTypes: [...new Set(nodes.map(n => n.type))]
      }
    }
  }

  const dataStr = JSON.stringify(flowData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const fileName = sanitizeFileName(campaignName)
  const timestamp = getReadableTimestamp()
  saveAs(dataBlob, `${fileName}_${timestamp}.json`)
  toast.success(`Campaign exported: ${fileName}_${timestamp}.json`, { duration: 3000 })
}

// Export selected nodes as JSON
export const exportSelectedNodesJSON = (selectedNodes, edges, campaignName = 'selection') => {
  const selectedNodeIds = new Set(selectedNodes.map(n => n.id))
  const relevantEdges = edges.filter(
    edge => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)
  )

  const flowData = {
    version: '1.0',
    name: `${campaignName}-selection`,
    nodes: selectedNodes,
    edges: relevantEdges,
    exportDate: new Date().toISOString()
  }

  const dataStr = JSON.stringify(flowData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const fileName = sanitizeFileName(campaignName)
  const timestamp = getReadableTimestamp()
  saveAs(dataBlob, `${fileName}_selection_${timestamp}.json`)
  toast.success(`Selection exported: ${selectedNodes.length} nodes`, { duration: 3000 })
}

// Export all email nodes as MJML + HTML files in a ZIP
export const exportAllEmailsAsZip = async (nodes, campaignName = 'campaign') => {
  const zip = new JSZip()
  const emailNodes = nodes.filter(node => node.type === 'email')

  if (emailNodes.length === 0) {
    toast.error('No email nodes found in this campaign!')
    return
  }

  // Create folders
  const mjmlFolder = zip.folder('mjml')
  const htmlFolder = zip.folder('html')
  const metadataFolder = zip.folder('metadata')

  // Process each email node
  for (const node of emailNodes) {
    const fileName = sanitizeFileName(node.data.label || node.id)
    const mjmlContent = node.data.mjmlTemplate || generateBasicMJML(node.data)

    // Add MJML file
    mjmlFolder.file(`${fileName}.mjml`, mjmlContent)

    // Add basic HTML placeholder with instructions
    const htmlPlaceholder = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${node.data.subject || fileName}</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
    <h2>MJML Template: ${node.data.label}</h2>
    <p>To convert this MJML template to production-ready HTML:</p>
    <ol>
      <li>Visit <a href="https://mjml.io/try-it-live" target="_blank">https://mjml.io/try-it-live</a></li>
      <li>Copy the content from the corresponding .mjml file</li>
      <li>Paste it into the MJML editor</li>
      <li>Copy the generated HTML output</li>
    </ol>
    <p><strong>Or use the MJML API:</strong></p>
    <p>POST the MJML content to https://api.mjml.io/v1/render with your API key</p>
    <hr>
    <h3>Email Content Preview:</h3>
    <p><strong>Subject:</strong> ${node.data.subject || 'No subject'}</p>
    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${mjmlContent}</pre>
  </div>
</body>
</html>`

    htmlFolder.file(`${fileName}.html`, htmlPlaceholder)

    // Add metadata JSON
    const metadata = {
      nodeId: node.id,
      title: node.data.label,
      subject: node.data.subject,
      description: node.data.description,
      notes: node.data.notes,
      exportDate: new Date().toISOString()
    }
    metadataFolder.file(`${fileName}.json`, JSON.stringify(metadata, null, 2))
  }

  // Add README
  zip.file('README.txt', `Campaign Email Export
Generated: ${new Date().toISOString()}
Campaign: ${campaignName}
Total Emails: ${emailNodes.length}

Folders:
- mjml/    : MJML source files (editable email templates)
- html/    : HTML preview files with conversion instructions
- metadata/: Email metadata and settings

IMPORTANT: Converting MJML to HTML

The .mjml files contain professional email templates. To use them:

Option 1 - Online Converter (Free):
1. Go to https://mjml.io/try-it-live
2. Copy content from .mjml file
3. Paste into the editor
4. Copy the generated HTML
5. Import into your email platform (SendGrid, Mailchimp, etc.)

Option 2 - MJML API (For automation):
POST your MJML to: https://api.mjml.io/v1/render
Get your API key at: https://mjml.io/api

Option 3 - Node.js/CLI:
npm install -g mjml
mjml input.mjml -o output.html

The HTML files in this ZIP show template previews and instructions.
Edit the .mjml files to customize your emails!
`)

  // Add comprehensive manifest
  const manifest = {
    campaignName,
    exportDate: new Date().toISOString(),
    totalEmails: emailNodes.length,
    emails: emailNodes.map(node => ({
      id: node.id,
      title: node.data.label,
      subject: node.data.subject,
      hasABTesting: node.data.subjectVariants && node.data.subjectVariants.length > 1,
      mjmlFile: `mjml/${sanitizeFileName(node.data.label || node.id)}.mjml`,
      htmlFile: `html/${sanitizeFileName(node.data.label || node.id)}.html`,
      metadataFile: `metadata/${sanitizeFileName(node.data.label || node.id)}.json`
    })),
    instructions: {
      mjmlConversion: 'Use https://mjml.io/try-it-live or MJML API to convert .mjml files to production HTML',
      apiEndpoint: 'https://api.mjml.io/v1/render',
      cliCommand: 'mjml input.mjml -o output.html'
    }
  }
  metadataFolder.file('manifest.json', JSON.stringify(manifest, null, 2))

  // Generate ZIP and download
  const content = await zip.generateAsync({ type: 'blob' })
  const fileName = sanitizeFileName(campaignName)
  const timestamp = getReadableTimestamp()
  saveAs(content, `${fileName}_emails_${timestamp}.zip`)
  toast.success(`Email export complete: ${emailNodes.length} emails`, { duration: 3000 })
}

// Export single email node as MJML
export const exportSingleEmailHTML = (node) => {
  const fileName = sanitizeFileName(node.data.label || node.id)
  const mjmlContent = node.data.mjmlTemplate || generateBasicMJML(node.data)

  // Export as MJML file (user can convert at mjml.io)
  const mjmlBlob = new Blob([mjmlContent], { type: 'text/plain' })
  saveAs(mjmlBlob, `${fileName}.mjml`)

  toast.success('MJML file exported! Convert to HTML at https://mjml.io/try-it-live', { duration: 5000 })
}

// Export campaign as interactive HTML viewer
export const exportAsInteractiveHTML = (nodes, edges, campaignName = 'campaign') => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaignName} - Campaign Builder</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      padding: 20px;
    }
    .header {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #333; }
    .metadata {
      color: #666;
      font-size: 14px;
      margin-top: 10px;
    }
    .nodes-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .node {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .node-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }
    .node-type {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      color: white;
      margin-right: 10px;
    }
    .type-email { background: #2196F3; }
    .type-survey { background: #4CAF50; }
    .type-conditional { background: #9C27B0; }
    .type-action { background: #FF9800; }
    .type-delay { background: #F44336; }
    .node-title { font-weight: bold; font-size: 16px; }
    .node-content { margin-top: 10px; }
    .field { margin-bottom: 10px; }
    .field-label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .field-value {
      color: #333;
      white-space: pre-wrap;
      line-height: 1.5;
    }
    .connections {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
    }
    .connection {
      font-size: 12px;
      color: #666;
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${campaignName}</h1>
    <div class="metadata">
      Exported: ${new Date().toLocaleString()}<br>
      Nodes: ${nodes.length} | Edges: ${edges.length}
    </div>
  </div>

  <div class="nodes-container">
    ${nodes.map(node => renderNodeHTML(node, edges)).join('\n')}
  </div>

  <script>
    const flowData = ${JSON.stringify({ nodes, edges }, null, 2)};
    console.log('Campaign Data:', flowData);
  </script>
</body>
</html>`

  const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
  const fileName = sanitizeFileName(campaignName)
  const timestamp = getReadableTimestamp()
  saveAs(htmlBlob, `${fileName}_viewer_${timestamp}.html`)
  toast.success(`HTML viewer exported`, { duration: 3000 })
}

// Helper: Render single node as HTML
function renderNodeHTML(node, edges) {
  const outgoingEdges = edges.filter(e => e.source === node.id)
  const incomingEdges = edges.filter(e => e.target === node.id)

  let contentHtml = ''

  switch (node.type) {
    case 'email':
      contentHtml = `
        ${renderField('Subject', node.data.subject)}
        ${renderField('Content', node.data.emailContent)}
      `
      break
    case 'survey':
      contentHtml = `
        ${renderField('Question', node.data.question)}
        ${renderField('Type', node.data.questionType)}
        ${node.data.responseOptions ? `
          <div class="field">
            <div class="field-label">Response Options:</div>
            <div class="field-value">${node.data.responseOptions.map(opt => `• ${opt.text}`).join('<br>')}</div>
          </div>
        ` : ''}
        ${node.data.responsePaths ? `
          <div class="field">
            <div class="field-label">Response Paths:</div>
            <div class="field-value">${node.data.responsePaths.map(path => `• ${path.label} (${path.mappedOptions?.length || 0} options)`).join('<br>')}</div>
          </div>
        ` : ''}
      `
      break
    case 'conditional':
      contentHtml = `
        ${renderField('Condition', node.data.condition)}
        ${renderField('True Path', node.data.truePath)}
        ${renderField('False Path', node.data.falsePath)}
      `
      break
    case 'delay':
      contentHtml = `
        ${renderField('Duration', `${node.data.duration} ${node.data.unit}`)}
      `
      break
    case 'action':
      contentHtml = `
        ${renderField('Action Type', node.data.actionType)}
      `
      break
  }

  return `
    <div class="node">
      <div class="node-header">
        <span class="node-type type-${node.type}">${node.type.toUpperCase()}</span>
        <span class="node-title">${node.data.label || 'Untitled'}</span>
      </div>
      ${node.data.description ? renderField('Description', node.data.description) : ''}
      <div class="node-content">
        ${contentHtml}
      </div>
      ${node.data.notes ? renderField('Notes', node.data.notes) : ''}
      ${outgoingEdges.length > 0 || incomingEdges.length > 0 ? `
        <div class="connections">
          ${incomingEdges.length > 0 ? `<div class="connection">← ${incomingEdges.length} incoming connection(s)</div>` : ''}
          ${outgoingEdges.length > 0 ? `<div class="connection">→ ${outgoingEdges.length} outgoing connection(s)</div>` : ''}
        </div>
      ` : ''}
    </div>
  `
}

function renderField(label, value) {
  if (!value) return ''
  return `
    <div class="field">
      <div class="field-label">${label}:</div>
      <div class="field-value">${value}</div>
    </div>
  `
}

// Helper: Generate basic MJML from email data
function generateBasicMJML(emailData) {
  const subject = emailData.subject || 'Untitled Email'
  const content = emailData.emailContent || 'No content provided.'

  return `<mjml>
  <mj-head>
    <mj-title>${subject}</mj-title>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="16px" color="#333333" font-family="Arial, sans-serif" line-height="1.6">
          ${content.split('\n').map(line => line.trim()).filter(line => line).join('<br/>')}
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#f4f4f4" padding="20px">
      <mj-column>
        <mj-text font-size="12px" color="#999999" align="center">
          © 2025 Your Company. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`
}

// Helper: Sanitize filename
function sanitizeFileName(name) {
  return name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

// Helper: Generate readable timestamp for filenames
function getReadableTimestamp() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

// Export campaign as mobile-optimized viewer HTML
export const exportAsMobileViewer = (nodes, edges, campaignName = 'campaign', variables = []) => {
  const timestamp = getReadableTimestamp()
  const filename = `${campaignName.replace(/[^a-z0-9]/gi, '_')}-mobile-viewer-${timestamp}.html`

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>${campaignName} - Mobile Viewer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      overflow: hidden;
      touch-action: none;
    }

    /* Header */
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      padding: 12px 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 18px;
      color: #333;
      font-weight: 600;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stats {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #666;
      align-items: center;
    }

    .stat-badge {
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 500;
    }

    /* Canvas Container */
    .canvas-container {
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 60px;
      overflow: hidden;
      touch-action: none; /* Prevent default touch behaviors like pull-to-refresh */
      -webkit-user-select: none;
      user-select: none;
      cursor: grab;
    }

    .canvas-container:active {
      cursor: grabbing;
    }

    .canvas {
      width: 100%;
      height: 100%;
      position: relative;
      cursor: grab;
      transform-origin: 0 0;
    }

    .canvas.dragging {
      cursor: grabbing;
    }

    /* Nodes */
    .node {
      position: absolute;
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 200px;
      max-width: 280px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 2px solid transparent;
    }

    .node:active {
      transform: scale(0.98);
    }

    .node-email { border-color: #2196F3; }
    .node-survey { border-color: #4CAF50; }
    .node-conditional { border-color: #9C27B0; }
    .node-action { border-color: #FF9800; }
    .node-delay { border-color: #F44336; }

    .node-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .node-type-badge {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: white;
      margin-right: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-email { background: #2196F3; }
    .badge-survey { background: #4CAF50; }
    .badge-conditional { background: #9C27B0; }
    .badge-action { background: #FF9800; }
    .badge-delay { background: #F44336; }

    .node-label {
      font-weight: 600;
      font-size: 14px;
      color: #333;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node-preview {
      font-size: 12px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.4;
    }

    /* Connections */
    svg.connections {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 0;
      overflow: visible;
    }

    .edge {
      stroke: #999;
      stroke-width: 2;
      fill: none;
      marker-end: url(#arrowhead);
    }

    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.6);
      z-index: 2000;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s;
    }

    .modal-overlay.active {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal {
      background: white;
      border-radius: 16px;
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.3s;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      background: white;
      z-index: 1;
      border-radius: 16px 16px 0 0;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      background: #f0f0f0;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .close-btn:active {
      background: #e0e0e0;
    }

    .modal-content {
      padding: 20px;
    }

    .field {
      margin-bottom: 16px;
    }

    .field-label {
      font-weight: 600;
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .field-value {
      color: #333;
      font-size: 14px;
      line-height: 1.6;
      white-space: normal;
      word-wrap: break-word;
    }

    /* Normalize email content spacing - aggressive rules to eliminate ReactQuill gaps */
    .field-value p {
      margin: 0 0 8px 0 !important;
      line-height: 1.5 !important;
    }
    .field-value p:last-child {
      margin-bottom: 0 !important;
    }
    .field-value p:empty {
      display: none !important;
    }
    .field-value p br {
      display: none !important;
    }
    .field-value ul, .field-value ol {
      margin: 8px 0 !important;
      padding-left: 24px !important;
    }
    .field-value ul:first-child, .field-value ol:first-child {
      margin-top: 0 !important;
    }
    .field-value li {
      margin: 2px 0 !important;
      line-height: 1.5 !important;
    }
    .field-value strong {
      font-weight: 600;
    }
    .field-value br {
      display: none !important;
    }
    /* Remove any stray breaks or empty paragraphs */
    .field-value > br {
      display: none !important;
    }

    .question-item {
      background: #f8f8f8;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .question-text {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .option {
      padding: 6px 12px;
      background: white;
      border-radius: 6px;
      margin: 4px 0;
      font-size: 13px;
    }

    .path-item {
      background: #f0f0f0;
      padding: 10px;
      border-radius: 8px;
      margin: 8px 0;
      border-left: 3px solid #999;
    }

    /* Footer Controls */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      padding: 12px 16px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    .controls {
      display: flex;
      gap: 8px;
      justify-content: center;
      align-items: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .control-btn {
      background: white;
      border: 1px solid #ddd;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      color: #333;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .control-btn:active {
      transform: scale(0.95);
      background: #f0f0f0;
    }

    .zoom-level {
      font-size: 13px;
      color: #666;
      font-weight: 500;
      min-width: 50px;
      text-align: center;
    }

    /* Responsive */
    @media (max-width: 600px) {
      h1 { font-size: 16px; }
      .stats { font-size: 11px; gap: 8px; }
      .stat-badge { padding: 3px 6px; }
      .node {
        min-width: 300px !important;
        max-width: 300px !important;
        width: 300px !important;
        padding: 20px !important;
        font-size: 15px;
      }
      .node-label { font-size: 15px !important; font-weight: 600; }
      .node-preview { font-size: 13px !important; line-height: 1.4; }
      .control-btn { padding: 12px 16px; font-size: 15px; }
    }

    /* Loading */
    .loading {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 18px;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div class="loading" id="loading">Loading campaign...</div>

  <div class="header" id="header" style="display:none;">
    <div class="header-content">
      <h1 id="campaignName">${campaignName}</h1>
      <div class="stats">
        <span class="stat-badge" id="nodeCount">${nodes.length} nodes</span>
        <span class="stat-badge" id="edgeCount">${edges.length} edges</span>
      </div>
    </div>
  </div>

  <div class="canvas-container" style="display:none;">
    <div class="canvas" id="canvas">
      <svg class="connections" id="connections"></svg>
      <div id="nodes"></div>
    </div>
  </div>

  <div class="footer" id="footer" style="display:none;">
    <div class="controls">
      <button class="control-btn" onclick="resetView()">↺ Reset</button>
      <button class="control-btn" onclick="zoomOut()">−</button>
      <span class="zoom-level" id="zoomLevel">100%</span>
      <button class="control-btn" onclick="zoomIn()">+</button>
      <button class="control-btn" onclick="fitToView()">⤢ Fit</button>
    </div>
  </div>

  <div class="modal-overlay" id="modalOverlay" onclick="closeModal(event)">
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <span class="modal-title" id="modalTitle"></span>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div class="modal-content" id="modalContent"></div>
    </div>
  </div>

  <script>
    // Campaign Data
    const campaignData = ${JSON.stringify({ nodes, edges, variables }, null, 2)};

    // State
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastTouchDistance = 0;

    // Initialize
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          console.log('Initializing mobile viewer...');
          document.getElementById('loading').style.display = 'none';
          document.getElementById('header').style.display = 'block';
          document.getElementById('footer').style.display = 'block';
          document.querySelector('.canvas-container').style.display = 'block';
          console.log('Rendering campaign...');
          renderCampaign();
          console.log('Fitting to view...');
          fitToView();
          console.log('Mobile viewer initialized successfully');
        } catch (error) {
          console.error('Error initializing mobile viewer:', error);
          document.getElementById('loading').innerHTML = '<div style="color:red; padding:20px;">Error loading campaign: ' + error.message + '<br><br>Check console for details.</div>';
        }
      }, 500);
    });

    // Auto-layout algorithm for mobile: hierarchical vertical flow
    function calculateMobileLayout(nodes, edges) {
      if (nodes.length === 0) return {};

      // Build adjacency map for graph traversal
      const incomingEdges = {};
      const outgoingEdges = {};
      nodes.forEach(node => {
        incomingEdges[node.id] = [];
        outgoingEdges[node.id] = [];
      });
      edges.forEach(edge => {
        if (incomingEdges[edge.target]) incomingEdges[edge.target].push(edge.source);
        if (outgoingEdges[edge.source]) outgoingEdges[edge.source].push(edge.target);
      });

      // Find entry points (nodes with no incoming edges)
      const entryPoints = nodes.filter(node => incomingEdges[node.id].length === 0);
      if (entryPoints.length === 0) {
        // No clear entry point - use first node
        entryPoints.push(nodes[0]);
      }

      // Calculate layer for each node (longest path from entry)
      const layers = {};
      const visited = new Set();

      function assignLayer(nodeId, layer) {
        if (!layers[nodeId] || layer > layers[nodeId]) {
          layers[nodeId] = layer;
        }
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        // Recursively assign layers to children
        outgoingEdges[nodeId].forEach(childId => {
          assignLayer(childId, layer + 1);
        });
      }

      // Start from entry points
      entryPoints.forEach(node => assignLayer(node.id, 0));

      // Handle orphaned nodes (not reached from entry points)
      nodes.forEach(node => {
        if (layers[node.id] === undefined) {
          layers[node.id] = 999; // Put at end
        }
      });

      // Group nodes by layer
      const layerGroups = {};
      Object.entries(layers).forEach(([nodeId, layer]) => {
        if (!layerGroups[layer]) layerGroups[layer] = [];
        layerGroups[layer].push(nodeId);
      });

      // Calculate positions
      const positions = {};
      const nodeWidth = 300;
      const nodeHeight = 140;
      const verticalSpacing = 180;
      const horizontalPadding = 37.5; // Center 300px nodes in 375px mobile viewport

      Object.entries(layerGroups).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([layer, nodeIds], layerIndex) => {
        const y = layerIndex * (nodeHeight + verticalSpacing) + 50; // Start 50px from top

        // Center nodes horizontally if multiple in same layer
        nodeIds.forEach((nodeId, index) => {
          const x = horizontalPadding + (index * (nodeWidth + 20)); // 20px gap between nodes in same layer
          positions[nodeId] = { x, y };
        });
      });

      return positions;
    }

    function renderCampaign() {
      const nodesContainer = document.getElementById('nodes');
      const connectionsContainer = document.getElementById('connections');

      // Calculate mobile-optimized layout for small screens
      const isMobile = window.innerWidth <= 600;
      const mobilePositions = isMobile ? calculateMobileLayout(campaignData.nodes, campaignData.edges) : null;

      // Render nodes
      campaignData.nodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = \`node node-\${node.type}\`;

        // Use mobile layout positions if on mobile, otherwise use original
        const position = mobilePositions && mobilePositions[node.id] ? mobilePositions[node.id] : node.position;
        nodeEl.style.left = \`\${position.x}px\`;
        nodeEl.style.top = \`\${position.y}px\`;
        nodeEl.onclick = () => showNodeDetails(node);

        // Store position for edge rendering
        node._renderPosition = position;

        const preview = getNodePreview(node);
        nodeEl.innerHTML = \`
          <div class="node-header">
            <span class="node-type-badge badge-\${node.type}">\${node.type}</span>
            <span class="node-label">\${node.data.label || node.id}</span>
          </div>
          <div class="node-preview">\${preview}</div>
        \`;

        nodesContainer.appendChild(nodeEl);
      });

      // Calculate SVG dimensions based on actual layout
      let svgWidth = 0;
      let svgHeight = 0;
      campaignData.nodes.forEach(node => {
        const pos = node._renderPosition;
        const nodeWidth = isMobile ? 300 : 200;
        const nodeHeight = isMobile ? 140 : 100;
        svgWidth = Math.max(svgWidth, pos.x + nodeWidth + 100);
        svgHeight = Math.max(svgHeight, pos.y + nodeHeight + 100);
      });

      // Set explicit SVG dimensions
      connectionsContainer.setAttribute('width', svgWidth);
      connectionsContainer.setAttribute('height', svgHeight);
      connectionsContainer.setAttribute('viewBox', \`0 0 \${svgWidth} \${svgHeight}\`);

      // Render connections
      const svgNS = "http://www.w3.org/2000/svg";
      const defs = document.createElementNS(svgNS, "defs");
      defs.innerHTML = \`
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#999" />
        </marker>
      \`;
      connectionsContainer.appendChild(defs);

      campaignData.edges.forEach(edge => {
        const sourceNode = campaignData.nodes.find(n => n.id === edge.source);
        const targetNode = campaignData.nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
          const path = document.createElementNS(svgNS, "path");

          // Use render position (mobile layout if mobile, otherwise original)
          const sourcePos = sourceNode._renderPosition;
          const targetPos = targetNode._renderPosition;

          // Calculate connection points (center bottom of source, center top of target)
          const nodeWidth = isMobile ? 300 : 200;
          const nodeHeight = isMobile ? 140 : 100;

          const x1 = sourcePos.x + nodeWidth / 2;
          const y1 = sourcePos.y + nodeHeight; // Bottom of source
          const x2 = targetPos.x + nodeWidth / 2;
          const y2 = targetPos.y; // Top of target

          // Curved path with control points
          const controlOffset = Math.abs(y2 - y1) * 0.5;
          const d = \`M \${x1} \${y1} C \${x1} \${y1 + controlOffset}, \${x2} \${y2 - controlOffset}, \${x2} \${y2}\`;

          path.setAttribute("d", d);
          path.setAttribute("class", "edge");
          path.setAttribute("marker-end", "url(#arrowhead)");
          connectionsContainer.appendChild(path);
        }
      });
    }

    function getNodePreview(node) {
      switch (node.type) {
        case 'email':
          return node.data.subject || 'No subject';
        case 'survey':
          const qCount = node.data.questions?.length || 0;
          return \`\${qCount} question\${qCount !== 1 ? 's' : ''}\`;
        case 'conditional':
          return node.data.condition || 'No condition set';
        case 'delay':
          return \`Wait \${node.data.delayDuration || 0} \${node.data.delayUnit || 'days'}\`;
        case 'action':
          return node.data.actionType || 'No action set';
        default:
          return '';
      }
    }

    function showNodeDetails(node) {
      try {
        console.log('Opening node:', node.id, node.type, node.data.label);
        const modal = document.getElementById('modalOverlay');
        const title = document.getElementById('modalTitle');
        const content = document.getElementById('modalContent');

        title.textContent = node.data.label || node.id;
        const htmlContent = renderNodeContent(node);
        console.log('Generated HTML length:', htmlContent.length);
        content.innerHTML = htmlContent;
        modal.classList.add('active');
        console.log('Modal opened successfully');
      } catch (error) {
        console.error('Error opening node details:', error);
        alert('Error opening node: ' + error.message + '\\n\\nNode: ' + node.id + '\\nType: ' + node.type);
      }
    }

    function renderNodeContent(node) {
      try {
        let html = '<div class="field">';
        html += '<div class="field-label">Node Type</div>';
        html += '<div class="field-value">' + escapeHtml(node.type.toUpperCase()) + '</div>';
        html += '</div>';

      if (node.data.description) {
        html += '<div class="field">';
        html += '<div class="field-label">Description</div>';
        html += '<div class="field-value">' + formatMarkdown(node.data.description) + '</div>';
        html += '</div>';
      }

      if (node.data.notes) {
        html += '<div class="field">';
        html += '<div class="field-label">Notes</div>';
        html += '<div class="field-value">' + formatMarkdown(node.data.notes) + '</div>';
        html += '</div>';
      }

      switch (node.type) {
        case 'email':
          if (node.data.subject) {
            html += '<div class="field">';
            html += '<div class="field-label">Subject</div>';
            html += '<div class="field-value">' + escapeHtml(node.data.subject) + '</div>';
            html += '</div>';
          }
          if (node.data.emailContent) {
            html += '<div class="field">';
            html += '<div class="field-label">Content</div>';
            html += '<div class="field-value">' + node.data.emailContent + '</div>';
            html += '</div>';
          }
          break;

        case 'survey':
          if (node.data.questions?.length) {
            html += '<div class="field"><div class="field-label">Questions</div>';
            node.data.questions.forEach((q, idx) => {
              html += '<div class="question-item">';
              html += '<div class="question-text">' + (idx + 1) + '. ' + escapeHtml(q.text) + '</div>';
              html += '<div style="font-size:11px; color:#666; margin-bottom:6px;">Type: ' + escapeHtml(q.questionType) + '</div>';
              if (q.responseOptions?.length) {
                q.responseOptions.forEach(opt => {
                  html += '<div class="option">• ' + escapeHtml(opt.text) + '</div>';
                });
              }
              html += '</div>';
            });
            html += '</div>';
          }
          break;

        case 'conditional':
          if (node.data.condition) {
            html += '<div class="field">';
            html += '<div class="field-label">Condition</div>';
            html += '<div class="field-value">' + formatMarkdown(node.data.condition) + '</div>';
            html += '</div>';
          }
          break;

        case 'delay':
          html += '<div class="field">';
          html += '<div class="field-label">Duration</div>';
          html += '<div class="field-value">' + escapeHtml(String(node.data.delayDuration || 0)) + ' ' + escapeHtml(node.data.delayUnit || 'days') + '</div>';
          html += '</div>';
          break;

        case 'action':
          if (node.data.actionType) {
            html += '<div class="field">';
            html += '<div class="field-label">Action Type</div>';
            html += '<div class="field-value">' + escapeHtml(node.data.actionType) + '</div>';
            html += '</div>';
          }
          if (node.data.actionDetails) {
            html += '<div class="field">';
            html += '<div class="field-label">Details</div>';
            html += '<div class="field-value">' + formatMarkdown(node.data.actionDetails) + '</div>';
            html += '</div>';
          }
          break;
      }

      // Show connections
      const outgoing = campaignData.edges.filter(e => e.source === node.id);
      const incoming = campaignData.edges.filter(e => e.target === node.id);

      if (outgoing.length || incoming.length) {
        html += '<div class="field"><div class="field-label">Connections</div>';
        if (incoming.length) {
          const fromNodes = incoming.map(e => {
            const n = campaignData.nodes.find(n => n.id === e.source);
            return escapeHtml(n?.data.label || e.source);
          }).join(', ');
          html += '<div style="font-size:12px; color:#666; margin-bottom:4px;">← From: ' + fromNodes + '</div>';
        }
        if (outgoing.length) {
          const toNodes = outgoing.map(e => {
            const n = campaignData.nodes.find(n => n.id === e.target);
            return escapeHtml(n?.data.label || e.target);
          }).join(', ');
          html += '<div style="font-size:12px; color:#666;">→ To: ' + toNodes + '</div>';
        }
        html += '</div>';
      }

      return html;
      } catch (error) {
        console.error('Error in renderNodeContent:', error, 'Node:', node);
        return '<div class="field"><div class="field-value" style="color:red;">Error rendering content: ' + error.message + '</div></div>';
      }
    }

    function stripHtml(html) {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    }

    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function formatMarkdown(text) {
      if (!text) return '';

      // Convert markdown to HTML - using string replace for special chars to avoid regex issues
      let html = text;

      // Bold: **text**
      while (html.indexOf('**') !== -1) {
        const start = html.indexOf('**');
        const end = html.indexOf('**', start + 2);
        if (end === -1) break;
        const before = html.substring(0, start);
        const content = html.substring(start + 2, end);
        const after = html.substring(end + 2);
        html = before + '<strong>' + content + '</strong>' + after;
      }

      // Links: [text](url)
      let linkStart = html.indexOf('[');
      while (linkStart !== -1) {
        const linkEnd = html.indexOf(']', linkStart);
        const parenStart = linkEnd !== -1 ? html.indexOf('(', linkEnd) : -1;
        const parenEnd = parenStart !== -1 ? html.indexOf(')', parenStart) : -1;
        if (linkEnd !== -1 && parenStart === linkEnd + 1 && parenEnd !== -1) {
          const before = html.substring(0, linkStart);
          const linkText = html.substring(linkStart + 1, linkEnd);
          const url = html.substring(parenStart + 1, parenEnd);
          const after = html.substring(parenEnd + 1);
          html = before + '<a href="' + url + '" target="_blank">' + linkText + '</a>' + after;
          linkStart = html.indexOf('[', linkStart + 1);
        } else {
          linkStart = html.indexOf('[', linkStart + 1);
        }
      }

      // Split by newlines to handle lists and paragraphs
      const lines = html.split(String.fromCharCode(10));
      const processedLines = [];
      let inList = false;
      let listType = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Numbered list: 1. item, 2. item, etc.
        const isNumberedList = line.length > 2 &&
          line.charAt(0) >= '0' && line.charAt(0) <= '9' &&
          line.charAt(1) === '.' && line.charAt(2) === ' ';

        if (isNumberedList) {
          if (!inList || listType !== 'ol') {
            if (inList) processedLines.push('</' + listType + '>');
            processedLines.push('<ol style="margin: 8px 0; padding-left: 20px;">');
            inList = true;
            listType = 'ol';
          }
          const content = line.substring(3); // Remove "1. "
          processedLines.push('<li style="margin: 4px 0;">' + content + '</li>');
        }
        // Bullet list: - item or * item
        else if ((line.charAt(0) === '-' || line.charAt(0) === '*') && line.charAt(1) === ' ') {
          if (!inList || listType !== 'ul') {
            if (inList) processedLines.push('</' + listType + '>');
            processedLines.push('<ul style="margin: 8px 0; padding-left: 20px;">');
            inList = true;
            listType = 'ul';
          }
          const content = line.substring(2); // Remove "- " or "* "
          processedLines.push('<li style="margin: 4px 0;">' + content + '</li>');
        }
        // Regular line
        else {
          if (inList) {
            processedLines.push('</' + listType + '>');
            inList = false;
            listType = null;
          }
          if (line) {
            processedLines.push('<p style="margin: 6px 0;">' + line + '</p>');
          }
        }
      }

      // Close any open list
      if (inList) {
        processedLines.push('</' + listType + '>');
      }

      return processedLines.join('');
    }

    function closeModal(event) {
      if (!event || event.target === document.getElementById('modalOverlay')) {
        document.getElementById('modalOverlay').classList.remove('active');
      }
    }

    // Pan & Zoom
    function updateTransform() {
      const canvas = document.getElementById('canvas');
      canvas.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${scale})\`;
      document.getElementById('zoomLevel').textContent = \`\${Math.round(scale * 100)}%\`;
    }

    function zoomIn() {
      const isMobile = window.innerWidth <= 600;
      const maxScale = isMobile ? 2.0 : 3.0;
      scale = Math.min(scale * 1.2, maxScale);
      updateTransform();
    }

    function zoomOut() {
      const isMobile = window.innerWidth <= 600;
      const minScale = isMobile ? 0.4 : 0.2;
      scale = Math.max(scale / 1.2, minScale);
      updateTransform();
    }

    function resetView() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
    }

    function fitToView() {
      const container = document.querySelector('.canvas-container');
      const nodes = campaignData.nodes;

      if (nodes.length === 0) return;

      const isMobile = window.innerWidth <= 600;
      const nodeWidth = isMobile ? 300 : 200;
      const nodeHeight = isMobile ? 140 : 100;

      // Use render positions (mobile layout or original)
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      nodes.forEach(node => {
        const pos = node._renderPosition || node.position;
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + nodeWidth);
        maxY = Math.max(maxY, pos.y + nodeHeight);
      });

      const width = maxX - minX;
      const height = maxY - minY;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (isMobile) {
        // Mobile: Start at 100% zoom (1.0) for readable nodes
        // Allow zooming from 40% to 200%
        scale = 1.0;
        // Center on first node horizontally, start at top
        translateX = (containerWidth - nodeWidth) / 2 - (nodes[0]._renderPosition?.x || nodes[0].position.x);
        translateY = 50; // Small top padding
      } else {
        // Desktop: Fit entire campaign to view
        const minScale = 0.3;
        const maxScale = 1;
        const calculatedScale = Math.min(containerWidth / width, containerHeight / height, maxScale) * 0.9;
        scale = Math.max(calculatedScale, minScale);

        translateX = (containerWidth - width * scale) / 2 - minX * scale;
        translateY = (containerHeight - height * scale) / 2 - minY * scale;
      }

      updateTransform();
    }

    // Touch & Mouse Events - Enhanced for mobile
    const canvas = document.getElementById('canvas');
    const container = document.querySelector('.canvas-container');
    let touchStartTime = 0;
    let hasMoved = false;
    let touchTarget = null;

    // Mouse events (desktop) - Allow drag on background, but not on nodes
    container.addEventListener('mousedown', (e) => {
      // Only start dragging if clicking on canvas/SVG/edges, not on nodes
      if (!e.target.closest('.node')) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        container.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      container.style.cursor = 'grab';
    });

    // Touch events (mobile) - Allow pan everywhere, distinguish from taps
    container.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      hasMoved = false;
      touchTarget = e.target;

      if (e.touches.length === 1) {
        // Single finger - prepare for pan (but might be a tap)
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
      } else if (e.touches.length === 2) {
        // Two fingers - definitely pinch zoom
        e.preventDefault();
        isDragging = false;
        lastTouchDistance = getTouchDistance(e.touches);
      }
    }, { passive: false });

    container.addEventListener('touchmove', (e) => {
      hasMoved = true;

      if (e.touches.length === 1) {
        // Single finger pan
        const moveDistance = Math.abs(e.touches[0].clientX - startX - translateX) +
                            Math.abs(e.touches[0].clientY - startY - translateY);

        // Only start panning if moved more than 10px (avoids accidental pans on taps)
        if (moveDistance > 10) {
          e.preventDefault();
          isDragging = true;
          translateX = e.touches[0].clientX - startX;
          translateY = e.touches[0].clientY - startY;
          updateTransform();
        }
      } else if (e.touches.length === 2) {
        // Pinch zoom
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        const delta = distance / lastTouchDistance;
        const isMobile = window.innerWidth <= 600;
        const minScale = isMobile ? 0.4 : 0.2;
        const maxScale = isMobile ? 2.0 : 3.0;
        scale = Math.max(minScale, Math.min(maxScale, scale * delta));
        lastTouchDistance = distance;
        updateTransform();
      }
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;

      // If touch was quick (<200ms) and didn't move much, treat as tap on node
      if (!hasMoved && touchDuration < 200 && touchTarget && touchTarget.closest('.node')) {
        const node = touchTarget.closest('.node');
        if (node && node.onclick) {
          node.onclick();
        }
      }

      isDragging = false;
      touchTarget = null;
    });

    function getTouchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // Mouse wheel zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const isMobile = window.innerWidth <= 600;
      const minScale = isMobile ? 0.4 : 0.2;
      const maxScale = isMobile ? 2.0 : 3.0;
      scale = Math.max(minScale, Math.min(maxScale, scale * delta));
      updateTransform();
    }, { passive: false });
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  saveAs(blob, filename);

  toast.success('Mobile viewer exported! Open on your phone to test.', { duration: 5000, icon: '📱' });
}
