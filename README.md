# Campaign Flowchart Builder - MVP Phase 1

A web-based marketing campaign flowchart tool that allows you to visually design and manage campaign workflows.

## Features Implemented (Phase 1)

### Core Functionality
- **Visual Flowchart Builder**: Drag-and-drop canvas using React Flow
- **5 Node Types**:
  - Email Node - Design email campaigns
  - Survey Node - Create questions with multiple response options
  - Conditional Node - Add if/then branching logic
  - Action Node - Generic action triggers
  - Delay Node - Add time delays between steps

### Editing & Content
- **Click-to-Edit**: Click any node to open the content panel
- **Content Panel**: Edit node properties, content, and settings
- **Survey Logic**: Add/edit/remove response options for surveys
- **Rich Node Data**: Title, description, internal notes, and type-specific fields

### Data Management
- **Save/Load**: Persist campaigns to browser localStorage
- **JSON Export**: Download campaigns as JSON files
- **Clear Canvas**: Reset and start fresh

### UI/UX
- **Professional Interface**: Clean layout with sidebar, canvas, and editing panel
- **Zoom & Pan**: Full canvas navigation with controls
- **MiniMap**: Quick navigation for large flowcharts
- **Visual Connections**: Connect nodes to create workflow paths
- **Responsive Design**: Works well for client presentations

## Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
The application will open at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## How to Use

### Creating a Flowchart
1. **Drag Nodes**: Drag node types from the left sidebar onto the canvas
2. **Connect Nodes**: Click and drag from a node's handle (circle) to another node
3. **Edit Nodes**: Click any node to open the content panel on the right
4. **Save Changes**: Click "Save Changes" in the content panel after editing
5. **Save Campaign**: Click "Save" in the top bar to store in localStorage

### Node Types Explained

**Email Node (Blue)**
- Add email subject and content
- Perfect for email campaign steps

**Survey Node (Green)**
- Create questions with multiple response options
- Add or remove response options dynamically
- Use for collecting customer feedback

**Conditional Node (Purple)**
- Create if/then branching logic
- Define conditions and paths for true/false outcomes
- Has two output handles for branching

**Action Node (Orange)**
- Generic action trigger (e.g., "Update CRM", "Send SMS")
- Flexible for various campaign actions

**Delay Node (Red)**
- Add time delays (minutes, hours, days, weeks)
- Control pacing of campaign steps

### Saving & Loading

**Save to Browser**
- Click "Save" button - stores in localStorage
- Survives browser refresh
- One save slot per browser

**Load from Browser**
- Click "Load" button - restores last saved campaign

**Export as JSON**
- Click "Export JSON" - downloads campaign file
- Share with team or backup campaigns
- Future: Import functionality coming

**Clear Canvas**
- Click "Clear" button - removes all nodes
- Confirmation required

## Technical Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Flow 11** - Flowchart visualization
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Project Structure

```
campaign/
├── src/
│   ├── components/
│   │   ├── nodes/
│   │   │   ├── EmailNode.jsx
│   │   │   ├── SurveyNode.jsx
│   │   │   ├── ConditionalNode.jsx
│   │   │   ├── ActionNode.jsx
│   │   │   └── DelayNode.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   └── ContentPanel.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
└── package.json
```

## Next Steps (Phase 2 Planning)

- Rich text editor (React Quill) for email content
- File attachment support
- Import JSON campaigns
- Shareable URLs (view-only mode)
- Export as standalone HTML
- Auto-layout feature
- Enhanced branching visualization
- Multi-select and bulk operations
- Undo/Redo functionality
- Campaign templates

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development Notes

- Uses localStorage for persistence (no backend required)
- Unique node IDs generated sequentially
- React Flow handles zoom, pan, and node positioning
- Tailwind provides utility-first styling
- All components are functional with hooks

## Keyboard Shortcuts

- **Delete/Backspace**: Remove selected node or edge
- **Mouse Wheel**: Zoom in/out
- **Click + Drag**: Pan canvas
- **Shift + Click**: Multi-select (React Flow default)

## Troubleshooting

**Nodes won't connect?**
- Make sure you're dragging from output handle (bottom) to input handle (top)

**Content panel won't open?**
- Click directly on the node card (not the canvas)

**Can't see my nodes?**
- Use the MiniMap (bottom right) to navigate
- Click the "fit view" button in controls

**Save not working?**
- Check browser console for errors
- Ensure localStorage is enabled in browser settings

---

Built with React Flow and Tailwind CSS
