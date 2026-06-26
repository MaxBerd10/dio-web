'use client';

import { useState } from 'react';
import { Award, Download, GraduationCap } from 'lucide-react';

import { useMyCertificates } from '@/lib/hooks/use-certificates';
import { certificateApi, type Certificate } from '@/lib/api/certificates';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await certificateApi.downloadCertificate(certificate.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${certificate.certificate_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.04] bg-amber-500" />
      <CardContent className="p-5 relative">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 text-2xl">
            {certificate.course_icon || '🎓'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight truncate">
              {certificate.course_title}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {formatDate(certificate.issued_at)} · № {certificate.certificate_number}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={cn(
            'mt-4 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors',
            'bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50',
          )}
        >
          <Download className="h-4 w-4" />
          {downloading ? 'Yuklanmoqda...' : 'PDF yuklab olish'}
        </button>
      </CardContent>
    </Card>
  );
}

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useMyCertificates();

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Award className="h-7 w-7 text-amber-500" />
          Sertifikatlarim
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-1.5 text-sm md:text-base">
          Bir kursni to'liq tugatganingizda, sertifikat avtomatik shu yerda paydo bo'ladi.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : !certificates || certificates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] py-16 px-6 text-center">
          <GraduationCap className="h-10 w-10 mx-auto mb-3 text-[var(--color-muted-foreground)]" />
          <h3 className="font-semibold text-lg mb-1">Hali sertifikat yo'q</h3>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-md mx-auto">
            Birinchi sertifikatingizni olish uchun istalgan kursdagi barcha darslarni to'liq tugating.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
}