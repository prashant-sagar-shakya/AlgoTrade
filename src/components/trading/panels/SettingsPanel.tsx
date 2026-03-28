import { Settings, Bell, Shield, User, Globe, Moon, Sun } from 'lucide-react';

export default function SettingsPanel() {
  return (
    <div className="flex flex-col h-full bg-card p-3 space-y-6 overflow-y-auto scrollbar-thin">
      <div className="flex items-center gap-2 pb-2 border-b border-panel/50">
        <Settings size={16} className="text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Global Settings</h3>
      </div>

      <div className="space-y-4">
        <SettingSection title="Preferences">
          <ToggleItem icon={<Moon size={14} />} label="Dark Mode" enabled={true} />
          <ToggleItem icon={<Bell size={14} />} label="Desktop Notifications" enabled={true} />
          <ToggleItem icon={<Globe size={14} />} label="Sound Alerts" enabled={false} />
        </SettingSection>

        <SettingSection title="Trading Engine">
          <div className="space-y-2">
             <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Default Order Amount ($)</label>
             <input type="number" defaultValue={1000} className="w-full bg-accent/30 border border-panel/50 rounded px-2 py-1.5 text-xs outline-none" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Max Slippage (%)</label>
             <input type="number" defaultValue={0.1} step={0.01} className="w-full bg-accent/30 border border-panel/50 rounded px-2 py-1.5 text-xs outline-none" />
          </div>
        </SettingSection>

        <SettingSection title="Privacy & Security">
           <ToggleItem icon={<Shield size={14} />} label="Hide Balance from Header" enabled={false} />
           <ToggleItem icon={<User size={14} />} label="Two Factor Auth" enabled={true} />
        </SettingSection>
      </div>

      <button className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-md hover:brightness-110 active:scale-95 transition-all mt-auto">
        Apply Changes
      </button>
    </div>
  );
}

function SettingSection({ title, children }: any) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] text-primary font-bold uppercase tracking-widest px-1">{title}</h4>
      <div className="bg-accent/10 border border-panel/30 rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function ToggleItem({ icon, label, enabled }: any) {
  return (
    <div className="flex items-center justify-between p-2.5 border-b border-panel/30 last:border-0 hover:bg-accent/20 transition-colors">
       <div className="flex items-center gap-2 text-xs text-foreground">
          {icon}
          <span>{label}</span>
       </div>
       <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
       </div>
    </div>
  );
}
