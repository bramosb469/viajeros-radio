import { Metadata } from 'next';
import prisma from '@/lib/db';
import TabsContent from './TabsContent';

export const metadata: Metadata = {
  title: 'Videos y Fotos - Viajeros Radio',
  description: 'Revive los mejores momentos de Viajeros Radio en nuestra galería multimedia.',
};

export default async function VideosFotosPage() {
  const [videos, albums] = await Promise.all([
    prisma.video.findMany({
      where: { visible: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.album.findMany({
      where: { published: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { photos: true },
        },
      },
    }),
  ]);

  return (
    <div className="container section-padding">
      <h1 className="fade-in" style={{ textAlign: 'center', fontFamily: 'var(--font-heading)', color: 'var(--color-brown)', marginBottom: '2rem' }}>
        Galería Multimedia
      </h1>
      
      <TabsContent videos={videos} albums={albums} />
    </div>
  );
}