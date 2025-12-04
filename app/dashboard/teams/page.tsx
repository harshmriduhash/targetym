'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Hash,
  Video,
  Search,
  RefreshCw,
  Link as LinkIcon,
  Users,
  Calendar,
  Phone
} from "lucide-react";

const TEAMS_CHANNELS = [
  {
    id: 'channel-1',
    name: 'Général',
    team: 'Équipe RH',
    messages: 156,
    members: 12,
    lastActivity: '5 min ago',
    unread: 3
  },
  {
    id: 'channel-2',
    name: 'Recrutement',
    team: 'Équipe RH',
    messages: 89,
    members: 5,
    lastActivity: '2 hours ago',
    unread: 0
  },
  {
    id: 'channel-3',
    name: 'Onboarding',
    team: 'Équipe RH',
    messages: 234,
    members: 8,
    lastActivity: '1 day ago',
    unread: 1
  },
];

const RECENT_MESSAGES = [
  { id: '1', channel: 'Général', author: 'Marie Dubois', message: 'Réunion planifiée pour demain à 10h', time: '5 min ago', unread: true },
  { id: '2', channel: 'Recrutement', author: 'Jean Martin', message: 'Nouveau candidat pour le poste de Dev Senior', time: '2 hours ago', unread: true },
  { id: '3', channel: 'Onboarding', author: 'Sophie Laurent', message: 'Checklist onboarding mise à jour', time: '1 day ago', unread: true },
  { id: '4', channel: 'Général', author: 'Pierre Durand', message: 'Bonne semaine à tous!', time: '2 days ago', unread: false },
];

const UPCOMING_MEETINGS = [
  { id: '1', title: 'Weekly Team Sync', time: 'Demain 10:00', attendees: 12, channel: 'Général' },
  { id: '2', title: 'Entretien candidat', time: 'Vendredi 14:00', attendees: 3, channel: 'Recrutement' },
  { id: '3', title: 'Onboarding Session', time: 'Lundi 9:00', attendees: 5, channel: 'Onboarding' },
];

export default function TeamsPage() {
  const [isConnected, setIsConnected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChannels = TEAMS_CHANNELS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-purple-600/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              Microsoft Teams Integration
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez vos équipes et canaux Teams depuis Targetym
            </p>
          </div>

          {isConnected ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchroniser
              </Button>
              <Button size="sm">
                <Video className="h-4 w-4 mr-2" />
                Nouvelle réunion
              </Button>
            </div>
          ) : (
            <Button>
              <LinkIcon className="h-4 w-4 mr-2" />
              Connecter Teams
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Équipes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Équipe RH</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Canaux</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Messages non lus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">À lire</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Réunions à venir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un canal..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Channels Grid */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Canaux Teams</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map((channel) => (
            <Card key={channel.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-600/10 rounded-lg">
                      <Hash className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{channel.name}</CardTitle>
                      <CardDescription className="mt-1">{channel.team}</CardDescription>
                    </div>
                  </div>
                  {channel.unread > 0 && (
                    <Badge variant="destructive">{channel.unread}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {channel.messages}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {channel.members}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Dernière activité: {channel.lastActivity}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Ouvrir le canal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Messages & Meetings Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Messages récents</CardTitle>
            <CardDescription>Dernières conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_MESSAGES.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <MessageSquare className={`h-4 w-4 mt-0.5 ${msg.unread ? 'text-purple-600' : 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.author}</span>
                      <Badge variant="secondary" className="text-xs">#{msg.channel}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Réunions à venir</CardTitle>
            <CardDescription>Prochaines réunions Teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {UPCOMING_MEETINGS.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Video className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="font-medium text-sm">{meeting.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {meeting.time} • {meeting.attendees} participants
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
