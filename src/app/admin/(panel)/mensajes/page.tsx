import { prisma } from "@/lib/db";
import { toggleMessageRead, deleteMessage } from "../actions";
import styles from "./mensajes.module.css";

export const dynamic = "force-dynamic";

export default async function MensajesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Mensajes de contacto</h2>
          <p className={styles.subtitle}>
            {unread} sin leer · {messages.length} en total
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <p className={styles.empty}>Todavía no recibiste mensajes.</p>
      ) : (
        <div className={styles.list}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.card} ${!msg.read ? styles.unread : ""}`}
            >
              <div className={styles.cardTop}>
                <div className={styles.sender}>
                  <strong>{msg.name}</strong>
                  <span className={styles.email}>{msg.email}</span>
                </div>
                {!msg.read && <span className={styles.badge}>NUEVO</span>}
              </div>
              <p className={styles.message}>{msg.message}</p>
              <div className={styles.cardBottom}>
                <span className={styles.date}>
                  {msg.createdAt.toLocaleString("es-UY")}
                </span>
                <div className={styles.actions}>
                  <form action={toggleMessageRead.bind(null, msg.id)}>
                    <button className={styles.readBtn} type="submit">
                      {msg.read ? "Marcar no leído" : "Marcar leído"}
                    </button>
                  </form>
                  <form action={deleteMessage.bind(null, msg.id)}>
                    <button className={styles.deleteBtn} type="submit">
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}