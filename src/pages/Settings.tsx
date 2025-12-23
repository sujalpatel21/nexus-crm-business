import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Moon, Sun, Zap, Bell, Shield, Database } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const [glowIntensity, setGlowIntensity] = useState(50);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load settings from database
    const loadSettings = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setGlowIntensity(data.glow_intensity ?? 50);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('app_settings')
          .update({ glow_intensity: glowIntensity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('app_settings')
          .insert([{ glow_intensity: glowIntensity, theme: 'dark' }]);
      }

      toast({ title: 'Settings saved successfully' });
    } catch (error) {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Settings" 
        subtitle="Customize your application preferences"
      />
      
      <div className="p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Appearance */}
          <div className="glass-card p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-neon/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Appearance</h3>
                <p className="text-sm text-muted-foreground">Customize the visual experience</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Glow Intensity</Label>
                  <span className="text-sm text-muted-foreground">{glowIntensity}%</span>
                </div>
                <Slider
                  value={[glowIntensity]}
                  max={100}
                  step={5}
                  onValueChange={([value]) => setGlowIntensity(value)}
                />
                <p className="text-xs text-muted-foreground">
                  Adjust the intensity of neon glow effects throughout the app
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Mode</Label>
                  <p className="text-xs text-muted-foreground mt-1">Reduce spacing and padding</p>
                </div>
                <Switch checked={compactMode} onCheckedChange={setCompactMode} />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-neon/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Notifications</h3>
                <p className="text-sm text-muted-foreground">Manage notification preferences</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground mt-1">Receive alerts for important updates</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </div>

          {/* Data & Storage */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-neon/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Data & Storage</h3>
                <p className="text-sm text-muted-foreground">Manage your data preferences</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-save Changes</Label>
                  <p className="text-xs text-muted-foreground mt-1">Automatically save your work</p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-neon/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Security</h3>
                <p className="text-sm text-muted-foreground">Security and privacy settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your data is securely stored and encrypted. This application runs without authentication 
                for demo purposes.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-gradient-neon text-primary-foreground hover:opacity-90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
