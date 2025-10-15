import { saveAs } from 'file-saver'
import JSZip from 'jszip'
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
  saveAs(dataBlob, `${fileName}-${Date.now()}.json`)
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
  saveAs(dataBlob, `${campaignName}-selection-${Date.now()}.json`)
}

// Export all email nodes as MJML + HTML files in a ZIP
export const exportAllEmailsAsZip = async (nodes, campaignName = 'campaign') => {
  const zip = new JSZip()
  const emailNodes = nodes.filter(node => node.type === 'email')

  if (emailNodes.length === 0) {
    alert('No email nodes found in this campaign!')
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

  // Generate ZIP and download
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `${campaignName}-emails-${Date.now()}.zip`)
}

// Export single email node as MJML
export const exportSingleEmailHTML = (node) => {
  const fileName = sanitizeFileName(node.data.label || node.id)
  const mjmlContent = node.data.mjmlTemplate || generateBasicMJML(node.data)

  // Export as MJML file (user can convert at mjml.io)
  const mjmlBlob = new Blob([mjmlContent], { type: 'text/plain' })
  saveAs(mjmlBlob, `${fileName}.mjml`)

  alert('MJML file exported! Convert to HTML at https://mjml.io/try-it-live')
}

// Export campaign as interactive HTML viewer
export const exportAsInteractiveHTML = (nodes, edges, campaignName = 'campaign') => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaignName} - Campaign Flowchart</title>
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
  saveAs(htmlBlob, `${campaignName}-viewer-${Date.now()}.html`)
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
