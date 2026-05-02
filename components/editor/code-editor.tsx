'use client'

import { useRef, useCallback } from 'react'
import Editor, { OnMount, OnChange } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { useEditorStore } from '@/lib/store'
import { Smartphone, FolderOpen, Github, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CodeEditor() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const { 
    files, 
    activeFileId, 
    updateFile, 
    fontSize, 
    tabSize, 
    wordWrap, 
    minimap,
    setSidebarOpen,
    setActivePanel
  } = useEditorStore()
  
  const activeFile = files.find(f => f.id === activeFileId)

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
    editor.focus()
  }, [])

  const handleChange: OnChange = useCallback((value) => {
    if (activeFileId && value !== undefined) {
      updateFile(activeFileId, value)
    }
  }, [activeFileId, updateFile])

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground p-4">
        <div className="text-center space-y-6 max-w-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">VSMobil</h2>
            <p className="text-sm text-muted-foreground">
              Mobil cihazlarda profesyonel kod yazma deneyimi
            </p>
          </div>
          
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                setActivePanel('explorer')
                setSidebarOpen(true)
              }}
            >
              <Plus className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="text-sm font-medium">Yeni Dosya</div>
                <div className="text-xs text-muted-foreground">Bos dosya olustur</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                setActivePanel('explorer')
                setSidebarOpen(true)
              }}
            >
              <FolderOpen className="w-5 h-5 text-yellow-500" />
              <div className="text-left">
                <div className="text-sm font-medium">Dosya Ac</div>
                <div className="text-xs text-muted-foreground">Mevcut dosyalari gor</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                setActivePanel('git')
                setSidebarOpen(true)
              }}
            >
              <Github className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm font-medium">GitHub Baglan</div>
                <div className="text-xs text-muted-foreground">Repo klonla veya baglan</div>
              </div>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground/60 space-y-1 pt-4">
            <p>JavaScript, TypeScript, Python, HTML, CSS destegi</p>
            <p>Otomatik kaydetme aktif</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full min-h-0">
      <Editor
        height="100%"
        language={activeFile.language}
        value={activeFile.content}
        theme="vs-dark"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          fontSize,
          fontFamily: 'var(--font-mono), Menlo, Monaco, "Courier New", monospace',
          lineNumbers: 'on',
          minimap: { enabled: minimap },
          scrollBeyondLastLine: false,
          wordWrap: wordWrap ? 'on' : 'off',
          automaticLayout: true,
          tabSize,
          insertSpaces: true,
          renderWhitespace: 'selection',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 8,
        }}
      />
    </div>
  )
}
