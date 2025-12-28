import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Camera,
  Database,
  Palette,
  Globe,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Save,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'data', label: 'Data & Storage', icon: Database },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    criticalAlerts: true,
    weeklyReports: true,
    twoFactor: false,
    autoLogout: true,
    darkMode: true,
    compactView: false,
    highContrast: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button variant="glow" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        activeSection === section.id 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                      JD
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="john.doe@trafiq.ai" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue="Traffic Operations Manager" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" defaultValue="Public Safety Division" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure how and when you receive alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive alerts via email', icon: Mail },
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications', icon: Monitor },
                    { key: 'smsAlerts', label: 'SMS Alerts', description: 'Critical alerts via SMS', icon: Smartphone },
                    { key: 'criticalAlerts', label: 'Critical Alerts Only', description: 'Only notify for critical events', icon: Bell },
                    { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly summary reports', icon: Mail },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={settings[item.key as keyof typeof settings] as boolean}
                        onCheckedChange={() => toggleSetting(item.key as keyof typeof settings)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Protect your account with enhanced security options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Key className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">Two-Factor Authentication</p>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.twoFactor}
                      onCheckedChange={() => toggleSetting('twoFactor')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">Auto Logout</p>
                        <p className="text-xs text-muted-foreground">Logout after 30 minutes of inactivity</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.autoLogout}
                      onCheckedChange={() => toggleSetting('autoLogout')}
                    />
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Button variant="outline">Change Password</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cameras Section */}
            {activeSection === 'cameras' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    Camera Configuration
                  </CardTitle>
                  <CardDescription>
                    Manage camera feeds and detection settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-foreground">Active Cameras</p>
                      <p className="text-xs text-muted-foreground">4 of 6 cameras online</p>
                    </div>
                    <Badge variant="online">Healthy</Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="font-medium text-sm text-foreground mb-3">Detection Sensitivity</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">Low</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-primary rounded-full" />
                      </div>
                      <span className="text-xs text-muted-foreground">High</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Manage Camera Feeds
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Data Section */}
            {activeSection === 'data' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    Data & Storage
                  </CardTitle>
                  <CardDescription>
                    Manage your data retention and export options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium text-sm text-foreground">Storage Used</p>
                      <span className="text-sm text-primary font-semibold">42.5 GB / 100 GB</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="w-[42.5%] h-full bg-primary rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline">
                      <Globe className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      Clear Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize the look and feel of your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="font-medium text-sm text-foreground mb-3">Theme</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          settings.darkMode 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSettings(prev => ({ ...prev, darkMode: true }))}
                      >
                        <Moon className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium text-foreground">Dark</p>
                      </button>
                      <button 
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          !settings.darkMode 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSettings(prev => ({ ...prev, darkMode: false }))}
                      >
                        <Sun className="w-6 h-6 mx-auto mb-2 text-warning" />
                        <p className="text-sm font-medium text-foreground">Light</p>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-sm text-foreground">Compact View</p>
                      <p className="text-xs text-muted-foreground">Reduce spacing and padding</p>
                    </div>
                    <Switch 
                      checked={settings.compactView}
                      onCheckedChange={() => toggleSetting('compactView')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-sm text-foreground">High Contrast</p>
                      <p className="text-xs text-muted-foreground">Increase color contrast for accessibility</p>
                    </div>
                    <Switch 
                      checked={settings.highContrast}
                      onCheckedChange={() => toggleSetting('highContrast')}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
