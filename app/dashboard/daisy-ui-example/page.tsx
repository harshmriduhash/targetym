'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'

/**
 * Page d'Exemple: Daisy UI + shadcn/ui Coexistence
 *
 * Cette page démontre comment utiliser Daisy UI et shadcn/ui ensemble.
 * - Section 1: Composants Daisy UI (avec préfixe daisy-)
 * - Section 2: Composants shadcn/ui (existants)
 * - Section 3: Comparaison côte à côte
 */

export default function DaisyUIExamplePage() {
  const [activeTab, setActiveTab] = useState('daisy')

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Daisy UI + shadcn/ui Coexistence</h1>
        <p className="text-muted-foreground">
          Exemple de page utilisant les deux bibliothèques UI ensemble
        </p>
      </div>

      {/* Tabs pour changer de vue */}
      <div className="daisy-tabs daisy-tabs-boxed">
        <button
          className={`daisy-tab ${activeTab === 'daisy' ? 'daisy-tab-active' : ''}`}
          onClick={() => setActiveTab('daisy')}
        >
          Daisy UI
        </button>
        <button
          className={`daisy-tab ${activeTab === 'shadcn' ? 'daisy-tab-active' : ''}`}
          onClick={() => setActiveTab('shadcn')}
        >
          shadcn/ui
        </button>
        <button
          className={`daisy-tab ${activeTab === 'both' ? 'daisy-tab-active' : ''}`}
          onClick={() => setActiveTab('both')}
        >
          Comparaison
        </button>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'daisy' && <DaisyUISection />}
      {activeTab === 'shadcn' && <ShadcnSection />}
      {activeTab === 'both' && <ComparisonSection />}
    </div>
  )
}

/** Section Daisy UI */
function DaisyUISection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Composants Daisy UI</h2>

      {/* Badges */}
      <div className="daisy-card bg-base-100 shadow-xl">
        <div className="daisy-card-body">
          <h2 className="daisy-card-title">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <div className="daisy-badge daisy-badge-primary">Primary</div>
            <div className="daisy-badge daisy-badge-secondary">Secondary</div>
            <div className="daisy-badge daisy-badge-accent">Accent</div>
            <div className="daisy-badge daisy-badge-info">Info</div>
            <div className="daisy-badge daisy-badge-success">Success</div>
            <div className="daisy-badge daisy-badge-warning">Warning</div>
            <div className="daisy-badge daisy-badge-error">Error</div>
            <div className="daisy-badge daisy-badge-ghost">Ghost</div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="daisy-card bg-base-100 shadow-xl">
        <div className="daisy-card-body">
          <h2 className="daisy-card-title">Boutons</h2>
          <div className="flex flex-wrap gap-2">
            <button className="daisy-btn daisy-btn-primary">Primary</button>
            <button className="daisy-btn daisy-btn-secondary">Secondary</button>
            <button className="daisy-btn daisy-btn-accent">Accent</button>
            <button className="daisy-btn daisy-btn-info">Info</button>
            <button className="daisy-btn daisy-btn-success">Success</button>
            <button className="daisy-btn daisy-btn-warning">Warning</button>
            <button className="daisy-btn daisy-btn-error">Error</button>
            <button className="daisy-btn daisy-btn-ghost">Ghost</button>
            <button className="daisy-btn daisy-btn-link">Link</button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <div className="daisy-alert daisy-alert-info">
          <CheckCircle2 className="h-5 w-5" />
          <span>Ceci est une alerte d'information Daisy UI</span>
        </div>
        <div className="daisy-alert daisy-alert-success">
          <CheckCircle2 className="h-5 w-5" />
          <span>Opération réussie avec Daisy UI</span>
        </div>
        <div className="daisy-alert daisy-alert-warning">
          <AlertTriangle className="h-5 w-5" />
          <span>Attention! Ceci est un avertissement Daisy UI</span>
        </div>
        <div className="daisy-alert daisy-alert-error">
          <XCircle className="h-5 w-5" />
          <span>Erreur détectée avec Daisy UI</span>
        </div>
      </div>

      {/* Stats */}
      <div className="daisy-stats shadow">
        <div className="daisy-stat">
          <div className="daisy-stat-figure text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="daisy-stat-title">Téléchargements</div>
          <div className="daisy-stat-value text-primary">25.6K</div>
          <div className="daisy-stat-desc">21% de plus qu'hier</div>
        </div>

        <div className="daisy-stat">
          <div className="daisy-stat-figure text-secondary">
            <Clock className="h-8 w-8" />
          </div>
          <div className="daisy-stat-title">Utilisateurs</div>
          <div className="daisy-stat-value text-secondary">2.6M</div>
          <div className="daisy-stat-desc">Croissance de 40%</div>
        </div>

        <div className="daisy-stat">
          <div className="daisy-stat-figure text-accent">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="daisy-stat-title">Nouveaux</div>
          <div className="daisy-stat-value">1,200</div>
          <div className="daisy-stat-desc">Nouveaux cette semaine</div>
        </div>
      </div>

      {/* Form */}
      <div className="daisy-card bg-base-100 shadow-xl">
        <div className="daisy-card-body">
          <h2 className="daisy-card-title">Formulaire</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="daisy-input daisy-input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Message</span>
              </label>
              <textarea
                className="daisy-textarea daisy-textarea-bordered h-24"
                placeholder="Votre message..."
              ></textarea>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">J'accepte les conditions</span>
                <input type="checkbox" className="daisy-checkbox daisy-checkbox-primary" />
              </label>
            </div>

            <button className="daisy-btn daisy-btn-primary w-full">Envoyer</button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="daisy-card bg-base-100 shadow-xl">
        <div className="daisy-card-body">
          <h2 className="daisy-card-title">Progress Bars</h2>
          <div className="space-y-4">
            <progress className="daisy-progress daisy-progress-primary w-full" value="25" max="100"></progress>
            <progress className="daisy-progress daisy-progress-secondary w-full" value="50" max="100"></progress>
            <progress className="daisy-progress daisy-progress-accent w-full" value="75" max="100"></progress>
            <progress className="daisy-progress daisy-progress-success w-full" value="100" max="100"></progress>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Section shadcn/ui */
function ShadcnSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Composants shadcn/ui (Existants)</h2>

      <div className="p-6 border rounded-lg bg-card text-card-foreground">
        <p className="text-muted-foreground">
          Les composants shadcn/ui continuent de fonctionner normalement.
          Ils sont toujours disponibles dans <code className="text-primary">components/ui/</code>
        </p>
        <p className="mt-4 text-sm">
          Vous pouvez continuer à les utiliser ou migrer progressivement vers Daisy UI.
        </p>
      </div>
    </div>
  )
}

/** Section Comparaison */
function ComparisonSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comparaison: Daisy UI vs shadcn/ui</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daisy UI */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary">Daisy UI</h3>

          <div className="daisy-card bg-base-100 shadow-xl">
            <div className="daisy-card-body">
              <h2 className="daisy-card-title">
                Card Daisy UI
                <div className="daisy-badge daisy-badge-secondary">NEW</div>
              </h2>
              <p>Exemple de card avec Daisy UI. Utilise des classes CSS natives.</p>
              <div className="daisy-card-actions justify-end">
                <button className="daisy-btn daisy-btn-primary daisy-btn-sm">Voir plus</button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="daisy-badge daisy-badge-success gap-2">
              <CheckCircle2 className="h-3 w-3" />
              Approuvé
            </div>
            <div className="daisy-badge daisy-badge-warning gap-2">
              <Clock className="h-3 w-3" />
              En attente
            </div>
            <div className="daisy-badge daisy-badge-error gap-2">
              <XCircle className="h-3 w-3" />
              Rejeté
            </div>
          </div>

          <div className="daisy-alert daisy-alert-success">
            <CheckCircle2 className="h-5 w-5" />
            <span>Migration réussie vers Daisy UI!</span>
          </div>
        </div>

        {/* shadcn/ui */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary">shadcn/ui</h3>

          <div className="border rounded-lg bg-card text-card-foreground p-4 shadow">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Card shadcn/ui
                <span className="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground">
                  OLD
                </span>
              </h2>
              <p className="text-muted-foreground">Exemple de card avec shadcn/ui. Utilise des composants React.</p>
              <div className="flex justify-end pt-2">
                <button className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90">
                  Voir plus
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle2 className="h-3 w-3" />
              Approuvé
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <Clock className="h-3 w-3" />
              En attente
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <XCircle className="h-3 w-3" />
              Rejeté
            </span>
          </div>

          <div className="p-4 rounded border border-green-500 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Toujours fonctionnel!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau de comparaison */}
      <div className="daisy-card bg-base-100 shadow-xl">
        <div className="daisy-card-body">
          <h2 className="daisy-card-title">Avantages et Inconvénients</h2>
          <div className="daisy-overflow-x-auto">
            <table className="daisy-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Daisy UI</th>
                  <th>shadcn/ui</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Type</th>
                  <td>Classes CSS natives</td>
                  <td>Composants React</td>
                </tr>
                <tr>
                  <th>Taille Bundle</th>
                  <td className="text-success">Plus léger (CSS seulement)</td>
                  <td className="text-warning">Plus lourd (JS + CSS)</td>
                </tr>
                <tr>
                  <th>TypeScript</th>
                  <td className="text-warning">Pas de types pour les props</td>
                  <td className="text-success">Types complets</td>
                </tr>
                <tr>
                  <th>Personnalisation</th>
                  <td className="text-success">Thèmes prédéfinis</td>
                  <td className="text-success">Composants modifiables</td>
                </tr>
                <tr>
                  <th>Complexité</th>
                  <td className="text-success">Simple (HTML + classes)</td>
                  <td className="text-warning">Plus complexe (React)</td>
                </tr>
                <tr>
                  <th>Accessibilité</th>
                  <td className="text-warning">À gérer manuellement</td>
                  <td className="text-success">Radix UI (excellent)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
