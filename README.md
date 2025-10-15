# Campaign Flowchart Builder - Phase 2 Complete ✨

A visual, drag-and-drop marketing campaign builder for designing email campaigns, surveys, conditional logic, and automated workflows through an intuitive flowchart interface.

**Target Users**: Marketing teams, campaign managers, and automation specialists

## 🎯 Features (Phase 2 Complete)

### Visual Flowchart Builder
- **Drag-and-drop** canvas using React Flow
- **5 Node Types**: Email, Survey, Conditional, Action, Delay
- **Visual connections** with colored paths and labels
- **Pan & zoom** controls with minimap
- **Undo/Redo** functionality (Ctrl+Z / Ctrl+Y)
- **Delete nodes/edges** (Delete/Backspace key)

### Email Campaigns
- **6 MJML Templates**: Blank, Welcome, Announcement, Survey, Promotional, Re-engagement
- **WYSIWYG Editor** (ReactQuill) with Visual/Code toggle
- **Rich text formatting**: Headers, bold, italic, lists, colors, links, images
- **A/B/C Subject Line Testing** ⭐ NEW
  - Create 3 subject line variants
  - Configure split percentages (default: 33/33/34%)
  - Color-coded interface (blue/green/purple)
  - Visual badges showing test status
- **Variable support**: `{{ firstName }}`, `{{ ctaLink }}`
- **Expandable editor modal** for full-screen editing

### Advanced Survey System
- **Multi-question surveys** with collapsible UI
- **4 Question Types**:
  - Radio (single choice)
  - Checkbox (multiple choice)
  - Text input
  - Numeric range
- **4 Routing Methods**:
  1. **Simple mapping** - Map specific options to paths
  2. **Score-based routing** - Assign points, route by total score
  3. **Numeric range routing** ⭐ NEW - Route by numeric values (≤, ≥, =, between)
  4. **Advanced AND/OR/NOT logic** - Complex multi-option conditions

#### Numeric Range Routing Example
```
Question: "How many documents do you process monthly?"
- Path 1: response ≤ 100
- Path 2: response between 101-500
- Path 3: response ≥ 501
```

### Save/Load/Export
- **Browser localStorage** for quick persistence
- **JSON import/export** with metadata
- **Email ZIP export**: MJML files, HTML placeholders, metadata
- **Interactive HTML viewer**: Standalone campaign viewer
- **Template library**: 3 pre-built campaigns (Welcome Series, Satisfaction Survey, Re-engagement)
- **Campaign naming** - Save campaigns with custom names

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# Opens at http://localhost:3002
```

### Build
```bash
npm run build
```

## 📖 Usage Guide

### Creating Your First Campaign

1. **Add Email Node**
   - Drag "Email" from sidebar to canvas
   - Click node to open editor
   - Choose MJML template or start blank
   - Add subject line variants (A/B/C testing)
   - Write email content with WYSIWYG editor

2. **Add Survey Node**
   - Drag "Survey" from sidebar
   - Click to add questions
   - Choose question type (radio, checkbox, text, range)
   - Add response options
   - Configure routing paths

3. **Configure Survey Routing**
   - **Simple**: Check boxes to map options to paths
   - **Score-based**: Assign points to options, set score thresholds
   - **Range routing**: For numeric questions, set value ranges
   - **Advanced**: Use AND/OR/NOT logic for complex rules

4. **Connect Nodes**
   - Drag from output handle (bottom) to input handle (top)
   - Survey nodes show multiple colored outputs (one per path)

5. **Save & Export**
   - Click "Save" to store in browser
   - Use "Export" menu for JSON, HTML, or Email ZIP

### Keyboard Shortcuts

- **Ctrl+Z** / **Ctrl+Y** - Undo / Redo
- **Delete** / **Backspace** - Delete selected node or edge
- **Mouse Wheel** - Zoom in/out
- **Click + Drag** - Pan canvas

## 🏗️ Tech Stack

- **React 18** - UI framework with hooks
- **Vite** - Build tool and dev server
- **React Flow 11** - Flowchart visualization
- **Tailwind CSS** - Utility-first styling
- **ReactQuill** - WYSIWYG rich text editor
- **MJML** - Email template framework
- **JSZip** - ZIP file creation
- **Lucide React** - Icon library

## 📂 Project Structure

```
campaign/
├── src/
│   ├── components/
│   │   ├── nodes/              # 5 custom node components
│   │   ├── ContentPanel.jsx    # Main editor (1400+ lines)
│   │   ├── EmailEditorModal.jsx # Full-screen email editor
│   │   ├── Sidebar.jsx         # Node palette
│   │   └── TopBar.jsx          # Save/Load/Export menu
│   ├── utils/
│   │   ├── exportUtils.js      # JSON/HTML/ZIP exports
│   │   ├── emailTemplates.js   # 6 MJML templates
│   │   ├── campaignTemplates.js # 3 pre-built campaigns
│   │   └── surveyLogic.js      # Path evaluation engine
│   ├── App.jsx                 # Main app & data models
│   └── main.jsx                # React entry point
├── Claude.md                   # Detailed technical docs
└── package.json
```

## 📚 Documentation

For detailed technical documentation, architecture decisions, and development guidelines, see [Claude.md](./Claude.md).

## 🔄 Data Models

### Email Node Structure
```javascript
{
  label: "Welcome Email",
  subjectVariants: [
    { id: "A", subject: "Welcome!", weight: 33 },
    { id: "B", subject: "Get started", weight: 33 },
    { id: "C", subject: "Your account is ready", weight: 34 }
  ],
  emailTemplate: "welcome",
  mjmlTemplate: "<mjml>...</mjml>",
  emailContent: "<p>Rich text...</p>"
}
```

### Survey Node with Range Routing
```javascript
{
  questions: [
    {
      id: "q_1",
      text: "Documents per month?",
      questionType: "range",
      responseOptions: []
    }
  ],
  responsePaths: [
    {
      id: "path_1",
      label: "Small Volume",
      rangeConditions: [
        {
          questionId: "q_1",
          operator: "lte",  // ≤, ≥, =, between
          value: 100
        }
      ]
    }
  ]
}
```

## 🧪 Testing Checklist

When making changes, verify:

- [ ] Can create all 5 node types
- [ ] Can connect nodes with edges
- [ ] Can edit node content
- [ ] A/B/C subject variants work
- [ ] Numeric range routing configures correctly
- [ ] Score calculation updates properly
- [ ] Can save/load from localStorage
- [ ] JSON export/import works
- [ ] Email ZIP export includes MJML files
- [ ] Interactive HTML viewer displays correctly
- [ ] Undo/Redo functions properly
- [ ] Delete key removes nodes/edges

## 🐛 Troubleshooting

**Nodes won't connect?**
- Drag from output handle (bottom circle) to input handle (top circle)

**Survey paths not showing?**
- Click "Add Path" in response paths section
- At least one path required for survey nodes

**A/B testing not visible?**
- Check that subjectVariants array exists in node data
- Try clicking each variant tab (A, B, C)

**Range routing not appearing?**
- Only shows when survey has range-type questions
- Add a "Numeric Range" question first

**Save not persisting?**
- Check browser localStorage is enabled
- Use Export → JSON for permanent backups

**EBUSY warnings in Vite?**
- Harmless Windows/Dropbox file locking warnings
- Doesn't affect functionality

## 🎯 Next Steps (Phase 3 Planned)

- [ ] Survey testing modal (simulate responses)
- [ ] Validation warnings (detect configuration issues)
- [ ] Toast notifications (replace alert dialogs)
- [ ] Node duplication (Ctrl+D)
- [ ] Search & filter nodes
- [ ] Version history

## 🌟 Key Features

✅ **Multi-question surveys** with unlimited questions
✅ **Score-based routing** with point thresholds
✅ **Numeric range routing** for value-based decisions
✅ **Advanced AND/OR/NOT logic** for complex rules
✅ **A/B/C subject line testing** with split percentages
✅ **WYSIWYG email editor** with Visual/Code toggle
✅ **6 MJML email templates** (export-ready)
✅ **Undo/Redo** functionality
✅ **Import/Export** (JSON, HTML, Email ZIP)
✅ **Campaign templates** (3 pre-built flows)
✅ **LocalStorage persistence**

## 📄 License

MIT

---

**Version**: 0.2 (Phase 2 Complete)
**Last Updated**: October 15, 2025
**Status**: Active Development

Built with React Flow, Tailwind CSS, and MJML
