'use client'

import { 
  Settings, 
  Monitor, 
  Keyboard,
  Info,
  Minus,
  Plus,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useEditorStore } from '@/lib/store'

export function SettingsPanel() {
  const {
    fontSize,
    tabSize,
    wordWrap,
    minimap,
    autoSave,
    setFontSize,
    setTabSize,
    setWordWrap,
    setMinimap,
    setAutoSave,
  } = useEditorStore()
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Ayarlar
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Editor Settings */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Editor Ayarlari
          </h3>
          <div className="space-y-3">
            {/* Font Size */}
            <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
              <span className="text-sm">Font Boyutu</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                  disabled={fontSize <= 10}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-sm w-8 text-center">{fontSize}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                  disabled={fontSize >= 24}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Tab Size */}
            <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
              <span className="text-sm">Tab Boyutu</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setTabSize(Math.max(1, tabSize - 1))}
                  disabled={tabSize <= 1}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-sm w-8 text-center">{tabSize}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setTabSize(Math.min(8, tabSize + 1))}
                  disabled={tabSize >= 8}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Word Wrap */}
            <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
              <span className="text-sm">Satir Kaydirma</span>
              <Switch
                checked={wordWrap}
                onCheckedChange={setWordWrap}
              />
            </div>
            
            {/* Minimap */}
            <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
              <span className="text-sm">Mini Harita</span>
              <Switch
                checked={minimap}
                onCheckedChange={setMinimap}
              />
            </div>
            
            {/* Auto Save */}
            <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Otomatik Kaydet</span>
              </div>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Shortcuts */}
        <div>
          <h3 className="text-sm font-medium mb-3">Klavye Kisayollari</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
              <span>Dosya Kaydet</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+S</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
              <span>Konsol Ac/Kapat</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+`</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
              <span>Panel Ac/Kapat</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Ctrl+B</kbd>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* About */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Hakkinda
          </h3>
          <div className="p-3 rounded bg-secondary/30 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Versiyon</span>
              <span>1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Platform</span>
              <span>Web / Mobil</span>
            </div>
          </div>
          <div className="mt-3 p-3 rounded bg-primary/10 text-xs text-muted-foreground">
            <p className="font-medium text-primary mb-1">VSMobil</p>
            <p>Mobil cihazlarda profesyonel kod yazma deneyimi. JavaScript, TypeScript, Python, HTML, CSS ve daha fazlasi destegi.</p>
          </div>
        </div>
      </div>
      
      <div className="p-3 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          VSMobil - Mobile Code Editor
        </p>
      </div>
    </div>
  )
}
