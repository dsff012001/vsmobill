'use client'

import { useState } from 'react'
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  FileCode,
  Clock,
  Github,
  MoreVertical,
  FolderPlus
} from 'lucide-react'
import { useEditorStore, Project } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Bugun'
  if (days === 1) return 'Dun'
  if (days < 7) return `${days} gun once`
  
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  })
}

export function ProjectsPanel() {
  const [newProjectDialog, setNewProjectDialog] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null)
  
  const {
    projects,
    currentProjectId,
    files,
    createProject,
    deleteProject,
    switchProject,
    saveCurrentProject,
  } = useEditorStore()
  
  const handleCreateProject = () => {
    if (!projectName.trim()) return
    createProject(projectName.trim(), projectDescription.trim() || undefined)
    setNewProjectDialog(false)
    setProjectName('')
    setProjectDescription('')
  }
  
  const handleSwitchProject = (project: Project) => {
    if (project.id === currentProjectId) return
    
    // Save current project first
    saveCurrentProject()
    
    // Then switch
    switchProject(project.id)
  }
  
  const handleDeleteProject = () => {
    if (deleteConfirm) {
      deleteProject(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <FolderOpen className="w-4 h-4" />
          Projeler
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setNewProjectDialog(true)}
          title="Yeni Proje"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Current workspace indicator */}
      {files.length > 0 && !currentProjectId && (
        <div className="p-3 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2 text-sm">
            <FileCode className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Gecici Calisma Alani</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {files.length} dosya - Proje olarak kaydedin
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 h-7 text-xs w-full"
            onClick={() => setNewProjectDialog(true)}
          >
            <FolderPlus className="w-3 h-3 mr-1" />
            Proje Olarak Kaydet
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Henuz Proje Yok</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Yeni bir proje olusturun veya GitHub&apos;dan bir depo yukleyin
            </p>
            <Button size="sm" onClick={() => setNewProjectDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Proje
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {projects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  'group p-3 rounded-lg cursor-pointer transition-colors',
                  project.id === currentProjectId
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-secondary/50'
                )}
                onClick={() => handleSwitchProject(project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {project.githubRepo ? (
                      <Github className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <FolderOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-medium text-sm truncate max-w-[150px]">
                      {project.name}
                    </span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm(project)
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {project.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 pl-6">
                    {project.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 mt-2 pl-6">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileCode className="w-3 h-3" />
                    {project.files.length} dosya
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* New Project Dialog */}
      <Dialog open={newProjectDialog} onOpenChange={setNewProjectDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Proje</DialogTitle>
            <DialogDescription>
              Yeni bir proje olusturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Proje Adi</label>
              <Input
                placeholder="proje-adi"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Aciklama (Opsiyonel)</label>
              <Input
                placeholder="Proje aciklamasi"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setNewProjectDialog(false)}>
              Iptal
            </Button>
            <Button onClick={handleCreateProject} disabled={!projectName.trim()}>
              Olustur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Projeyi Sil</DialogTitle>
            <DialogDescription>
              &quot;{deleteConfirm?.name}&quot; projesini silmek istediginize emin misiniz?
              Bu islem geri alinamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Iptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
