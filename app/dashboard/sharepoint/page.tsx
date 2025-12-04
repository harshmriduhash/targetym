'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Folder,
  Upload,
  Download,
  Search,
  RefreshCw,
  Link as LinkIcon,
  Clock,
  Users,
  FolderOpen
} from "lucide-react";

const SHAREPOINT_FOLDERS = [
  {
    id: 'folder-1',
    name: 'Documents RH',
    files: 24,
    size: '142 MB',
    lastModified: '2 hours ago',
    sharedWith: 5
  },
  {
    id: 'folder-2',
    name: 'Politiques & Procédures',
    files: 18,
    size: '89 MB',
    lastModified: '1 day ago',
    sharedWith: 12
  },
  {
    id: 'folder-3',
    name: 'Formation & Onboarding',
    files: 32,
    size: '256 MB',
    lastModified: '3 days ago',
    sharedWith: 8
  },
];

const RECENT_FILES = [
  { id: '1', name: 'Contrat CDI Template 2025.docx', folder: 'Documents RH', size: '45 KB', modified: '2 hours ago', author: 'Marie Dubois' },
  { id: '2', name: 'Guide Onboarding 2025.pdf', folder: 'Formation & Onboarding', size: '2.3 MB', modified: '1 day ago', author: 'Jean Martin' },
  { id: '3', name: 'Politique Télétravail.pdf', folder: 'Politiques & Procédures', size: '156 KB', modified: '3 days ago', author: 'Sophie Laurent' },
  { id: '4', name: 'Grille Salariale 2025.xlsx', folder: 'Documents RH', size: '78 KB', modified: '1 week ago', author: 'Pierre Durand' },
];

export default function SharepointPage() {
  const [isConnected, setIsConnected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 rounded-lg">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              SharePoint Integration
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Accédez à vos documents SharePoint depuis Targetym
            </p>
          </div>

          {isConnected ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchroniser
              </Button>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Uploader
              </Button>
            </div>
          ) : (
            <Button>
              <LinkIcon className="h-4 w-4 mr-2" />
              Connecter SharePoint
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Dossiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Synchronisés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Fichiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Stockage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">487 MB</div>
            <p className="text-xs text-muted-foreground">Utilisé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Partages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">Membres</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un document..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Folders Grid */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Dossiers SharePoint</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHAREPOINT_FOLDERS.map((folder) => (
            <Card key={folder.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-600/10 rounded-lg">
                    <Folder className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{folder.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {folder.files} fichiers • {folder.size}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {folder.lastModified}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {folder.sharedWith} membres
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Ouvrir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <Card>
        <CardHeader>
          <CardTitle>Fichiers récents</CardTitle>
          <CardDescription>Derniers documents modifiés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECENT_FILES.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {file.folder} • {file.size} • Modifié par {file.author}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{file.modified}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
