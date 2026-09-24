import { prisma } from "@/lib/db";
import SettingsForm from "./SettingsForm";
import PasswordForm from "./PasswordForm";
import BackupSection from "./BackupSection";
import styles from "./ajustes.module.css";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const settings = await prisma.siteSettings.findFirst();

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Ajustes del sitio</h2>
        <p className={styles.subtitle}>
          Nombre, eslogan, logo, stream y contacto de WhatsApp.
        </p>
      </div>
      <SettingsForm
        settings={
          settings ?? {
            id: 1,
            siteName: "",
            slogan: "",
            logoUrl: "",
            faviconUrl: "",
            streamUrl: "",
            metaTitle: "",
            metaDescription: "",
            ogImage: null,
            contactName: null,
            contactEmail: null,
            whatsappNumber: null,
            whatsappMessage: "",
            whatsappEnabled: false,
            footerText: "",
          }
        }
      />
      <PasswordForm />
      <BackupSection />
    </div>
  );
}