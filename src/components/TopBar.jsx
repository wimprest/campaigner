import React, { useState, useRef } from 'react'
import { Save, Upload, Download, Trash2, ChevronDown, FileJson, Mail, Globe, FolderOpen } from 'lucide-react'

export default function TopBar({
  onSave,
  onLoad,
  onImport,
  onLoadTemplate,
  onExportJSON,
  onExportEmails,
  onExportHTML,
  onClear
}) {
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showLoadMenu, setShowLoadMenu] = useState(false)
  const fileInputRef = useRef(null)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900">Campaign Flowchart Builder</h1>
        <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          Phase 2
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>

        {/* Load/Import Menu */}
        <div className="relative">
          <button
            onClick={() => setShowLoadMenu(!showLoadMenu)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {showLoadMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowLoadMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    onLoad()
                    setShowLoadMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                >
                  <FolderOpen className="w-4 h-4 mr-2 text-gray-600" />
                  Load from Browser Storage
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click()
                    setShowLoadMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                >
                  <FileJson className="w-4 h-4 mr-2 text-gray-600" />
                  Import JSON File
                </button>
                <div className="border-t border-gray-200 my-1" />
                <div className="px-4 py-1 text-xs font-medium text-gray-500">
                  Campaign Templates
                </div>
                <button
                  onClick={() => {
                    onLoadTemplate('welcomeSeries')
                    setShowLoadMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Welcome Series
                </button>
                <button
                  onClick={() => {
                    onLoadTemplate('satisfactionSurvey')
                    setShowLoadMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  Satisfaction Survey
                </button>
                <button
                  onClick={() => {
                    onLoadTemplate('reengagementCampaign')
                    setShowLoadMenu(false)
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
                    onExportJSON()
                    setShowExportMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center text-sm"
                >
                  <FileJson className="w-4 h-4 mr-2 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium">Export as JSON</div>
                    <div className="text-xs text-gray-500">Campaign data file</div>
                  </div>
                </button>
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
