'use client'

import { useState } from 'react'
import { 
  File, 
  FileCode, 
  FileJson, 
  FileText, 
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
  MoreVertical,
  FileType,
  Download,
  Upload,
  Trash
} from 'lucide-react'
import { useEditorStore, VSFile } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

const fileTemplates = [
  { name: 'JavaScript', ext: '.js', icon: '📜' },
  { name: 'TypeScript', ext: '.ts', icon: '📘' },
  { name: 'HTML', ext: '.html', icon: '🌐' },
  { name: 'CSS', ext: '.css', icon: '🎨' },
  { name: 'Python', ext: '.py', icon: '🐍' },
  { name: 'JSON', ext: '.json', icon: '📋' },
  { name: 'Markdown', ext: '.md', icon: '📝' },
  { name: 'Plain Text', ext: '.txt', icon: '📄' },
]

const getFileIcon = (language: string) => {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return <FileCode className="w-4 h-4 text-yellow-400" />
    case 'json':
      return <FileJson className="w-4 h-4 text-yellow-500" />
    case 'html':
      return <FileCode className="w-4 h-4 text-orange-500" />
    case 'css':
    case 'scss':
    case 'sass':
      return <FileCode className="w-4 h-4 text-blue-400" />
    case 'python':
      return <FileCode className="w-4 h-4 text-green-400" />
    case 'markdown':
      return <FileText className="w-4 h-4 text-blue-300" />
    default:
      return <File className="w-4 h-4 text-muted-foreground" />
  }
}

export function FileExplorer() {
  const { files, activeFileId, openFile, createFile, deleteFile, renameFile, clearAllFiles } = useEditorStore()
  const [newFileDialog, setNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [renameDialog, setRenameDialog] = useState<VSFile | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteAllDialog, setDeleteAllDialog] = useState(false)
  const [templateDialog, setTemplateDialog] = useState(false)
  
  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createFile(newFileName.trim())
      setNewFileName('')
      setNewFileDialog(false)
    }
  }
  
  const handleCreateFromTemplate = (ext: string) => {
    const baseName = 'yeni_dosya'
    let name = `${baseName}${ext}`
    let counter = 1
    
    while (files.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      name = `${baseName}_${counter}${ext}`
      counter++
    }
    
    createFile(name)
    setTemplateDialog(false)
  }
  
  const handleRename = () => {
    if (renameDialog && renameValue.trim()) {
      renameFile(renameDialog.id, renameValue.trim())
      setRenameDialog(null)
      setRenameValue('')
    }
  }
  
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.js,.jsx,.ts,.tsx,.py,.html,.htm,.css,.scss,.json,.md,.txt,.xml,.svg,.vue,.svelte,.go,.rs,.java,.c,.cpp,.php,.rb,.swift,.kt,.yaml,.yml,.sh,.sql'
    input.onchange = async (e) => {
      const fileList = (e.target as HTMLInputElement).files
      if (fileList) {
        for (const file of Array.from(fileList)) {
          const content = await file.text()
          createFile(file.name, content)
        }
      }
    }
    input.click()
  }
  
  const handleExportAll = () => {
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
    })
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <FolderOpen className="w-4 h-4" />
          Dosyalar
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setNewFileDialog(true)}>
                <File className="w-4 h-4 mr-2" />
                Yeni Dosya
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTemplateDialog(true)}>
                <FileType className="w-4 h-4 mr-2" />
                Sablondan Olustur
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleImport}>
                <Upload className="w-4 h-4 mr-2" />
                Iceaktar
              </DropdownMenuItem>
              {files.length > 0 && (
                <>
                  <DropdownMenuItem onClick={handleExportAll}>
                    <Download className="w-4 h-4 mr-2" />
                    Tumunu Disari Aktar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setDeleteAllDialog(true)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Tumunu Sil
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-1">
        {files.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="mb-3">Henuz dosya yok</p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setTemplateDialog(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Dosya Olustur
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={handleImport}
              >
                <Upload className="w-4 h-4 mr-1" />
                Dosya Ice Aktar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  'group flex items-center gap-2 px-2 py-2 rounded cursor-pointer touch-manipulation',
                  activeFileId === file.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-secondary/50 active:bg-secondary text-foreground'
                )}
                onClick={() => openFile(file.id)}
              >
                {getFileIcon(file.language)}
                <span className="flex-1 truncate text-sm">{file.name}</span>
                {file.isModified && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setRenameValue(file.name)
                        setRenameDialog(file)
                      }}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Yeniden Adlandir
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        const blob = new Blob([file.content], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = file.name
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Indir
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFile(file.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* New File Dialog */}
      <Dialog open={newFileDialog} onOpenChange={setNewFileDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Dosya Olustur</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Dosya adi (orn: index.html)"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            autoFocus
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setNewFileDialog(false)}>
              Iptal
            </Button>
            <Button onClick={handleCreateFile}>Olustur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Template Dialog */}
      <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dosya Tipi Sec</DialogTitle>
            <DialogDescription>
              Hangi turu dosya olusturmak istiyorsunuz?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {fileTemplates.map((template) => (
              <Button
                key={template.ext}
                variant="outline"
                className="h-auto py-3 flex-col gap-1"
                onClick={() => handleCreateFromTemplate(template.ext)}
              >
                <span className="text-lg">{template.icon}</span>
                <span className="text-xs">{template.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Rename Dialog */}
      <Dialog open={!!renameDialog} onOpenChange={() => setRenameDialog(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dosyayi Yeniden Adlandir</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Yeni dosya adi"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRenameDialog(null)}>
              Iptal
            </Button>
            <Button onClick={handleRename}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete All Dialog */}
      <Dialog open={deleteAllDialog} onOpenChange={setDeleteAllDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tum Dosyalari Sil</DialogTitle>
            <DialogDescription>
              Bu islem geri alinamaz. Tum dosyalariniz kalici olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteAllDialog(false)}>
              Iptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                clearAllFiles()
                setDeleteAllDialog(false)
              }}
            >
              Tumunu Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
