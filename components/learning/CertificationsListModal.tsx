'use client';

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Award, AlertTriangle, Calendar } from 'lucide-react';

interface Certification {
  id: string;
  title: string;
  provider: string;
  issueDate: string;
  expiryDate?: string;
  renewalRequired: boolean;
  status?: string;
}

interface CertificationsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certifications?: Certification[];
}

export default function CertificationsListModal({
  open,
  onOpenChange,
  certifications = []
}: CertificationsListModalProps) {
  const certificationGroups = useMemo(() => {
    const now = new Date();
    const sortedCertifications = [...certifications].sort((a, b) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );

    const categorized: Record<'active' | 'expiring' | 'expired', Certification[]> = {
      active: [],
      expiring: [],
      expired: [],
    };

    sortedCertifications.forEach(cert => {
      const certIssueDate = new Date(cert.issueDate);
      const certExpiryDate = cert.expiryDate ? new Date(cert.expiryDate) : null;

      if (certExpiryDate) {
        if (certExpiryDate < now) {
          categorized.expired.push(cert);
        } else {
          const daysUntilExpiry = (certExpiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
          
          if (daysUntilExpiry <= 90) {
            categorized.expiring.push(cert);
          } else {
            categorized.active.push(cert);
          }
        }
      } else {
        categorized.active.push(cert);
      }
    });

    return categorized;
  }, [certifications]);

  const renderCertificationList = (certList: Certification[], status: 'active' | 'expiring' | 'expired') => {
    return certList.map(cert => {
      const issueDate = new Date(cert.issueDate);
      const expiryDate = cert.expiryDate ? new Date(cert.expiryDate) : null;

      return (
        <div key={cert.id} className="border-b pb-3 mb-3 last:border-b-0">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{cert.title}</h3>
              <div className="text-sm text-gray-600 mt-1">
                {cert.provider}
              </div>
            </div>
            <Badge
              variant={
                status === 'active' ? 'default' :
                status === 'expiring' ? 'secondary' :
                'destructive'
              }
            >
              {status === 'active' ? 'Actif' : 
               status === 'expiring' ? 'Expiration proche' : 
               'Expiré'}
            </Badge>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Émis le {issueDate.toLocaleDateString()}</span>
            </div>
            {expiryDate && (
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>{cert.renewalRequired ? 'Renouvellement requis' : 'Pas de renouvellement'}</span>
                <span>• Expire le {expiryDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Award className="mr-2" /> Liste des certifications
          </DialogTitle>
          <DialogDescription>
            Vue d&apos;ensemble de vos certifications professionnelles
          </DialogDescription>
        </DialogHeader>

        {certificationGroups.expired.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {certificationGroups.expired.length} certification(s) ont expiré. Pensez à les renouveler.
            </AlertDescription>
          </Alert>
        )}

        {certificationGroups.expiring.length > 0 && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {certificationGroups.expiring.length} certification(s) approchent de leur date d&apos;expiration.
            </AlertDescription>
          </Alert>
        )}

        {certificationGroups.active.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-4 mb-2">Certifications actives</h2>
            {renderCertificationList(certificationGroups.active, 'active')}
          </>
        )}

        {certificationGroups.expiring.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-4 mb-2">Certifications qui expirent bientôt</h2>
            {renderCertificationList(certificationGroups.expiring, 'expiring')}
          </>
        )}

        {certificationGroups.expired.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mt-4 mb-2">Certifications expirées</h2>
            {renderCertificationList(certificationGroups.expired, 'expired')}
          </>
        )}

        {certifications.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Aucune certification enregistrée
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
