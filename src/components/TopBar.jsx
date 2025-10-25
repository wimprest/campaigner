import React, { useState, useRef } from 'react'
import { Save, Upload, Download, Trash2, ChevronDown, FileJson, Mail, Globe, FolderOpen, CheckCircle, Search, X, Filter, FileCheck, Clock } from 'lucide-react'

export default function TopBar({
  campaignName,
  onCampaignNameChange,
  onSave,
  onImport,
  onLoadTemplate,
  onOpenBulkImport,
  onExportEmails,
  onExportHTML,
  onExportSelection,
  onClear,
  onValidate,
  onOpenVersionHistory,
  onSaveVersion,
  versionsCount,
  saveStatus,
  lastSaved,
  searchTerm,
  onSearchChange,
  nodeTypeFilter,
  onFilterChange,
  onClearFilters,
  matchingNodesCount,
  totalNodesCount
}) {
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showOpenMenu, setShowOpenMenu] = useState(false)
  const [showHistoryMenu, setShowHistoryMenu] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const fileInputRef = useRef(null)
  const nameInputRef = useRef(null)

  // Format last saved timestamp
  const getLastSavedText = () => {
    if (!lastSaved) return ''
    const seconds = Math.floor((Date.now() - lastSaved) / 1000)
    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const handleNameEdit = () => {
    setIsEditingName(true)
    setTimeout(() => nameInputRef.current?.select(), 0)
  }

  const handleNameBlur = () => {
    setIsEditingName(false)
    if (!campaignName.trim()) {
      onCampaignNameChange('Untitled Campaign')
    }
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      nameInputRef.current?.blur()
    } else if (e.key === 'Escape') {
      nameInputRef.current?.blur()
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">Campaign Builder</h1>
          <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
            Phase 4
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">|</span>
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={campaignName}
              onChange={(e) => onCampaignNameChange(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              className="px-2 py-1 border border-blue-500 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ width: `${Math.max(campaignName.length * 8 + 20, 150)}px` }}
            />
          ) : (
            <button
              onClick={handleNameEdit}
              className="px-2 py-1 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              {campaignName}
            </button>
          )}
        </div>

        {/* Draft saved indicator */}
        {lastSaved && (
          <div className="flex items-center text-xs text-gray-500">
            <span className="text-gray-400 mx-2">|</span>
            {saveStatus === 'saving' ? (
              <span className="flex items-center">
                <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5 animate-pulse"></span>
                Saving draft...
              </span>
            ) : (
              <span className="flex items-center" title={`Draft auto-saved ${getLastSavedText()}`}>
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                Draft saved {getLastSavedText()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-2 flex-1 max-w-md mx-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Node type filter */}
        <select
          value={nodeTypeFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Types</option>
          <option value="email">Email</option>
          <option value="survey">Survey</option>
          <option value="conditional">Conditional</option>
          <option value="action">Action</option>
          <option value="delay">Delay</option>
        </select>

        {/* Results count and clear button */}
        {(searchTerm || nodeTypeFilter !== 'all') && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {matchingNodesCount} of {totalNodesCount}
            </span>
            <button
              onClick={onClearFilters}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>

        {/* Open Menu */}
        <div className="relative">
          <button
            onClick={() => setShowOpenMenu(!showOpenMenu)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Open
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {showOpenMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowOpenMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    fileInputRef.current?.click()
                    setShowOpenMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                >
                  <FileJson className="w-4 h-4 mr-2 text-gray-600" />
                  Open File
                </button>
                <button
                  onClick={() => {
                    onOpenBulkImport()
                    setShowOpenMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                >
                  <Mail className="w-4 h-4 mr-2 text-gray-600" />
                  Import Emails (Bulk)
                </button>
                <div className="border-t border-gray-200 my-1" />
                <div className="px-4 py-1 text-xs font-medium text-gray-500">
                  Campaign Templates
                </div>
                <button
                  onClick={() => {
                    onLoadTemplate('welcomeSeries')
                    setShowOpenMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Welcome Series
                </button>
                <button
                  onClick={() => {
                    onLoadTemplate('satisfactionSurvey')
                    setShowOpenMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Satisfaction Survey
                </button>
                <button
                  onClick={() => {
                    onLoadTemplate('reengagementCampaign')
                    setShowOpenMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Re-engagement Campaign
                </button>
              </div>
            </>
          )}
        </div>

        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    onExportSelection()
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                >
                  <FileCheck className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium">Export Selection</div>
                    <div className="text-xs text-gray-500">Selected nodes only</div>
                  </div>
                </button>
                <div className="border-t border-gray-200 my-1" />
                <button
                  onClick={() => {
                    onExportEmails()
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                >
                  <Mail className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium">Export Emails (ZIP)</div>
                    <div className="text-xs text-gray-500">MJML + HTML files</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onExportHTML()
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                >
                  <Globe className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium">Export as HTML</div>
                    <div className="text-xs text-gray-500">Interactive viewer</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* History Menu */}
        <div className="relative">
          <button
            onClick={() => setShowHistoryMenu(!showHistoryMenu)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Clock className="w-4 h-4 mr-2" />
            History
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {showHistoryMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowHistoryMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    onSaveVersion()
                    setShowHistoryMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                >
                  <Clock className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium">Save Current Version</div>
                    <div className="text-xs text-gray-500">Create a snapshot</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onOpenVersionHistory()
                    setShowHistoryMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                >
                  <Clock className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium">View Version History</div>
                    <div className="text-xs text-gray-500">
                      {versionsCount === 0 ? 'No versions saved' : `${versionsCount} version${versionsCount !== 1 ? 's' : ''} saved`}
                    </div>
                  </div>
                  {versionsCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">
                      {versionsCount}
                    </span>
                  )}
                </button>
                <div className="border-t border-gray-200 my-1" />
                <div className="px-4 py-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Draft auto-save:</span>
                    <span className="font-medium text-green-600">ON ✓</span>
                  </div>
                  {lastSaved && (
                    <div className="mt-1 text-gray-400">
                      Last saved {getLastSavedText()}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onValidate}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          title="Validate campaign structure and content"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Validate
        </button>

        <button
          onClick={onClear}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </button>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={(e) => onImport(e.target.files[0])}
        className="hidden"
      />
    </header>
  )
}
