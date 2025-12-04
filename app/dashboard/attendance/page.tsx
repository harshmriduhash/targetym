'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, LogIn, LogOut, Users, Calendar, TrendingUp, AlertCircle, CheckCircle2, XCircle, Timer } from "lucide-react"
import { Badge } from '@/components/ui/badge';

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  hoursWorked?: number;
}

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState<string | null>(null);
  const [todayCheckOut, setTodayCheckOut] = useState<string | null>(null);

  // Charger les données depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('attendanceRecords');
    if (stored) {
      setAttendanceRecords(JSON.parse(stored));
    }

    // Vérifier si déjà pointé aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const storedCheckIn = localStorage.getItem(`checkIn_${today}`);
    const storedCheckOut = localStorage.getItem(`checkOut_${today}`);

    if (storedCheckIn) {
      setIsCheckedIn(true);
      setTodayCheckIn(storedCheckIn);
    }
    if (storedCheckOut) {
      setTodayCheckOut(storedCheckOut);
    }
  }, []);

  // Fonction de pointage entrée
  const handleCheckIn = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    setIsCheckedIn(true);
    setTodayCheckIn(time);
    localStorage.setItem(`checkIn_${today}`, time);

    // Créer un enregistrement
    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      userId: 'current-user',
      userName: 'Utilisateur Courant',
      date: today,
      checkIn: time,
      status: 'present'
    };

    const updated = [...attendanceRecords, newRecord];
    setAttendanceRecords(updated);
    localStorage.setItem('attendanceRecords', JSON.stringify(updated));
  };

  // Fonction de pointage sortie
  const handleCheckOut = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    setTodayCheckOut(time);
    localStorage.setItem(`checkOut_${today}`, time);

    // Mettre à jour l'enregistrement du jour
    const updated = attendanceRecords.map(record => {
      if (record.date === today && record.checkIn === todayCheckIn) {
        // Calculer les heures travaillées
        const checkInDate = new Date(`${today}T${record.checkIn}`);
        const checkOutDate = new Date(`${today}T${time}`);
        const hoursWorked = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);

        return {
          ...record,
          checkOut: time,
          hoursWorked: Math.round(hoursWorked * 10) / 10
        };
      }
      return record;
    });

    setAttendanceRecords(updated);
    localStorage.setItem('attendanceRecords', JSON.stringify(updated));
  };

  // Calculer les statistiques
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);

  const stats = {
    todayPresent: attendanceRecords.filter(r => r.date === today && r.status === 'present').length,
    todayAbsent: 5, // Mock - à calculer basé sur le total d'employés
    todayLate: attendanceRecords.filter(r => r.date === today && r.status === 'late').length,
    monthlyAverage: attendanceRecords.filter(r => r.date.startsWith(thisMonth) && r.status === 'present').length / 30 * 100,
    totalHoursMonth: attendanceRecords
      .filter(r => r.date.startsWith(thisMonth) && r.hoursWorked)
      .reduce((sum, r) => sum + (r.hoursWorked || 0), 0),
    avgHoursPerDay: 7.5 // Mock
  };

  // Enregistrements récents
  const recentRecords = attendanceRecords
    .sort((a, b) => new Date(b.date + 'T' + (b.checkIn || '00:00')).getTime() - new Date(a.date + 'T' + (a.checkIn || '00:00')).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const variants = {
      present: { label: 'Présent', variant: 'default' as const, icon: CheckCircle2, color: 'text-green-600' },
      absent: { label: 'Absent', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      late: { label: 'En retard', variant: 'secondary' as const, icon: Timer, color: 'text-yellow-600' },
      'half-day': { label: 'Demi-journée', variant: 'outline' as const, icon: Clock, color: 'text-blue-600' }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="text-xs">
        <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion de Présence</h1>
          <p className="text-muted-foreground mt-1">
            Pointage et suivi des présences de l'équipe
          </p>
        </div>
        <div className="flex gap-2">
          {!isCheckedIn ? (
            <Button onClick={handleCheckIn} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
              <LogIn className="mr-2 h-4 w-4" />
              Pointer l'entrée
            </Button>
          ) : !todayCheckOut ? (
            <Button onClick={handleCheckOut} variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
              <LogOut className="mr-2 h-4 w-4" />
              Pointer la sortie
            </Button>
          ) : (
            <Button disabled className="bg-green-100 text-green-700">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Pointage terminé
            </Button>
          )}
        </div>
      </div>

      {/* Pointage du jour */}
      {isCheckedIn && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pointage du jour</p>
                  <h3 className="text-2xl font-bold text-green-700">
                    {todayCheckIn ? `Entrée: ${todayCheckIn}` : 'Non pointé'}
                  </h3>
                  {todayCheckOut && (
                    <p className="text-sm text-green-600">Sortie: {todayCheckOut}</p>
                  )}
                </div>
              </div>
              {todayCheckIn && todayCheckOut && (
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Temps travaillé</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const checkIn = new Date(`${today}T${todayCheckIn}`);
                      const checkOut = new Date(`${today}T${todayCheckOut}`);
                      const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
                      return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
                    })()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Présents</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.todayPresent}</div>
            <p className="text-xs text-muted-foreground mt-1">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absents</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
              <XCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.todayAbsent}</div>
            <p className="text-xs text-muted-foreground mt-1">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En retard</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Timer className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.todayLate}</div>
            <p className="text-xs text-muted-foreground mt-1">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux présence</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{Math.round(stats.monthlyAverage)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Heures totales</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalHoursMonth)}h</div>
            <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Moyenne/jour</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.avgHoursPerDay}h</div>
            <p className="text-xs text-muted-foreground mt-1">Moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Historique des présences - 2 columns */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Historique des présences</CardTitle>
            </div>
            <CardDescription>Derniers pointages enregistrés</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun pointage enregistré</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Commencez par pointer votre entrée
                </p>
                <Button onClick={handleCheckIn} className="bg-gradient-to-r from-green-500 to-green-600">
                  <LogIn className="mr-2 h-4 w-4" />
                  Pointer l'entrée
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div key={record.id} className="p-4 border rounded-lg hover:bg-muted/20 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{record.userName}</p>
                          {getStatusBadge(record.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          {record.checkIn && (
                            <div className="flex items-center gap-1">
                              <LogIn className="h-3 w-3" />
                              <span>Entrée: {record.checkIn}</span>
                            </div>
                          )}
                          {record.checkOut && (
                            <div className="flex items-center gap-1">
                              <LogOut className="h-3 w-3" />
                              <span>Sortie: {record.checkOut}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {record.hoursWorked && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{record.hoursWorked}h</p>
                          <p className="text-xs text-muted-foreground">travaillées</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides & Info */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base">Actions rapides</CardTitle>
              <CardDescription>Gestion de présence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
                onClick={handleCheckIn}
                disabled={isCheckedIn}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Pointer l'entrée
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
                onClick={handleCheckOut}
                disabled={!isCheckedIn || !!todayCheckOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Pointer la sortie
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
              >
                <Users className="mr-2 h-4 w-4" />
                Voir l'équipe
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Historique complet
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white text-base">Gestion des présences</CardTitle>
                  <CardDescription className="text-blue-100 text-xs">Fonctionnalités</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Pointage automatique avec géolocalisation</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Rapports de présence détaillés</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Calcul automatique des heures supplémentaires</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Notifications de retard automatiques</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
