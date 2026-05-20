import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { usuarioService } from '../../../services/api';

export const useMiPerfil = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    avatar: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || user.name || '',
        email: user.email || '',
        telefono: user.telefono || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Email no válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Corrige los campos marcados');
      return;
    }

    const payload = {
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim(),
      avatar: formData.avatar.trim()
    };

    setSaving(true);
    try {
      if (user?.id) {
        await usuarioService.actualizar(user.id, payload);
      }
      updateUser(payload);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    saving,
    handleSave
  };
};
