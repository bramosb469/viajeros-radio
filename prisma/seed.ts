import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando la siembra de la base de datos...')

  // 1. SiteSettings
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  })
  console.log('✅ SiteSettings sembrado')

  // 2. MenuItem
  const menuItems = [
    { slug: '/', label: 'Inicio', displayOrder: 1, visible: true, icon: 'home' },
    { slug: '/programacion', label: 'Programación', displayOrder: 2, visible: true, icon: 'radio' },
    { slug: '/eventos', label: 'Eventos', displayOrder: 3, visible: true, icon: 'calendar' },
    { slug: '/videos-fotos', label: 'Videos y Fotos', displayOrder: 4, visible: true, icon: 'play' },
    { slug: '/nosotros', label: 'Nosotros', displayOrder: 5, visible: true, icon: 'users' },
    { slug: '/contacto', label: 'Contacto', displayOrder: 6, visible: true, icon: 'mail' },
  ]

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    })
  }
  console.log(`✅ ${menuItems.length} MenuItems sembrados`)

  // 3. SocialNetwork
  await prisma.socialNetwork.deleteMany()
  const socialNetworks = [
    { platform: 'youtube', url: 'https://www.youtube.com/@viajerosr-tv', label: 'YouTube', visible: true, displayOrder: 1 },
    { platform: 'facebook', url: 'https://www.facebook.com/p/ViajerosRadio21-61550575326473/', label: 'Facebook', visible: true, displayOrder: 2 },
    { platform: 'instagram', url: 'https://www.instagram.com/viajerosradio21/', label: 'Instagram', visible: true, displayOrder: 3 },
  ]

  for (const sn of socialNetworks) {
    await prisma.socialNetwork.create({ data: sn })
  }
  console.log(`✅ ${socialNetworks.length} SocialNetworks sembradas`)

  // 4. AboutSection
  const aboutSections = [
    { sectionKey: 'historia', title: 'Nuestra Historia', displayOrder: 1, visible: true },
    { sectionKey: 'mision', title: 'Nuestra Misión', displayOrder: 2, visible: true },
    { sectionKey: 'quienes-somos', title: 'Quiénes Somos', displayOrder: 3, visible: true },
  ]

  for (const section of aboutSections) {
    await prisma.aboutSection.upsert({
      where: { sectionKey: section.sectionKey },
      update: section,
      create: section,
    })
  }
  console.log(`✅ ${aboutSections.length} AboutSections sembradas`)

  console.log('🎉 Siembra completada con éxito!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante la siembra:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
