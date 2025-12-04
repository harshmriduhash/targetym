import { Metadata } from 'next'
import { ScheduleInterviewModal } from '@/src/components/recruitment'

export const metadata: Metadata = {
  title: 'Planifier un Entretien | Targetym',
  description: 'Planifier et gérer les entretiens de recrutement',
}

export default function ScheduleInterviewPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Planifier un Entretien</h1>
          <p className="text-gray-600">
            Sélectionnez un candidat existant ou créez-en un nouveau, puis planifiez un entretien professionnel.
          </p>
        </div>

        {/* Modal trigger */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              Prêt à planifier un entretien ?
            </h2>
            <p className="text-gray-600 mb-6">
              Le système vous guidera pour sélectionner un candidat et configurer tous les détails de l'entretien.
            </p>
            <ScheduleInterviewModal />
          </div>

          {/* Features */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-medium mb-4">Fonctionnalités incluses :</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Sélection intelligente</p>
                  <p className="text-sm text-gray-600">
                    Recherchez parmi tous vos candidats ou créez-en un nouveau instantanément
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Types d'entretiens variés</p>
                  <p className="text-sm text-gray-600">
                    Téléphone, vidéo, sur site, technique, comportemental, panel
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Notifications automatiques</p>
                  <p className="text-sm text-gray-600">
                    Invitations calendrier et emails de préparation automatiques
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Rappels configurables</p>
                  <p className="text-sm text-gray-600">
                    Rappels automatiques 1h, 4h, 24h ou 48h avant l'entretien
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            💡 Comment ça marche ?
          </h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>
                Cliquez sur "Planifier un entretien" pour ouvrir le formulaire
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>
                Sélectionnez un candidat existant dans la liste ou créez-en un nouveau
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>
                Choisissez le type d'entretien (la durée recommandée s'affiche automatiquement)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>
                Configurez la date, l'heure, le lieu ou le lien de réunion
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">5.</span>
              <span>
                Indiquez les intervieweurs et ajoutez des notes si nécessaire
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">6.</span>
              <span>
                Les notifications sont envoyées automatiquement au candidat et aux intervieweurs
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
