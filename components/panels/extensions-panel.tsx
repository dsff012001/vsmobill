'use client'

import { 
  Puzzle, 
  Code2, 
  Palette, 
  Wrench,
  GitBranch,
  Check,
  X
} from 'lucide-react'
import { useEditorStore, Extension } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

const getCategoryIcon = (category: Extension['category']) => {
  switch (category) {
    case 'language':
      return <Code2 className="w-4 h-4" />
    case 'theme':
      return <Palette className="w-4 h-4" />
    case 'tool':
      return <Wrench className="w-4 h-4" />
    case 'git':
      return <GitBranch className="w-4 h-4" />
    default:
      return <Puzzle className="w-4 h-4" />
  }
}

const getCategoryLabel = (category: Extension['category']) => {
  switch (category) {
    case 'language':
      return 'Dil Desteği'
    case 'theme':
      return 'Tema'
    case 'tool':
      return 'Araç'
    case 'git':
      return 'Git'
    default:
      return 'Diğer'
  }
}

export function ExtensionsPanel() {
  const { extensions, toggleExtension } = useEditorStore()
  
  const groupedExtensions = extensions.reduce((acc, ext) => {
    if (!acc[ext.category]) {
      acc[ext.category] = []
    }
    acc[ext.category].push(ext)
    return acc
  }, {} as Record<Extension['category'], Extension[]>)
  
  const enabledCount = extensions.filter(e => e.enabled).length
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Puzzle className="w-4 h-4" />
          Eklentiler
        </div>
        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
          {enabledCount}/{extensions.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedExtensions).map(([category, exts]) => (
          <div key={category} className="mb-4">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
              {getCategoryIcon(category as Extension['category'])}
              {getCategoryLabel(category as Extension['category'])}
            </div>
            <div className="space-y-1">
              {exts.map((ext) => (
                <div
                  key={ext.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded',
                    ext.enabled ? 'bg-secondary/50' : 'opacity-60'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded flex items-center justify-center text-xs font-bold',
                    ext.enabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {ext.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ext.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {ext.description}
                    </p>
                  </div>
                  <Switch
                    checked={ext.enabled}
                    onCheckedChange={() => toggleExtension(ext.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-border bg-secondary/30">
        <p className="text-xs text-muted-foreground text-center">
          Eklentiler otomatik olarak kaydedilir
        </p>
      </div>
    </div>
  )
}
