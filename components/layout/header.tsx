'use client'

import { 
  Play, 
  Save,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Smartphone,
  FolderDown,
  Trash2
} from 'lucide-react'
import { useEditorStore } from '@/lib/store'
import { runCode } from '@/lib/code-runner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TerminalToggle } from '@/components/panels/terminal-panel'

export function Header() {
  const { 
    files, 
    activeFileId,
    currentProjectId,
    projects,
    saveFile,
    saveCurrentProject,
    createFile,
    clearAllFiles,
    addConsoleOutput,
    setTerminalOpen,
    previewOpen,
    setPreviewOpen,
  } = useEditorStore()
  
  const activeFile = files.find(f => f.id === activeFileId)
  const currentProject = projects.find(p => p.id === currentProjectId)
  const canPreview = activeFile && (activeFile.language === 'html' || activeFile.language === 'css')
  
  const handleRun = async () => {
    if (!activeFile) return
    
    setTerminalOpen(true)
    addConsoleOutput({ 
      type: 'info', 
      content: `> ${activeFile.name} calistiriliyor...` 
    })
    
    const result = await runCode(activeFile.content, activeFile.language)
    
    result.output.forEach(line => {
      addConsoleOutput({ type: 'log', content: line })
    })
    
    result.errors.forEach(line => {
      addConsoleOutput({ type: 'error', content: line })
    })
    
    addConsoleOutput({ 
      type: result.success ? 'result' : 'error', 
      content: result.success 
        ? `Tamamlandi (${result.executionTime.toFixed(2)}ms)` 
        : `Hata ile sonlandi`
    })
  }
  
  const handleSave = () => {
    if (activeFile) {
      saveFile(activeFile.id)
      saveCurrentProject()
      addConsoleOutput({ 
        type: 'info', 
        content: `${activeFile.name} kaydedildi` 
      })
    }
  }
  
  const handleExportAll = () => {
    if (files.length === 0) return
    
    // Create a simple ZIP-like structure as individual downloads
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
    })
    
    addConsoleOutput({ 
      type: 'info', 
      content: `${files.length} dosya disa aktarildi` 
    })
  }
  
  const handleExport = () => {
    if (activeFile) {
      const blob = new Blob([activeFile.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = activeFile.name
      a.click()
      URL.revokeObjectURL(url)
    }
  }
  
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.js,.jsx,.ts,.tsx,.py,.html,.htm,.css,.scss,.json,.md,.txt,.xml,.svg,.vue,.svelte,.php,.rb,.go,.rs,.java,.c,.cpp,.h,.hpp'
    input.onchange = async (e) => {
      const fileList = (e.target as HTMLInputElement).files
      if (fileList) {
        for (const file of Array.from(fileList)) {
          const content = await file.text()
          createFile(file.name, content)
        }
        addConsoleOutput({ 
          type: 'info', 
          content: `${fileList.length} dosya ice aktarildi` 
        })
      }
    }
    input.click()
  }
  
  const handlePreview = () => {
    setPreviewOpen(!previewOpen)
  }
  
  return (
    <header className="h-13 bg-card border-b border-border flex items-center justify-between px-2 sm:px-3 shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-none">VSMobil</span>
            {currentProject && (
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5 max-w-[100px] truncate">
                {currentProject.name}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <TerminalToggle />
        
        {/* Preview button for HTML/CSS */}
        {canPreview && (
          <Button
            variant={previewOpen ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 touch-manipulation"
            onClick={handlePreview}
            title="Onizleme"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 touch-manipulation"
          onClick={handleSave}
          disabled={!activeFile}
          title="Kaydet"
        >
          <Save className="w-4 h-4" />
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="h-8 gap-1.5 touch-manipulation"
          onClick={handleRun}
          disabled={!activeFile}
        >
          <Play className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Calistir</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 touch-manipulation">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Dosya Ice Aktar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport} disabled={!activeFile}>
              <Download className="w-4 h-4 mr-2" />
              Bu Dosyayi Indir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportAll} disabled={files.length === 0}>
              <FolderDown className="w-4 h-4 mr-2" />
              Tum Dosyalari Indir
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handlePreview} 
              disabled={!canPreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewOpen ? 'Onizlemeyi Kapat' : 'Onizleme Ac'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={clearAllFiles} 
              disabled={files.length === 0}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Tum Dosyalari Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
