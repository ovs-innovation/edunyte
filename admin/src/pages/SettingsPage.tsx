import { useEffect, useState } from 'react';
import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PermissionGate } from '@/components/PermissionGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Bell, Shield, Globe, Palette } from 'lucide-react';
import { ColorPicker } from '@/components/ColorPicker';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SettingsAPI, ApiSettings } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useThemeColor, ThemeColor } from '@/contexts/ThemeColorContext';

const ColorPickerWrapper = ({ onColorChange }: { onColorChange: (color: ThemeColor) => void }) => {
  const { themeColor } = useThemeColor();
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onColorChange(themeColor);
  }, [themeColor]);

  return <ColorPicker />;
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<ApiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { themeColor, setThemeColor } = useThemeColor();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings?.themeColor && !loading) {
      const colorMap: Record<string, ThemeColor> = {
        sky: 'sky',
        violet: 'violet',
        emerald: 'emerald',
        rose: 'rose',
        amber: 'amber',
        orange: 'orange',
        teal: 'teal',
        pink: 'pink',
        indigo: 'indigo',
        cyan: 'cyan',
        lime: 'lime',
        red: 'red',
      };
      const mappedColor = colorMap[settings.themeColor] || 'sky';
      if (mappedColor !== themeColor) {
        setThemeColor(mappedColor);
      }
    }
  }, [settings?.themeColor, loading]);

  const loadSettings = async () => {
    try {
      const data = await SettingsAPI.get();
      setSettings(data.settings);
      if (data.settings.themeColor) {
        const colorMap: Record<string, ThemeColor> = {
          sky: 'sky',
          violet: 'violet',
          emerald: 'emerald',
          rose: 'rose',
          amber: 'amber',
          orange: 'orange',
          teal: 'teal',
          pink: 'pink',
          indigo: 'indigo',
          cyan: 'cyan',
          lime: 'lime',
          red: 'red',
        };
        const mappedColor = colorMap[data.settings.themeColor] || 'sky';
        setThemeColor(mappedColor);
      }
    } catch (err: any) {
      toast({ title: 'Failed to load settings', description: err?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const settingsToSave = {
        ...settings,
        themeColor: themeColor,
      };
      const data = await SettingsAPI.update(settingsToSave);
      setSettings(data.settings);
      toast({ title: 'Settings saved successfully' });
    } catch (err: any) {
      toast({ title: 'Failed to save settings', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleThemeColorChange = (color: ThemeColor) => {
    setThemeColor(color);
    if (settings) {
      setSettings({ ...settings, themeColor: color });
    }
  };

  const updateSetting = <K extends keyof ApiSettings>(key: K, value: ApiSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading || !settings) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your platform preferences and configurations.
            </p>
          </div>
          <PermissionGate permission="settings.edit">
            <Button
              onClick={handleSave}
              disabled={saving || !settings}
              className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </PermissionGate>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">General</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => updateSetting('siteUrl', e.target.value)}
                  className="bg-muted/50"
                />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-foreground">Financial</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformFee">Platform Fee Percentage (%)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Fee charged on each booking (applied to lesson price)
                </p>
                <Input
                  id="platformFee"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.platformFeePercent ?? 4}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0 && value <= 100) {
                      updateSetting('platformFeePercent', value);
                    }
                  }}
                  className="bg-muted/50"
                  placeholder="4.0"
                />
                <p className="text-xs text-muted-foreground">
                  Default: 4% • Current: {settings.platformFeePercent ?? 4}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotif" className="text-foreground">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <PermissionGate
                  permission="settings.edit"
                  fallback={<Switch disabled checked={settings.emailNotifications} />}
                >
                  <Switch
                    id="emailNotif"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </PermissionGate>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotif" className="text-foreground">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Browser push notifications</p>
                </div>
                <PermissionGate
                  permission="settings.edit"
                  fallback={<Switch disabled checked={settings.pushNotifications} />}
                >
                  <Switch
                    id="pushNotif"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </PermissionGate>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyReport" className="text-foreground">Weekly Reports</Label>
                  <p className="text-xs text-muted-foreground">Weekly summary emails</p>
                </div>
                <PermissionGate
                  permission="settings.edit"
                  fallback={<Switch disabled checked={settings.weeklyReports} />}
                >
                  <Switch
                    id="weeklyReport"
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => updateSetting('weeklyReports', checked)}
                  />
                </PermissionGate>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Security</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactor" className="text-foreground">Two-Factor Auth</Label>
                  <p className="text-xs text-muted-foreground">Require 2FA for all users</p>
                </div>
                <PermissionGate
                  permission="settings.edit"
                  fallback={<Switch disabled checked={settings.twoFactorAuth} />}
                >
                  <Switch
                    id="twoFactor"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                  />
                </PermissionGate>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sessionTimeout" className="text-foreground">Session Timeout</Label>
                  <p className="text-xs text-muted-foreground">Auto logout after inactivity</p>
                </div>
                <PermissionGate
                  permission="settings.edit"
                  fallback={<Switch disabled checked={settings.sessionTimeout} />}
                >
                  <Switch
                    id="sessionTimeout"
                    checked={settings.sessionTimeout}
                    onCheckedChange={(checked) => updateSetting('sessionTimeout', checked)}
                  />
                </PermissionGate>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ipWhitelist" className="text-foreground">IP Whitelist</Label>
                  <p className="text-xs text-muted-foreground">Restrict access by IP</p>
                </div>
                <PermissionGate
                  permission="settings.edit"
                  fallback={<Switch disabled checked={settings.ipWhitelist} />}
                >
                  <Switch
                    id="ipWhitelist"
                    checked={settings.ipWhitelist}
                    onCheckedChange={(checked) => updateSetting('ipWhitelist', checked)}
                  />
                </PermissionGate>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Appearance</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Theme Mode</Label>
                  <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                </div>
                <ThemeToggle />
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-foreground">Theme Color</Label>
                  <p className="text-xs text-muted-foreground">Choose your preferred accent and button color</p>
                </div>
                <PermissionGate
                  permission="settings.edit"
                  fallback={<ColorPicker />}
                >
                  <ColorPickerWrapper onColorChange={handleThemeColorChange} />
                </PermissionGate>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">Reduce spacing and padding</p>
                </div>
                <PermissionGate
                  permission="settings.edit"
                  fallback={<Switch disabled checked={settings.compactMode} />}
                >
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  />
                </PermissionGate>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
