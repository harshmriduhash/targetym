'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Lock, Key, AlertTriangle, CheckCircle2, XCircle, Smartphone, Mail, Globe, Eye, EyeOff, TrendingUp, Activity, Bell } from "lucide-react"
import { Badge } from '@/components/ui/badge';
import { Switch } from "@/components/ui/switch";

interface SecurityEvent {
  id: string;
  type: 'login' | 'password-change' | 'permission-change' | 'suspicious-activity';
  description: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  status: 'success' | 'failed' | 'blocked';
}

export default function SecurityPage() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loginNotifications, setLoginNotifications] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('securityEvents');
    if (stored) {
      setSecurityEvents(JSON.parse(stored));
    } else {
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login',
          description: 'Connexion réussie depuis Chrome',
          timestamp: '2025-10-25T09:30:00',
          ipAddress: '192.168.1.100',
          location: 'Paris, France',
          status: 'success'
        },
        {
          id: '2',
          type: 'password-change',
          description: 'Mot de passe modifié',
          timestamp: '2025-10-24T14:15:00',
          ipAddress: '192.168.1.100',
          location: 'Paris, France',
          status: 'success'
        },
        {
          id: '3',
          type: 'login',
          description: 'Tentative de connexion échouée',
          timestamp: '2025-10-23T22:45:00',
          ipAddress: '203.0.113.0',
          location: 'Inconnu',
          status: 'failed'
        },
        {
          id: '4',
          type: 'suspicious-activity',
          description: 'Activité suspecte détectée et bloquée',
          timestamp: '2025-10-22T03:20:00',
          ipAddress: '198.51.100.0',
          location: 'Moscou, Russie',
          status: 'blocked'
        },
        {
          id: '5',
          type: 'login',
          description: 'Connexion depuis un nouvel appareil',
          timestamp: '2025-10-20T18:00:00',
          ipAddress: '192.168.1.105',
          location: 'Lyon, France',
          status: 'success'
        }
      ];
      setSecurityEvents(mockEvents);
      localStorage.setItem('securityEvents', JSON.stringify(mockEvents));
    }
  }, []);

  const stats = {
    totalEvents: securityEvents.length,
    successfulLogins: securityEvents.filter(e => e.type === 'login' && e.status === 'success').length,
    failedAttempts: securityEvents.filter(e => e.status === 'failed').length,
    blockedThreats: securityEvents.filter(e => e.status === 'blocked').length,
    passwordChanges: securityEvents.filter(e => e.type === 'password-change').length,
    activeDevices: 3 // Mock data
  };

  const getEventBadge = (status: SecurityEvent['status']) => {
    const variants = {
      success: { label: 'Réussi', variant: 'default' as const, icon: CheckCircle2 },
      failed: { label: 'Échoué', variant: 'destructive' as const, icon: XCircle },
      blocked: { label: 'Bloqué', variant: 'secondary' as const, icon: AlertTriangle }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getEventTypeIcon = (type: SecurityEvent['type']) => {
    const icons = {
      'login': Globe,
      'password-change': Key,
      'permission-change': Shield,
      'suspicious-activity': AlertTriangle
    };
    return icons[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sécurité</h1>
          <p className="text-muted-foreground mt-1">
            Paramètres et journal de sécurité
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Shield className="mr-2 h-4 w-4" />
          Audit de sécurité
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Événements</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Connexions</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successfulLogins}</div>
            <p className="text-xs text-muted-foreground mt-1">Réussies</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Échecs</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <XCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.failedAttempts}</div>
            <p className="text-xs text-muted-foreground mt-1">Tentatives</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Menaces</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blockedThreats}</div>
            <p className="text-xs text-muted-foreground mt-1">Bloquées</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mots de passe</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <Key className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.passwordChanges}</div>
            <p className="text-xs text-muted-foreground mt-1">Changements</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Appareils</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.activeDevices}</div>
            <p className="text-xs text-muted-foreground mt-1">Actifs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Paramètres de sécurité</CardTitle>
            <CardDescription>Configurez vos options de sécurité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Authentification à deux facteurs</h4>
                  <p className="text-sm text-muted-foreground">
                    Sécurisez votre compte avec une authentification à deux facteurs
                  </p>
                </div>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Notifications par email</h4>
                  <p className="text-sm text-muted-foreground">
                    Recevez des alertes par email pour les activités importantes
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            {/* Login Alerts */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Alertes de connexion</h4>
                  <p className="text-sm text-muted-foreground">
                    Notifications pour les nouvelles connexions
                  </p>
                </div>
              </div>
              <Switch
                checked={loginNotifications}
                onCheckedChange={setLoginNotifications}
              />
            </div>

            {/* Password Change */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Lock className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Modifier le mot de passe</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Changez votre mot de passe régulièrement pour plus de sécurité
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Mot de passe actuel</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nouveau mot de passe</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Confirmer le mot de passe</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <Button className="w-full">
                      <Key className="mr-2 h-4 w-4" />
                      Mettre à jour le mot de passe
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base">Journal d'activité</CardTitle>
              <CardDescription>Événements récents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.slice(0, 5).map((event) => {
                  const Icon = getEventTypeIcon(event.type);
                  return (
                    <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/20 transition-all">
                      <div className="flex items-start gap-2 mb-2">
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate">{event.location}</span>
                        {getEventBadge(event.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Voir tout l'historique
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white text-base">Sécurité renforcée</CardTitle>
                  <CardDescription className="text-blue-100 text-xs">Protection active</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Chiffrement de bout en bout</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Détection d'intrusion</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Authentification multi-facteurs</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Surveillance 24/7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
