# Campaign Builder - Project Documentation

## Project Overview

A visual, drag-and-drop marketing campaign builder built with React and React Flow. Allows users to design email campaigns, surveys, conditional logic, and automated workflows through an intuitive flowchart interface.

**Target Users**: Marketing teams, campaign managers, and automation specialists who need to design complex customer journeys without coding.

**Current Phase**: Phase 2 Complete - Advanced Features (Survey Logic, WYSIWYG Editing, A/B Testing, Range Routing)

## Tech Stack

### Core Technologies
- **React 18** - UI framework with hooks
- **Vite** - Build tool and dev server
- **React Flow 11** - Flowchart visualization and node management
- **Tailwind CSS** - Utility-first styling

### Email & Export
- **MJML** - Email template framework (exports only, not browser-compiled)
- **ReactQuill** - WYSIWYG rich text editor
- **JSZip** - ZIP file creation for email exports
- **file-saver** - Browser file downloads

### Icons & UI
- **Lucide React** - Icon library
- **Custom node components** - 5 specialized node types

## Project Structure

```
campaign/
├── src/
│   ├── components/
│   │   ├── nodes/               # Custom React Flow nodes
│   │   │   ├── EmailNode.jsx    # Email campaign node
│   │   │   ├── SurveyNode.jsx   # Multi-question survey with conditional paths
│   │   │   ├── ConditionalNode.jsx  # Boolean branching
│   │   │   ├── ActionNode.jsx   # CRM/automation actions
│   │   │   └── DelayNode.jsx    # Time-based delays
│   │   ├── ContentPanel.jsx     # Right-side editor panel (CRITICAL FILE)
│   │   ├── EmailEditorModal.jsx # Full-screen email editor with template manager
│   │   ├── Sidebar.jsx          # Left-side node palette
│   │   └── TopBar.jsx           # Save/Load/Export menu
│   ├── utils/
│   │   ├── exportUtils.js       # JSON/HTML/ZIP export functions
│   │   ├── emailTemplates.js    # 6 MJML email templates
│   │   ├── campaignTemplates.js # 3 pre-built campaign flows
│   │   └── surveyLogic.js       # Survey path evaluation engine
│   ├── App.jsx                  # Main application & data models
│   └── main.jsx                 # React entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── claude.md                    # This file
```

## Current Features (Phase 2)

### 1. Flowchart Builder
- **Drag-and-drop** node creation from sidebar
- **5 node types**: Email, Survey, Conditional, Action, Delay
- **Visual connections** with colored paths and labels
- **Mini-map** for navigation of large campaigns
- **Pan & zoom** controls

### 2. Email Nodes
- **MJML template system** with 6 professional templates:
  - Blank, Welcome, Announcement, Survey, Promotional, Re-engagement
- **WYSIWYG editor** (ReactQuill) with Visual/Code toggle
- **Rich text formatting**: Headers, bold, italic, lists, colors, links, images
- **A/B/C Subject Line Testing** ⭐ NEW
  - Create 3 subject line variants (A, B, C)
  - Configure split percentages for each variant (default: 33/33/34%)
  - Color-coded tabbed interface (blue/green/purple)
  - Visual badge on nodes showing test status (e.g., "A/B/C Test 2/3")
  - Industry best practice: 1,500+ recipients per variant
- **Variable support**: `{{ firstName }}`, `{{ ctaLink }}`
- **Export formats**: MJML source, HTML (via external converter), metadata JSON

### 3. Survey Nodes (MOST COMPLEX)
- **Multi-question surveys** with collapsible UI
- **4 question types**: Radio (single choice), Checkbox (multiple), Text input, Numeric range
- **Response paths** with dynamic output handles
- **Conditional routing** with 4 methods:
  1. **Simple mapping**: Map specific options to paths
  2. **Score-based logic**: Assign points to options, route by total score
  3. **Numeric range routing**: Route based on numeric values (≤, ≥, =, between) ⭐ NEW
  4. **Advanced AND/OR/NOT rules**: Complex multi-option logic

#### Score-Based System
- Each response option has a `points` value (can be negative)
- Survey calculates min/max possible score range
- Paths have `scoreMin` and `scoreMax` thresholds
- Visual indicators: 🎯 badge on nodes with score routing

#### Numeric Range Routing ⭐ NEW
- For numeric range questions only
- **4 operators**:
  - `≤` Less than or equal to (single value)
  - `≥` Greater than or equal to (single value)
  - `=` Equal to (single value)
  - `between` Range with min/max values
- **Use case example**: Route based on document volume
  - Path 1: response ≤ 100
  - Path 2: response between 101-500
  - Path 3: response ≥ 501
- Live preview shows formatted conditions (e.g., "✓ 101 - 500 → Path 1")
- Multiple conditions per path supported

#### Advanced Logic Rules
- **AND logic**: Require ALL selected options
- **OR logic**: Require ANY of selected options
- **NOT logic**: Exclude if certain options selected
- Visual indicators: 🧠 badge on nodes with advanced rules
- Priority: Advanced rules > Numeric range routing > Score routing > Simple mapping

### 4. Save/Load/Export
- **Browser localStorage** for persistence
- **JSON export** with metadata (version, timestamps, node counts)
- **Email ZIP export**: MJML files, HTML placeholders, metadata JSON
- **Interactive HTML viewer**: Standalone HTML file with all campaign data
- **Template library**: 3 pre-built campaigns (Welcome Series, Satisfaction Survey, Re-engagement)

### 5. Data Models

#### Survey Node Data Structure
```javascript
{
  label: "Survey Title",
  description: "Optional description",
  questions: [
    {
      id: "q_1234567890",
      text: "How satisfied are you?",
      questionType: "radio",  // radio | checkbox | text | range
      responseOptions: [
        {
          id: "q_1234567890_opt_1",
          text: "Very satisfied",
          points: 10
        },
        {
          id: "q_1234567890_opt_2",
          text: "Somewhat satisfied",
          points: 5
        }
      ]
    }
  ],
  responsePaths: [
    {
      id: "path_1",
      label: "High Satisfaction",
      color: "#10b981",
      mappedOptions: ["q_1234567890_opt_1"],
      scoreMin: 8,
      scoreMax: 10,
      rangeConditions: [  // ⭐ NEW: For numeric range routing
        {
          id: "range_cond_1234567890",
          questionId: "q_1234567890",
          operator: "between",  // lte | gte | eq | between
          minValue: 101,
          maxValue: 500,
          value: null  // for single-value operators (lte, gte, eq)
        }
      ],
      advancedRules: {
        enabled: false,
        requireAll: [],   // AND logic
        requireAny: [],   // OR logic
        requireNone: []   // NOT logic
      }
    }
  ]
}
```

#### Email Node Data Structure
```javascript
{
  label: "Welcome Email",
  subject: "Welcome to our platform!",  // Legacy single subject (backward compatible)
  subjectVariants: [  // ⭐ NEW: A/B/C testing
    {
      id: "A",
      subject: "Welcome to our platform!",
      weight: 33  // Percentage split
    },
    {
      id: "B",
      subject: "Get started with your new account",
      weight: 33
    },
    {
      id: "C",
      subject: "Your account is ready!",
      weight: 34
    }
  ],
  emailTemplate: "welcome",  // Template key
  mjmlTemplate: "<mjml>...</mjml>",  // MJML source code
  emailContent: "<p>Rich text content...</p>",  // HTML from ReactQuill
  description: "Optional description",
  notes: "Internal notes"
}
```

## Key Files & Their Roles

### `App.jsx` (500+ lines)
- **Purpose**: Main application component, state management, data model definitions
- **Responsibilities**:
  - React Flow setup and configuration
  - Node/edge state management
  - Drag-and-drop handlers
  - Default data structures for each node type
  - Save/load/import/export functions
- **Critical function**: `getDefaultDataForType()` - Defines initial data structure for new nodes

### `ContentPanel.jsx` (1400+ lines) ⚠️ MOST COMPLEX FILE
- **Purpose**: Right-side editing panel for all node types
- **Responsibilities**:
  - Render type-specific editors for each node
  - Survey question/option/path management
  - ReactQuill WYSIWYG integration
  - Email template selection with quick "Manage" button (line 320-327) ⭐ NEW
  - A/B/C subject line testing UI
  - Score calculation logic
  - Numeric range routing UI
  - Advanced rules UI (AND/OR/NOT)
  - Opens EmailEditorModal for full-screen editing
- **Key sections**:
  - Lines 1-220: State & helper functions (including new range condition helpers)
  - Lines 220-460: Email editor (MJML + ReactQuill + A/B testing + Manage button)
  - Lines 460-1040: Survey editor (questions, paths, scoring, range routing, advanced rules)
  - Lines 1040-1140: Other node editors (conditional, delay, action)
- **Tips for editing**:
  - Survey logic is highly nested - use collapsible sections
  - Score calculation happens in `calculateScoreRange()` function
  - Path mapping uses checkbox UI with `toggleOptionInPath()` function
  - Range conditions managed via `addRangeCondition()`, `updateRangeCondition()`, `removeRangeCondition()`
  - Template management accessible via inline "Manage" button or "Expand Editor" button

### `utils/surveyLogic.js` (NEW - Phase 2)
- **Purpose**: Survey response evaluation engine
- **Functions**:
  - `calculateTotalScore()` - Sum points from selected options
  - `matchesScoreThreshold()` - Check if score falls in range
  - `evaluateAdvancedRules()` - Evaluate AND/OR/NOT logic
  - `determineResponsePath()` - Main routing function (priority order)
  - `validatePathConfiguration()` - Detect configuration issues
  - `simulateSurveyCompletion()` - Testing/debugging tool
- **Usage**: Not yet integrated into UI - ready for future "Test Survey" feature

### `utils/exportUtils.js`
- **Purpose**: All export functionality
- **Functions**:
  - `exportCampaignJSON()` - Full campaign export with metadata
  - `exportAllEmailsAsZip()` - MJML + HTML + metadata ZIP
  - `exportAsInteractiveHTML()` - Standalone viewer
  - `generateBasicMJML()` - Convert plain text to MJML
- **Important**: MJML compilation happens externally (mjml.io or API), not in browser

### `EmailEditorModal.jsx` (NEW - Phase 2)
- **Purpose**: Full-screen modal for email editing and template management
- **Features**:
  - Full-screen WYSIWYG email editor
  - Visual/Code toggle for MJML editing
  - Template manager with CRUD operations (line 256-268, 396-619)
  - Create, edit, delete custom templates
  - 6 default MJML templates (Welcome, Announcement, Survey, etc.)
  - Accessible via "Manage" button in ContentPanel (line 320) or "Expand Editor" button (line 539)
- **Key sections**:
  - Lines 1-50: State management and template functions
  - Lines 256-395: Main editor interface
  - Lines 396-619: Template manager UI

### `SurveyNode.jsx`
- **Purpose**: Visual representation of survey nodes in flowchart
- **Features**:
  - Shows first question preview
  - Displays all response paths with colors
  - Dynamic output handles (one per path)
  - Visual badges: 🎯 for score routing, 🧠 for advanced rules
  - Handle positioning calculated by `getHandlePosition()`

## Development Patterns & Conventions

### State Management
- **Local component state** (useState) for UI interactions
- **React Flow hooks** (useNodesState, useEdgesState) for flowchart data
- **localStorage** for persistence (no backend/database)
- **No global state library** (Redux, Zustand, etc.) - keeping it simple

### Data Flow
1. User drags node from Sidebar → `onDrop` in App.jsx
2. New node created with default data → `getDefaultDataForType()`
3. User clicks node → `onNodeClick` sets `selectedNode` state
4. ContentPanel renders with node data → `renderNodeSpecificFields()`
5. User edits in ContentPanel → local state (`localData`)
6. User clicks Save → `onUpdate()` callback updates App.jsx state
7. React Flow automatically persists visual changes (position, connections)

### ID Generation
- Nodes: `node_${id++}` (simple incrementing counter)
- Questions: `q_${Date.now()}` (timestamp-based)
- Options: `q_${questionId}_opt_${Date.now()}` (prefixed with question ID)
- Paths: `path_${Date.now()}` (timestamp-based)

**Why timestamps?** Ensures uniqueness even when adding/removing items rapidly.

### Styling Approach
- **Tailwind utility classes** for 95% of styling
- **Inline styles** for dynamic colors (path colors, badges)
- **CSS modules**: None - all Tailwind or inline
- **Global CSS**: Only for ReactQuill (imported from node_modules)

### Error Handling
- **Minimal error boundaries** - relying on React defaults
- **Validation**: Mostly UI-level (required fields, number inputs)
- **User feedback**: `alert()` for save confirmations (TODO: replace with toast notifications)

## Known Issues & Limitations

### Current Issues
1. ~~**Vite EBUSY warnings** on Windows/Dropbox~~ - **FIXED** (v0.2.1): Cache moved to system temp directory
2. **No toast notifications** - using browser `alert()` (works but not polished)
3. **No undo/redo** - users must manually save versions
4. **No collaborative editing** - single user, localStorage only

### Technical Debt
1. **ContentPanel.jsx is too large** (900 lines) - should split into sub-components
2. **No TypeScript** - would help catch data structure errors
3. **Limited accessibility** - keyboard navigation not fully implemented
4. **No unit tests** - relying on manual testing
5. **surveyLogic.js not integrated** - evaluation engine exists but not used in UI yet

### MJML Workflow
- **Why not compile in browser?** MJML library is Node.js-only (uses file system APIs)
- **Current solution**: Export MJML files, users convert at mjml.io or via API
- **Future option**: Add backend service for server-side MJML compilation

## Next Planned Steps

### Phase 3: Testing & Simulation (IMMEDIATE NEXT)

#### 1. Survey Testing Modal
**Goal**: Let users simulate survey responses and see which path would be taken

**Implementation**:
- Add "Test Survey" button in ContentPanel for survey nodes
- Modal dialog showing all questions
- User can select options as if completing survey
- Real-time path highlighting based on selections
- Use existing `surveyLogic.js` functions
- Show score calculation and matching logic

**Files to modify**:
- `ContentPanel.jsx` - Add test button and modal
- Create new `components/SurveyTestModal.jsx`
- Import and use `simulateSurveyCompletion()` from `surveyLogic.js`

**Difficulty**: Medium (4-6 hours)

#### 2. Path Validation Warnings
**Goal**: Warn users about configuration issues

**Implementation**:
- Run `validatePathConfiguration()` on path changes
- Show warning badges for:
  - Paths with no routing logic
  - Impossible AND combinations (multiple radio options from same question)
  - Score ranges that don't cover all possibilities
- Display warnings in ContentPanel with helpful tips

**Files to modify**:
- `ContentPanel.jsx` - Add validation UI
- Use `validateAllPaths()` from `surveyLogic.js`

**Difficulty**: Easy (2-3 hours)

#### 3. Campaign Flow Validation
**Goal**: Detect issues in overall campaign structure

**Features**:
- Orphaned nodes (not connected to anything)
- Dead ends (nodes with no outgoing connections except final nodes)
- Unreachable nodes (no path from start)
- Missing email subjects or content
- Survey paths with no destination node

**Files to create**:
- `utils/campaignValidation.js` - Flow analysis functions
- `components/ValidationPanel.jsx` - Results display

**Difficulty**: Medium (5-7 hours)

### Phase 4: UX Polish & Professional Features

#### 1. Replace alert() with Toast Notifications
**Library**: react-hot-toast or sonner (lightweight)
**Changes**: All `alert()` calls in App.jsx and ContentPanel.jsx

#### 2. Node Duplication
**Feature**: Right-click menu or Ctrl+D to duplicate nodes
**Use case**: Create similar emails or surveys quickly

#### 3. Bulk Operations
**Features**:
- Multi-select nodes (Shift+Click or drag selection box)
- Delete multiple nodes
- Export selected nodes only
- Group/ungroup nodes

#### 4. Search & Filter
**Features**:
- Search nodes by title or content
- Filter by node type
- Highlight search results on canvas

#### 5. Version History
**Features**:
- Save multiple versions in localStorage
- Load previous versions
- Compare versions side-by-side
- Export version history as JSON

### Phase 5: Backend Integration (Optional)

#### 1. API Server
**Tech stack suggestions**:
- Express.js or Fastify (Node.js)
- PostgreSQL or MongoDB for storage
- JWT authentication

**Endpoints needed**:
- `POST /campaigns` - Save campaign
- `GET /campaigns/:id` - Load campaign
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign
- `GET /campaigns` - List user's campaigns
- `POST /campaigns/:id/export` - Server-side MJML compilation

#### 2. MJML Compilation Service
**Purpose**: Convert MJML to HTML server-side
**Implementation**:
- Install `mjml` on backend (Node.js)
- Endpoint: `POST /mjml/compile`
- Input: MJML string
- Output: HTML string + any errors/warnings
- Replace export instructions with one-click HTML generation

#### 3. User Accounts & Sharing
**Features**:
- User registration/login
- Save campaigns to cloud
- Share campaigns with team (read-only or edit)
- Team templates library
- Role-based permissions

### Phase 6: Advanced Email Features

#### 1. Visual Email Template Builder
**Options** (from research):
- **Easy Email Editor** (open-source, MJML-based) - RECOMMENDED
- **Unlayer** (polished, paid plans for advanced features)
- **GrapeJS + MJML plugin** (maximum customization, more complex)

**Implementation approach**:
- Replace MJML code editor with drag-and-drop builder
- Keep existing template library as starting points
- Export both MJML and HTML
- See earlier conversation for detailed comparison

#### 2. Email Variables & Personalization
**Features**:
- Define campaign-level variables (firstName, company, etc.)
- Insert variables into email content with dropdown
- Preview with sample data
- Export variable mapping for ESP integration

#### 3. Enhance A/B Testing ✅ PARTIAL (Subject lines complete, body variants pending)
**Completed**:
- ✅ Subject line variants (A/B/C) with split percentages
- ✅ Color-coded tabbed interface
- ✅ Visual badges on nodes

**Future enhancements**:
- Create email body variants (not just subjects)
- Preview mode showing all variants side-by-side
- Winner selection and auto-rollout logic

### Phase 7: Integration Capabilities

#### 1. ESP Connectors
**Target platforms**:
- Mailchimp, SendGrid, Mailgun, AWS SES
- Export in platform-specific formats
- API key configuration (if backend added)

#### 2. CRM Integration
**Platforms**:
- HubSpot, Salesforce, Pipedrive
- Map action nodes to CRM operations
- Export workflow as CRM automation

#### 3. Webhook Support
**Features**:
- Configure webhooks for events (survey completion, email open, etc.)
- Test webhook delivery
- Export webhook configuration

## Development Guidelines

### When Adding New Features

1. **Start with data model** - Update default data in App.jsx `getDefaultDataForType()`
2. **Create/update node component** - Visual representation in `components/nodes/`
3. **Add editor UI** - Extend `ContentPanel.jsx` `renderNodeSpecificFields()`
4. **Update exports** - Ensure new data exports correctly in `exportUtils.js`
5. **Test save/load** - Verify localStorage roundtrip works
6. **Update this doc** - Keep claude.md current

### Code Style
- Use **functional components** with hooks (no class components)
- **Descriptive names**: `updateSurveyOption` not `updateOpt`
- **Extract complex logic** into utils/ functions
- **Comments for complex sections** (especially nested logic in ContentPanel)
- **Tailwind classes** in logical order: layout → spacing → colors → typography

### Git Workflow (if/when added)
- Main branch: `main` (stable releases)
- Feature branches: `feature/survey-testing`, `feature/toast-notifications`
- Commit messages: Conventional commits format
  - `feat: Add survey testing modal`
  - `fix: Correct score calculation for checkbox questions`
  - `docs: Update claude.md with Phase 3 plans`

## Testing Checklist (Manual)

When making changes, verify:

- [ ] Can create all 5 node types
- [ ] Can connect nodes with edges
- [ ] Can edit node content in ContentPanel
- [ ] Can save campaign to localStorage
- [ ] Can load campaign from localStorage
- [ ] Can export as JSON
- [ ] Can import JSON file
- [ ] Can export emails as ZIP
- [ ] Can export as interactive HTML
- [ ] Survey nodes show correct number of output handles
- [ ] Score calculation updates when changing points
- [ ] Advanced rules toggle works
- [ ] Visual/Code toggle in email editor works
- [ ] ReactQuill formatting persists on save
- [ ] MJML templates load correctly
- [ ] Template library campaigns load without errors

## Performance Considerations

### Current Performance
- **Small campaigns** (<50 nodes): Instant, no issues
- **Medium campaigns** (50-200 nodes): Smooth, occasional re-render lag
- **Large campaigns** (200+ nodes): React Flow handles well, but ContentPanel can be slow

### Optimization Opportunities (Future)
1. **Memoize expensive calculations** - `calculateScoreRange()` in ContentPanel
2. **Virtualize long lists** - Response option lists in survey paths
3. **Debounce text inputs** - Reduce re-renders while typing
4. **Code-split routes** - If adding multi-page app
5. **React.memo on node components** - Prevent unnecessary re-renders

## Resources & References

### Official Documentation
- React Flow: https://reactflow.dev/
- MJML: https://documentation.mjml.io/
- ReactQuill: https://github.com/zenoamaro/react-quill
- Tailwind CSS: https://tailwindcss.com/docs

### Useful Tools
- MJML Playground: https://mjml.io/try-it-live
- MJML API: https://mjml.io/api (for server-side compilation)
- React Flow Playground: https://reactflow.dev/playground

### Design Inspiration
- Mailchimp Customer Journeys
- HubSpot Workflows
- ActiveCampaign Automation
- Zapier Visual Editor

## Questions to Ask When Extending

### Adding New Node Types?
1. What data does it need to store?
2. What visual representation makes sense?
3. How many input/output handles?
4. What editor UI is needed in ContentPanel?
5. How should it export (JSON, HTML, etc.)?

### Adding New Survey Features?
1. Does it affect path routing logic?
2. Update `surveyLogic.js` evaluation functions?
3. Add visual indicators to SurveyNode?
4. Update export formats?
5. How to handle in validation?

### Adding Integrations?
1. Backend required or client-side?
2. API keys stored where (localStorage vs backend)?
3. Export format needed (JSON, CSV, API calls)?
4. Error handling strategy?
5. Rate limiting considerations?

## Deployment Considerations (Future)

### Static Hosting (Current - No Backend)
**Best options**:
- Vercel (recommended - zero config with Vite)
- Netlify
- GitHub Pages
- Cloudflare Pages

**Build command**: `npm run build`
**Output directory**: `dist/`

### Full-Stack Deployment (If Backend Added)
**Frontend**:
- Same as static hosting

**Backend options**:
- Railway, Render, Fly.io (Node.js)
- Vercel/Netlify Functions (serverless)
- AWS Elastic Beanstalk or ECS
- DigitalOcean App Platform

### Environment Variables
Currently none needed. Future variables:
- `VITE_API_URL` - Backend API endpoint
- `VITE_MJML_API_KEY` - MJML compilation service
- `VITE_ANALYTICS_ID` - Google Analytics, PostHog, etc.

## Support & Troubleshooting

### Common Issues

**Issue**: Blank page after loading
- **Cause**: Usually a JavaScript error in node rendering
- **Fix**: Check browser console, look for undefined data errors
- **Prevention**: Always provide default values in data models

**Issue**: "EBUSY: resource busy" warnings in Vite
- **Cause**: Windows/Dropbox file locking during HMR when cache is in synced folder
- **Impact**: Could cause 504 errors and white screen on load
- **Fix**: ✅ **RESOLVED in v0.2.1** - Vite cache now stored in system temp directory
  - Updated `vite.config.js` to use `path.join(tmpdir(), 'vite-cache-campaign')`
  - Cache location: `C:\Users\[username]\AppData\Local\Temp\vite-cache-campaign`
  - No longer conflicts with Dropbox sync
- **Legacy Fix**: If issue persists, move project outside Dropbox or disable sync temporarily

**Issue**: Survey paths not showing in node
- **Cause**: `responsePaths` array missing or empty in data
- **Fix**: Check that paths were created in ContentPanel
- **Prevention**: Default data in App.jsx should include at least 2 paths

**Issue**: WYSIWYG content not saving
- **Cause**: ReactQuill returns HTML string, might conflict with MJML
- **Fix**: Store in `emailContent` field (separate from `mjmlTemplate`)
- **Note**: Visual and Code modes share same data, changes sync immediately

### Debug Mode
To add debug logging (optional future feature):
1. Add `window.DEBUG = true` in browser console
2. Wrap console.logs: `if (window.DEBUG) console.log(...)`
3. Log critical data flow points:
   - Node creation
   - Path routing evaluation
   - Save/load operations
   - Export generation

## Version History

- **v0.1** (Phase 1): Basic flowchart, 5 node types, save/load, simple surveys
- **v0.2** (Phase 2): Multi-question surveys, score-based routing, advanced AND/OR/NOT logic, WYSIWYG email editor, A/B/C subject line testing, numeric range routing
- **v0.2.1** (Bug Fixes & UX): Fixed Vite EBUSY errors by moving cache to system temp, added quick "Manage" button in email template section
- **v0.3** (Planned): Survey testing, validation warnings, UX polish

---

## Quick Start for New Developers

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser to http://localhost:3000

# Try these actions:
1. Drag an Email node from sidebar to canvas
2. Click the node to open ContentPanel
3. Try the Visual/Code toggle in email content
4. Drag a Survey node
5. Click Survey node, add questions and paths
6. Try score-based routing or advanced logic
7. Connect nodes by dragging from output to input handles
8. Save campaign (top bar)
9. Export as HTML to see standalone viewer
```

## Key Takeaways

1. **ContentPanel.jsx is the brain** - Most complex logic lives here
2. **Survey logic is 3-tiered** - Simple mapping, score-based, advanced rules (priority order)
3. **MJML stays as code** - No browser compilation, export for external conversion
4. **localStorage is single source of truth** - No backend (yet)
5. **ReactQuill handles WYSIWYG** - Already installed and working
6. **surveyLogic.js is ready** - Evaluation engine exists, needs UI integration
7. **Next focus: Testing & validation** - Help users build correct campaigns

---

**Last Updated**: 2025-10-22 (v0.2.1 - Vite Cache Fix & Template Management UX)
**Project**: Campaign Builder
**Status**: Active Development
