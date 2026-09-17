require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@viajerosradio.uy";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

async function main() {
  const { auth } = await import("../src/lib/auth");
  const { prisma } = await import("../src/lib/db");

  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: "Administrador",
      },
    });

    await prisma.user.update({
      where: { id: result.user.id },
      data: { role: "admin" },
    });

    console.log(`✅ Usuario admin creado: ${ADMIN_EMAIL}`);
    console.log(`   Contraseña: ${ADMIN_PASSWORD}`);
  } catch (e: any) {
    if (e?.message?.includes("already") || e?.code === "P2002") {
      console.log(`ℹ️  El admin ya existe: ${ADMIN_EMAIL}`);
    } else {
      console.error("❌ Error al crear admin:", e);
      process.exit(1);
    }
  }
}

main().finally(() => process.exit(0));