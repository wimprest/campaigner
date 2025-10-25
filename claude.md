# Campaign Builder - Project Documentation

## Project Overview

A visual, drag-and-drop marketing campaign builder built with React and React Flow. Allows users to design email campaigns, surveys, conditional logic, and automated workflows through an intuitive flowchart interface.

**Target Users**: Marketing teams, campaign managers, and automation specialists who need to design complex customer journeys without coding.

**Current Phase**: Phase 6 Complete - Email Variables & Personalization (v0.8.0)

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
- **react-hot-toast** - Toast notification system for user feedback
- **react-markdown** - Markdown rendering for descriptions and notes
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
│   │   ├── BulkEmailImportDialog.jsx  # Bulk email import with preview
│   │   ├── SingleEmailImportDialog.jsx # Single email import for node updates
│   │   ├── VersionHistoryPanel.jsx    # Version history management panel
│   │   ├── VariablesManager.jsx # Campaign variables manager modal
│   │   ├── Sidebar.jsx          # Left-side node palette
│   │   └── TopBar.jsx           # Save/Load/Export/Versions/Variables menu
│   ├── utils/
│   │   ├── exportUtils.js       # JSON/HTML/ZIP export functions
│   │   ├── emailParser.js       # Email text format parser (bulk & single import)
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

## Current Features (Phase 2 & 3)

### 1. Flowchart Builder
- **Drag-and-drop** node creation from sidebar
- **5 node types**: Email, Survey, Conditional, Action, Delay
- **Visual connections** with colored paths and labels
- **Visual selection indicators** - Selected nodes display prominent colored ring, elevated shadow, and zoom effect for easy identification ⭐ NEW
- **Mini-map** for navigation of large campaigns
- **Pan & zoom** controls

### 2. Email Nodes
- **MJML template system** with 6 professional templates:
  - Blank, Welcome, Announcement, Survey, Promotional, Re-engagement
- **WYSIWYG editor** (ReactQuill) with Visual/Code toggle
- **Rich text formatting**: Headers, bold, italic, lists, colors, links, images
- **A/B/C Subject Line Testing** ⭐ NEW (v0.2.0)
  - Create 3 subject line variants (A, B, C)
  - Configure split percentages for each variant (default: 33/33/34%)
  - Color-coded tabbed interface (blue/green/purple)
  - Visual badge on nodes showing test status (e.g., "A/B/C Test 2/3")
  - Industry best practice: 1,500+ recipients per variant
- **Campaign Variables System** ⭐ NEW (v0.8.0)
  - Define campaign-level variables with name, default value, and description
  - **Insert Variable** dropdown in email editor (ContentPanel & EmailEditorModal)
  - Click-to-insert variables at cursor position: `{{ firstName }}`, `{{ company }}`
  - 8 common preset variables (firstName, lastName, email, company, phone, jobTitle, city, country)
  - **Preview mode** - See emails with variables replaced by default values
  - Purple-themed preview panel with Eye icon toggle
  - Variable validation (unique names, alphanumeric + underscore)
  - Teal "Variables" button in TopBar with count badge
  - localStorage persistence (`campaign-variables` key)
  - Toast notifications for all variable operations
- **Export formats**: MJML source, HTML (via external converter), metadata JSON
- **Email Import** ⭐ NEW (v0.6.0)
  - Import emails from formatted text (e.g., from Claude AI)
  - **Bulk import**: Create multiple email nodes at once from Open menu
  - **Single import**: Update existing email node with "Import" button
  - Structured format with delimiters (`=== EMAIL START ===` / `=== EMAIL END ===`)
  - Fields: TITLE, DESCRIPTION, SUBJECT_A/B/C, CONTENT, NOTES
  - **Markdown support**: Description and Notes fields support bullets, bold, numbered lists
  - **Live preview**: See formatted markdown before import (bulk only)
  - **A/B/C auto-configuration**: Automatic subject variant setup with weight distribution
  - **Sample file included**: `sample-bulk-emails.txt` shows proper format

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

### 4. Save/Open/Export ⭐ REDESIGNED (Phase 4)
- **Traditional File-Based Save** - "Save" button downloads JSON file (like Photoshop, Word)
  - Downloads campaign as JSON file you can keep, email, backup
  - Replaces old localStorage save button
  - Full campaign data with metadata (version, timestamps, node counts)
- **Auto-Save Draft** - Silent background saving to browser localStorage
  - Auto-saves every 500ms after changes (debounced)
  - Auto-loads on app start - no manual "Load from Storage" needed
  - Crash protection - never lose work
  - "Draft saved" indicator shows status and timestamp
- **Open File** - Load campaigns from JSON files
  - "Open" menu (renamed from "Load") with file picker
  - Import saved JSON campaigns
  - Load campaign templates (Welcome Series, Satisfaction Survey, Re-engagement)
- **Export Options**: ⭐ ENHANCED (v0.5.0)
  - **Export Selection**: Export only selected nodes as JSON (perfect for sharing partial campaigns or creating templates)
  - **Email ZIP export**: MJML files, HTML placeholders, metadata JSON with comprehensive manifest
  - **Interactive HTML viewer**: Standalone HTML file with all campaign data
  - **All exports use readable timestamps**: `campaign_name_2025-10-25_13-45-30.json` instead of Unix timestamps
  - **Comprehensive manifest.json** in email exports listing all files and conversion instructions
- **Import Merge Options**: ⭐ NEW (v0.5.0)
  - When importing to a non-empty canvas, choose **Replace** (clear current) or **Append** (add to existing)
  - Append mode automatically offsets imported nodes to avoid overlap
  - ID remapping prevents conflicts when appending campaigns

### 5. User Experience & Feedback ⭐ PHASE 4
- **Toast Notifications** - Modern, non-blocking notification system (react-hot-toast)
  - Success toasts: Green with checkmark (save, load, export operations)
  - Error toasts: Red with warning icon (validation errors, missing data)
  - Auto-dismisses after 3-5 seconds
  - Positioned at top-right corner
  - No more blocking browser alert() dialogs!
- **Visual Selection Indicators** - Colored rings around selected nodes (Phase 3)
- **Validation Warnings** - Clickable issue cards that open nodes for editing (Phase 3)

### 6. Version History ⭐ NEW (v0.7.0)
- **Save Named Versions** - Create snapshots of your campaign at any point
  - "History ▼" dropdown in TopBar (indigo) ⭐ UPDATED (v0.7.1)
  - "Save Current Version" menu item
  - Optional version naming (auto-generates if blank)
  - Stores full campaign state (nodes, edges, metadata)
  - Limit of 20 versions in localStorage (oldest auto-deleted)
- **Version Management Panel** - View and manage all saved versions
  - "View Version History" from History menu
  - Shows count in menu item (e.g., "5 versions saved")
  - Right-side modal panel with chronological version list
  - Metadata display: name, date, campaign name, node/edge counts
  - Sort by timestamp (newest first)
- **Draft Auto-Save Status** - Visible in History menu
  - Shows "Draft auto-save: ON ✓"
  - Displays last saved timestamp
  - Also shown in header for at-a-glance status
- **Version Operations**:
  - **Restore**: Load any previous version (replaces current work with confirmation)
  - **Export**: Download individual version as JSON file
  - **Delete**: Remove version from history (with confirmation)
  - **Export All**: Download all versions in single JSON file
- **localStorage Storage** - Versions stored separately from auto-save draft
  - Key: `campaign-versions`
  - Auto-loads on app start
  - Independent from draft auto-save
- **Use Cases**:
  - Experiment safely (save before major changes)
  - Track campaign evolution
  - Create backup points before client reviews
  - Compare different approaches
  - Roll back to previous state

### 7. Campaign Variables ⭐ NEW (v0.8.0)
- **Variables Manager Modal** - Central management for campaign-level variables
  - Accessed via teal "Variables" button in TopBar
  - Count badge shows number of defined variables
  - Clean modal UI with variable list and CRUD operations
- **Variable Management**:
  - **Add variables**: Name, default value, description fields
  - **Edit variables**: Click edit icon to modify existing variables
  - **Delete variables**: Remove with confirmation dialog
  - **Common presets**: One-click addition of 8 standard variables
    - firstName, lastName, email, company, phone, jobTitle, city, country
    - Disabled if already added (shows checkmark)
  - **Validation**: Name uniqueness, alphanumeric + underscore only
- **Email Editor Integration**:
  - "Insert Variable" dropdown (teal button with Variable icon)
  - Available in both ContentPanel and EmailEditorModal
  - Only shown in Visual edit mode (not Code mode)
  - Click variable to insert at cursor: `{{variableName}}`
  - Shows variable name, default value preview, and description
  - Dropdown positioned left-aligned to prevent panel cutoff
- **Preview Mode**:
  - "Preview" button (purple with Eye icon) appears when variables exist
  - Toggles between edit and preview modes
  - Shows email content with all variables replaced by default values
  - Purple-themed preview panel with clear indicator
  - Real-time regex replacement of `{{variableName}}` patterns
- **Data Storage**:
  - localStorage key: `campaign-variables`
  - Separate from campaign data and version history
  - Auto-loads on app start
  - Persists across sessions
- **Use Cases**:
  - Personalized email content: "Hi {{firstName}}"
  - Dynamic links: "Visit {{companyWebsite}}"
  - Location-specific content: "In {{city}}, {{country}}"
  - Preview before sending to verify personalization
  - Reusable across all email nodes in campaign

### 8. Data Models

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
  - Green ring selection indicator when node is being edited

### Node Components (EmailNode, ConditionalNode, ActionNode, DelayNode) ⭐ PHASE 3 UX
- **Visual Selection Indicators**: All 5 custom node components now display prominent visual feedback when selected
- **Implementation**: Uses React Flow's `selected` prop (automatically passed to custom nodes)
- **Styling**: Each node type uses its own thematic color for selection effects:
  - EmailNode: Blue ring (`ring-blue-500`)
  - SurveyNode: Green ring (`ring-green-500`)
  - ConditionalNode: Purple ring (`ring-purple-500`)
  - ActionNode: Orange ring (`ring-orange-500`)
  - DelayNode: Red ring (`ring-red-500`)
- **Effects applied**:
  - `ring-8 ring-{color}-500 ring-opacity-75` - Prominent colored ring around node (doubled thickness, increased opacity for better visibility)
  - `shadow-2xl` - Strong elevated shadow for clear depth perception
  - `scale-105` - 5% zoom effect
  - `transition-all` - Smooth transitions between states
- **Use case**: Makes it immediately obvious which node is being edited in ContentPanel, especially useful for:
  - Large campaigns with many nodes
  - When clicking validation issues that open nodes for editing
  - Quick visual feedback during node navigation

### `utils/emailParser.js` (NEW - v0.6.0)
- **Purpose**: Parse formatted email text into structured email objects
- **Functions**:
  - `parseBulkEmails(text)` - Main parser function that extracts emails from text
    - Returns `{ emails: [], errors: [] }` object
    - Parses all fields: TITLE, DESCRIPTION, SUBJECT_A/B/C, CONTENT, NOTES
    - Validates required fields (TITLE, SUBJECT_A, CONTENT)
    - Handles multiline content with regex
    - Trims whitespace from all fields
  - `convertEmailsToNodes(emails, startPosition, startId)` - Converts parsed emails to ReactFlow nodes
    - Creates email nodes with proper data structure
    - Auto-configures subject variants with weight distribution (33/33/34%)
    - Positions nodes vertically with 200px spacing
    - Remaps IDs to prevent conflicts
- **Format**: Uses delimiters (`=== EMAIL START ===` / `=== EMAIL END ===`)
- **Markdown**: Description and Notes fields preserve markdown for rendering
- **Usage**: Shared by both BulkEmailImportDialog and SingleEmailImportDialog

### `BulkEmailImportDialog.jsx` (NEW - v0.6.0)
- **Purpose**: Dialog for importing multiple emails at once to create new nodes
- **Features**:
  - Paste area for formatted email text
  - "Parse Emails" button validates and extracts data
  - Preview section with markdown rendering
  - Shows all parsed emails before import
  - Error display with helpful validation messages
  - Example format in collapsible section
  - Success toast on import
- **Workflow**:
  1. User pastes formatted text
  2. Click "Parse Emails" to validate
  3. Preview shows all emails with formatted markdown
  4. Click "Import X Emails" to create nodes
- **Accessible from**: Open menu → "Import Emails (Bulk)"
- **Use case**: Import campaign emails written by AI or copied from documents

### `SingleEmailImportDialog.jsx` (NEW - v0.6.0)
- **Purpose**: Dialog for importing one email to update an existing email node
- **Features**:
  - Simplified import flow (no preview)
  - Validates that exactly 1 email is provided
  - Shows helpful error if 0 or multiple emails detected
  - Directs user to bulk import if needed
  - Updates node data without creating new node
  - Example format in collapsible section
- **Workflow**:
  1. User pastes single formatted email
  2. Click "Import & Update" to validate and apply
  3. Node data updated with new content
  4. Success toast confirms import
- **Accessible from**: ContentPanel → Email section → "Import" button (green)
- **Use case**: Update existing email content from AI-generated text

### `VersionHistoryPanel.jsx` (NEW - v0.7.0)
- **Purpose**: Right-side modal panel for version history management
- **Features**:
  - Chronological list of saved versions (newest first)
  - Version metadata cards showing:
    - Version name, timestamp
    - Campaign name
    - Node count, edge count
  - "Latest" badge on most recent version
  - Action buttons per version:
    - **Restore** (purple) - Load version with confirmation
    - **Export** (blue) - Download as JSON file
    - **Delete** (red) - Remove with confirmation
  - **Export All Versions** button in footer (green)
  - Empty state with helpful instructions
  - Version count badge in header
- **Layout**:
  - Fixed right panel overlay (max-width: 2xl)
  - Backdrop with click-to-close
  - Scrollable version list
  - Sticky header and footer
- **Props**:
  - `isOpen`, `onClose`
  - `versions` array
  - `onRestore`, `onDelete`, `onExport`, `onExportAll` callbacks
- **Accessible from**: TopBar → "Versions" button (indigo with count badge)

### `VariablesManager.jsx` (NEW - v0.8.0)
- **Purpose**: Modal dialog for managing campaign-level variables
- **Features**:
  - CRUD operations: Create, read, update, delete variables
  - Variable fields: name, default value, description
  - 8 common preset variables with one-click addition
  - Preset status indicators (checkmark if already added)
  - Name validation (alphanumeric + underscore, must start with letter)
  - Duplicate name prevention
  - Toast notifications for all operations
  - Empty state with helpful instructions
  - Variable count display in header
- **Layout**:
  - Fixed center modal (max-width: 3xl)
  - Backdrop with click-to-close
  - Scrollable variable list
  - Add/Edit forms inline with buttons
- **Props**:
  - `isOpen`, `onClose`
  - `variables` array
  - `onUpdate` callback for variable changes
- **Data structure**:
  ```javascript
  {
    id: "1234567890",
    name: "firstName",
    defaultValue: "John",
    description: "Customer's first name"
  }
  ```
- **Accessible from**: TopBar → "Variables" button (teal with count badge)
- **Use case**: Define reusable personalization variables for email campaigns

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
1. **ContentPanel.jsx is too large** (~1500 lines) - should split into sub-components
2. **No TypeScript** - would help catch data structure errors
3. **Limited accessibility** - keyboard navigation not fully implemented
4. **No unit tests** - relying on manual testing
5. **Alert() for user feedback** - should replace with toast notifications

### MJML Workflow
- **Why not compile in browser?** MJML library is Node.js-only (uses file system APIs)
- **Current solution**: Export MJML files, users convert at mjml.io or via API
- **Future option**: Add backend service for server-side MJML compilation

## Next Planned Steps

### Phase 3: Testing & Simulation ✅ COMPLETE

#### 1. Survey Testing Modal ✅ COMPLETE
**Goal**: Let users simulate survey responses and see which path would be taken

**Implementation**:
- ✅ "Test Survey" button in ContentPanel for survey nodes
- ✅ Full-screen modal dialog showing all questions
- ✅ Interactive question inputs (radio, checkbox, text, range)
- ✅ Real-time path evaluation and highlighting
- ✅ Score calculation display
- ✅ "Additional Details" panel for "Other" text responses
- ✅ All path evaluation results with match reasons

**Files created/modified**:
- ✅ `ContentPanel.jsx` - Test button and modal integration
- ✅ `components/SurveyTestModal.jsx` - Complete testing interface
- ✅ Uses `simulateSurveyCompletion()` from `surveyLogic.js`

**Status**: Fully functional with hot reload

#### 2. Path Validation Warnings ✅ COMPLETE
**Goal**: Warn users about configuration issues

**Implementation**:
- ✅ Real-time validation on path configuration changes
- ✅ Warning badges showing total count at section header
- ✅ Detailed warnings for each path with issues:
  - Paths with no routing logic configured
  - Impossible AND combinations (multiple radio options from same question)
  - Invalid score ranges (min > max)
  - Conflicting logic (advanced rules + simple mapping priority warning)
- ✅ Yellow alert boxes with AlertTriangle icon
- ✅ Helpful, actionable warning messages

**Files modified**:
- ✅ `ContentPanel.jsx` - Validation state, useEffect, warning UI
- ✅ Imports `validateAllPaths()` from `surveyLogic.js`

**Visual elements**:
- Yellow badge with warning count in section header
- Expandable warning panel for each problematic path
- Clean, non-intrusive styling that matches app design

**Status**: Fully functional with hot reload

#### 3. Campaign Flow Validation ✅ COMPLETE
**Goal**: Detect issues in overall campaign structure

**Implementation**:
- ✅ Comprehensive graph analysis with BFS traversal
- ✅ Purple "Validate" button in TopBar
- ✅ Right-side modal panel with results
- ✅ Color-coded issues (Red=errors, Orange=warnings, Blue=info)
- ✅ Detects all major structural issues:
  - Orphaned nodes (not connected to anything)
  - Unreachable nodes (no path from entry points)
  - Dead ends (no outgoing connections - marked as info)
  - Missing required content (empty subjects, no questions, etc.)
  - Disconnected survey paths
  - Multiple entry points (marked as info)

**Files created/modified**:
- ✅ `utils/campaignValidation.js` - Graph analysis & validation logic
- ✅ `components/ValidationPanel.jsx` - Results display modal
- ✅ `App.jsx` - Validation state and handler
- ✅ `TopBar.jsx` - Validate button (purple)

**Visual design**:
- Summary cards showing error/warning/info counts
- Grouped issues by severity
- Type badges (e.g., "Orphaned Node", "Missing Content")
- **Bold node labels + unique node IDs** for clear identification
- **Clickable issues** - Click any issue to open that node for editing
- Hover effects (scale + shadow) indicate interactivity
- Tooltip: "Click to open this node for editing"
- Auto-closes validation panel when issue clicked
- Empty state messages for perfect campaigns

**Status**: Fully functional with hot reload

### Phase 4: UX Polish & Professional Features

#### 1. Replace alert() with Toast Notifications ✅ COMPLETE
**Library**: react-hot-toast (lightweight, 14 alerts replaced)
**Changes**: All `alert()` calls replaced in:
- App.jsx (8 alerts) - Save, load, import, export, template operations
- ContentPanel.jsx (1 alert) - Node updates
- EmailEditorModal.jsx (3 alerts) - Template management
- exportUtils.js (2 alerts) - Export operations
**Features**:
- Success toasts: Green with checkmark icon
- Error toasts: Red with warning icon
- Auto-dismiss after 3-5 seconds
- Top-right positioning
- Non-blocking, can show multiple toasts
- Custom duration for longer messages (5s for MJML export instructions)

#### 2. Node Duplication ✅ COMPLETE
**Features**:
- Duplicate button in ContentPanel (green button between Save and Delete)
- Keyboard shortcut: **Ctrl+D** (Windows/Linux) or **Cmd+D** (Mac)
- Deep clone of all node data including complex structures
- Smart ID regeneration for survey questions, options, paths, and rules
- Label automatically updated with "(Copy)" suffix
- Offset positioning (+50px x, +50px y) for easy identification
- Toast notification confirms duplication
- Works with all 5 node types
**Use case**: Quickly create similar emails or surveys without rebuilding from scratch
**Implementation**: 130-line duplicate function in App.jsx handles complex ID remapping for survey nodes

#### 3. Bulk Operations ✅ COMPLETE
**Features**:
- **Multi-select**: Shift+Drag to draw selection box around nodes (partial overlap selects)
- **Additive selection**: Shift+Click to add/remove nodes from current selection
- **Select all**: Ctrl+A or Cmd+A to select all nodes at once
- **Bulk duplication**: Duplicate multiple selected nodes with one keystroke (Ctrl+D)
- **Bulk deletion**: Delete key removes all selected nodes (built-in React Flow feature)
- **Visual feedback**: Bottom-left tooltip shows keyboard shortcuts and instructions
- **Smart positioning**: Duplicated nodes offset by +50px x/y for easy identification
**Implementation**:
- React Flow's built-in multi-select props (`selectionOnDrag`, `panOnDrag`, `selectionKeyCode="Shift"`)
- Pan still works with normal drag - selection requires Shift modifier
- Refactored handleDuplicateNode to check for multiple selected nodes
- Toast notifications confirm bulk actions (e.g., "3 nodes duplicated!")
**Use case**:
- Quickly duplicate multiple survey or email nodes for A/B testing variants
- Delete multiple test nodes at once during campaign cleanup
- Select entire campaign section for visual review

#### 4. Search & Filter ✅ COMPLETE
**Features**:
- **Search bar**: Text input in TopBar to search across all node content
- **Node type filter**: Dropdown to filter by Email, Survey, Conditional, Action, or Delay
- **Visual highlighting**: Non-matching nodes dimmed to 20% opacity with smooth transition
- **Results counter**: Shows "X of Y" nodes matching current filters
- **Clear filters**: X button to reset search and filter to defaults
- **Smart search**: Searches across multiple fields per node type

**Search Coverage by Node Type**:
- **All nodes**: Label, description
- **Email**: Subject (including A/B/C variants), email content
- **Survey**: Question text, response path labels
- **Conditional**: Condition text
- **Action**: Action type

**Visual Design**:
- Search input with magnifying glass icon
- Type filter dropdown (select element)
- Results count appears when filters active
- Clear button (X icon) removes all filters
- Smooth opacity transitions (0.2s ease)
- Centered in TopBar between left and right sections

**Implementation**:
- `nodeMatchesFilter()` callback checks search term and type
- Real-time filtering on every keystroke
- Case-insensitive search with `.toLowerCase()`
- Nodes mapped with opacity style based on match status
- Clear filters resets searchTerm to '' and nodeTypeFilter to 'all'

**Use cases**:
- Find specific email by subject line in large campaign
- Locate all survey nodes for review
- Search for nodes containing specific keywords
- Filter to show only conditional logic for debugging
- Quickly identify nodes needing attention

#### 5. Version History ✅ COMPLETE (v0.7.0)
**Implemented Features**:
- ✅ Save named versions manually with "Save Version" button
- ✅ Version management panel (right-side modal)
- ✅ Restore any previous version
- ✅ Delete old versions
- ✅ Export individual versions as JSON
- ✅ Export all versions in single file
- ✅ Limit to last 20 versions (auto-cleanup)
- ✅ localStorage storage separate from draft
- ✅ Auto-load on app start
- ✅ Metadata display (name, date, node/edge counts)

**Not Implemented** (future enhancements):
- Side-by-side version comparison
- Diff highlighting (show changes between versions)
- Auto-versioning on major changes

**Difficulty**: Medium (implemented in ~40 minutes)
**Status**: Fully functional and integrated

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

### Phase 8: Mobile Support

#### 1. Mobile Campaign Viewer (View-Only) ⭐ PLANNED
**Goal**: Enable sharing campaigns for mobile viewing without editing capability
**User Story**: "I'd like to be able to share a .json file via email and have someone be able to view and click around to see node contents even if they can't edit"

**Features**:
- **View-only mode**: Touch-friendly interface for viewing campaign flowcharts
- **Node inspection**: Tap nodes to view full content (emails, survey questions, logic)
- **Pan & zoom**: Touch gestures for navigation (pinch-to-zoom, two-finger pan)
- **JSON import**: Load campaign files shared via email/cloud
- **Responsive layout**: Optimized for phone and tablet screens
- **No editing**: All modification controls hidden in view-only mode
- **Share button**: Generate shareable links or QR codes (if backend added)

**Implementation Approach**:
1. **Easy Path** (Static export):
   - Generate standalone mobile-optimized HTML file
   - Include touch-friendly CSS and gestures
   - Single file can be emailed or hosted
   - No server required

2. **Medium Path** (Progressive Web App):
   - Add mobile viewport and touch handlers
   - Detect mobile device and switch to view-only mode
   - Service worker for offline viewing
   - Install as app on mobile home screen

3. **Advanced Path** (Dedicated mobile app):
   - React Native or Flutter companion app
   - Native file handling and sharing
   - Deep linking from email attachments
   - Push notifications for campaign updates

**Recommended**: Start with Easy Path (mobile-optimized HTML export), upgrade to PWA if adoption grows

**Difficulty**: Easy (mobile HTML export) / Medium (PWA with touch gestures) / Hard (native mobile app)

**Priority**: User-requested feature for campaign sharing and collaboration

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
- **v0.3.0** (Phase 3 - Testing & Validation): Survey testing modal with real-time path evaluation, path validation warnings (per-path & unmapped options), "Other" text input for survey options, comprehensive campaign flow validation with graph analysis, clickable validation issues to open nodes, visual selection indicators (colored rings) on all node types
- **v0.4.0** (Phase 4 - UX Polish): Toast notifications system (react-hot-toast), replaced all 14 browser alert() dialogs with modern, non-blocking toasts for save/load/export/error feedback
- **v0.4.1** (Phase 4 - Node Duplication): One-click node duplication with Duplicate button and Ctrl+D/Cmd+D shortcut, smart ID regeneration for complex survey nodes, automatic label updating with "(Copy)" suffix
- **v0.4.2** (Phase 4 - Bulk Operations): Multi-select with Shift+Drag selection box, Shift+Click additive selection, Ctrl+A select all, bulk duplication and deletion, visual keyboard shortcut tooltip, enhanced selection indicators (ring-8, opacity-75, shadow-2xl)
- **v0.4.3** (Phase 4 - Save/Open UX Redesign): Traditional file-based save pattern, "Save" button downloads JSON file, auto-save draft to localStorage every 500ms, auto-load draft on app start, "Draft saved" indicator with timestamp, "Load" renamed to "Open", removed "Load from Browser Storage" option (auto-loads now), simplified Export menu (removed "Export as JSON" - now main Save button), "Clear" also clears localStorage draft
- **v0.4.4** (Phase 4 - Search & Filter): Real-time search bar with magnifying glass icon, node type filter dropdown (All/Email/Survey/Conditional/Action/Delay), visual highlighting with 20% opacity for non-matching nodes, results counter showing "X of Y" nodes, clear filters button, smart search across node labels, descriptions, email subjects/content, survey questions/paths, conditional text, and action types
- **v0.5.0** (Export Improvements): Readable timestamp filenames (`campaign_name_2025-10-25_13-45-30.json` instead of Unix timestamps), Export Selection feature to export only selected nodes as JSON, Import Merge Dialog with Replace/Append options, smart ID remapping and automatic node offsetting in append mode, comprehensive manifest.json in email ZIP exports listing all files and conversion instructions, toast notifications for all export operations with success messages
- **v0.6.0** (Email Import Features): Bulk email import from formatted text (Open menu → "Import Emails (Bulk)"), single email import to update existing nodes ("Import" button in ContentPanel), structured text format with delimiters (`=== EMAIL START ===`), automatic A/B/C subject variant configuration, markdown support in Description and Notes fields with live preview, react-markdown library for rendering, emailParser.js utility with parseBulkEmails() and convertEmailsToNodes(), BulkEmailImportDialog with preview, SingleEmailImportDialog for node updates, sample-bulk-emails.txt example file showing proper format
- **v0.7.0** (Version History): Manual version saving with "Save Version" button (indigo), VersionHistoryPanel component with right-side modal layout, version management operations (restore, export, delete, export all), localStorage storage separate from draft (`campaign-versions` key), auto-load versions on app start, limit of 20 versions with automatic cleanup, version metadata display (name, timestamp, campaign name, node/edge counts), chronological sorting (newest first), "Latest" badge on most recent version, confirmation dialogs for destructive operations, toast notifications for all version operations, "Versions" button with count badge in TopBar
- **v0.7.1** (UI Consolidation): Consolidated version buttons into "History" dropdown menu to reduce toolbar clutter, combined "Save Version" and "Versions" buttons into single dropdown with two menu items ("Save Current Version", "View Version History"), added draft auto-save status display in History menu (shows "Draft auto-save: ON ✓" and last saved timestamp), version count badge moved to menu item instead of button, cleaner TopBar layout with 5 main buttons instead of 7, improved scalability for narrow windows
- **v0.8.0** (Phase 6 - Campaign Variables): Complete variable management system for email personalization. VariablesManager.jsx component (395 lines) with CRUD operations, 8 common preset variables (firstName, lastName, email, company, phone, jobTitle, city, country), variable validation (unique names, alphanumeric + underscore). Email editor integration with "Insert Variable" dropdown in both ContentPanel and EmailEditorModal (click-to-insert at cursor position). Preview mode with Eye icon toggle to see emails with variables replaced by default values (purple-themed preview panel). Teal "Variables" button in TopBar with count badge. localStorage persistence (`campaign-variables` key) with auto-load on app start. Toast notifications for all variable operations. Real-time regex variable replacement in preview mode.

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

1. **ContentPanel.jsx is the brain** - Most complex logic lives here (~1500+ lines)
2. **Survey logic is 3-tiered** - Simple mapping, score-based, advanced rules (priority order)
3. **MJML stays as code** - No browser compilation, export for external conversion
4. **localStorage is single source of truth** - No backend (yet)
5. **ReactQuill handles WYSIWYG** - Already installed and working
6. **surveyLogic.js fully integrated** - Evaluation engine powers testing modal and validation warnings
7. **campaignValidation.js for graph analysis** - BFS traversal, orphaned nodes, unreachable paths
8. **Triple validation system** - Survey paths + Unmapped options + Campaign structure
9. **Phase 3 complete** - Testing, validation, and quality assurance features all working
10. **Next focus: Phase 4 UX polish** - Toast notifications, node duplication, search & filter

---

**Last Updated**: 2025-10-25 (v0.8.0 - Campaign Variables)
**Project**: Campaign Builder
**Status**: Active Development - Phase 6 Complete, Ready for Backend Integration
