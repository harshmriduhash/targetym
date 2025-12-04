'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, Search, Book, Video, MessageCircle, Mail, Phone, FileText, ExternalLink, CheckCircle2, Clock, Users, TrendingUp, Send, ChevronRight } from "lucide-react"
import { Badge } from '@/components/ui/badge';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showContactForm, setShowContactForm] = useState(false);

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'Compte',
      question: 'Comment réinitialiser mon mot de passe ?',
      answer: 'Rendez-vous sur la page de connexion, cliquez sur "Mot de passe oublié", puis suivez les instructions envoyées par email.',
      helpful: 45
    },
    {
      id: '2',
      category: 'Compte',
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Allez dans Paramètres > Profil pour mettre à jour vos informations personnelles.',
      helpful: 38
    },
    {
      id: '3',
      category: 'Congés',
      question: 'Comment soumettre une demande de congé ?',
      answer: 'Accédez à la section Congés, cliquez sur "Nouvelle demande", remplissez le formulaire et soumettez.',
      helpful: 52
    },
    {
      id: '4',
      category: 'Présence',
      question: 'Comment corriger une erreur de pointage ?',
      answer: 'Contactez votre manager ou l\'équipe RH pour corriger les erreurs de pointage.',
      helpful: 29
    },
    {
      id: '5',
      category: 'Technique',
      question: 'Le site ne se charge pas correctement',
      answer: 'Essayez de vider le cache de votre navigateur ou utilisez un autre navigateur. Si le problème persiste, contactez le support IT.',
      helpful: 41
    },
    {
      id: '6',
      category: 'Sécurité',
      question: 'Comment activer l\'authentification à deux facteurs ?',
      answer: 'Allez dans Sécurité > Authentification à deux facteurs et activez l\'option.',
      helpful: 35
    }
  ];

  const mockTickets: SupportTicket[] = [
    {
      id: '1',
      subject: 'Problème de connexion',
      status: 'resolved',
      priority: 'high',
      createdAt: '2025-10-20T10:00:00'
    },
    {
      id: '2',
      subject: 'Question sur les congés',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2025-10-23T14:30:00'
    }
  ];

  const categories = ['Compte', 'Congés', 'Présence', 'Technique', 'Sécurité'];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalFAQs: faqs.length,
    totalTickets: mockTickets.length,
    resolvedTickets: mockTickets.filter(t => t.status === 'resolved').length,
    avgResponseTime: '2h' // Mock data
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    const variants = {
      open: { label: 'Ouvert', variant: 'secondary' as const, icon: Clock },
      'in-progress': { label: 'En cours', variant: 'default' as const, icon: TrendingUp },
      resolved: { label: 'Résolu', variant: 'default' as const, icon: CheckCircle2 }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centre d'Aide</h1>
          <p className="text-muted-foreground mt-1">
            Support et ressources
          </p>
        </div>
        <Button
          onClick={() => setShowContactForm(!showContactForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Contacter le support
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">FAQs</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFAQs}</div>
            <p className="text-xs text-muted-foreground mt-1">Articles</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Actifs</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Résolus</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Temps réponse</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground mt-1">Moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      {showContactForm && (
        <Card className="bg-white dark:bg-slate-900 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle>Contacter le support</CardTitle>
            <CardDescription>Décrivez votre problème et nous vous répondrons rapidement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Sujet</label>
                <Input placeholder="Ex: Problème de connexion" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Catégorie</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Décrivez votre problème en détail..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priorité</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </Button>
                <Button variant="outline" onClick={() => setShowContactForm(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Book className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Documentation</h3>
                <p className="text-sm text-blue-100">Guides et tutoriels</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Vidéos tutoriels</h3>
                <p className="text-sm text-purple-100">Apprenez en vidéo</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Communauté</h3>
                <p className="text-sm text-green-100">Forum et discussions</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Search */}
      <Card className="bg-white dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Tout
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* FAQs */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle>Questions fréquentes ({filteredFAQs.length})</CardTitle>
            </div>
            <CardDescription>Trouvez rapidement des réponses</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Aucune réponse trouvée</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Essayez d'autres mots-clés ou contactez le support
                </p>
                <Button onClick={() => setShowContactForm(true)}>
                  Contacter le support
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="p-4 border rounded-lg hover:bg-muted/20 transition-all">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <Badge variant="outline" className="text-xs mb-2">
                          {faq.category}
                        </Badge>
                        <h4 className="font-semibold text-base mb-2">{faq.question}</h4>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Utile ({faq.helpful})
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        En savoir plus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact & Tickets */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base">Nous contacter</CardTitle>
              <CardDescription>Support disponible 24/7</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                support@targetym.com
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="mr-2 h-4 w-4" />
                +33 1 23 45 67 89
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat en direct
              </Button>
            </CardContent>
          </Card>

          {mockTickets.length > 0 && (
            <Card className="bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base">Mes tickets</CardTitle>
                <CardDescription>Demandes en cours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTickets.map((ticket) => (
                    <div key={ticket.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium">{ticket.subject}</h4>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white text-base">Besoin d'aide ?</CardTitle>
                  <CardDescription className="text-blue-100 text-xs">Nous sommes là pour vous</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-50">
                Notre équipe de support est disponible pour répondre à toutes vos questions et résoudre vos problèmes rapidement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
