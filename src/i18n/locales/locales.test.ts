import { en, es } from './index';

describe('Locales', () => {
  describe('English translations', () => {
    it('should have common translations', () => {
      expect(en.common).toBeDefined();
      expect(en.common.loading).toBe('Loading...');
      expect(en.common.error).toBe('An error occurred');
      expect(en.common.save).toBe('Save');
    });

    it('should have validation translations', () => {
      expect(en.validation).toBeDefined();
      expect(en.validation.required).toBe('This field is required');
      expect(en.validation.email).toBe('Please enter a valid email');
    });
  });

  describe('Spanish translations', () => {
    it('should have common translations', () => {
      expect(es.common).toBeDefined();
      expect(es.common.loading).toBe('Cargando...');
      expect(es.common.error).toBe('Ocurrió un error');
      expect(es.common.save).toBe('Guardar');
    });

    it('should have validation translations', () => {
      expect(es.validation).toBeDefined();
      expect(es.validation.required).toBe('Este campo es requerido');
      expect(es.validation.email).toBe('Por favor ingrese un email válido');
    });

    it('should have matching structure with English', () => {
      const enKeys = Object.keys(en);
      const esKeys = Object.keys(es);

      expect(esKeys).toEqual(enKeys);
    });
  });
});
