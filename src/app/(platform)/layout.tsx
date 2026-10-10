import { IncidentsProvider } from '@/components/incidents/incidents-provider';

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <IncidentsProvider>{children}</IncidentsProvider>;
}
