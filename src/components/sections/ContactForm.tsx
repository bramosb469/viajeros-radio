'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus('error');
      setErrorMessage('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el mensaje');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Hubo un problema al enviar tu mensaje. Inténtalo de nuevo más tarde.');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>Nombre completo</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={styles.input}
          placeholder="Tu nombre"
          disabled={status === 'sending'}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>Correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          placeholder="tu@email.com"
          disabled={status === 'sending'}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.label}>Mensaje</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className={styles.textarea}
          placeholder="Escribe tu mensaje aquí..."
          rows={5}
          disabled={status === 'sending'}
        />
      </div>

      {status === 'error' && <div className={styles.errorAlert}>{errorMessage}</div>}
      
      {status === 'success' && (
        <div className={styles.successAlert}>
          ¡Mensaje enviado correctamente! Te responderemos a la brevedad.
        </div>
      )}

      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={status === 'sending'}
      >
        {status === 'sending' ? (
          <span className={styles.loading}>Enviando...</span>
        ) : (
          'ENVIAR MENSAJE'
        )}
      </button>
    </form>
  );
}