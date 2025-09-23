/**
 * Servicio de Autenticación
 * Centraliza toda la lógica de autenticación para facilitar futuras implementaciones externas
 */

export class AuthService {
  // Configuración de usuarios (temporal - puede ser reemplazado por API externa)
  static users = [
    { username: 'admin', password: 'admin123', name: 'Administrador' },
    { username: 'usuario', password: 'user123', name: 'Usuario Demo' }
  ];

  /**
   * Autentica un usuario con credenciales
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<{success: boolean, user?: object, message?: string}>}
   */
  static async login(username, password) {
    try {
      // Simular delay de API (puede ser removido en implementación real)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validar credenciales
      const user = this.users.find(u => u.username === username && u.password === password);
      
      if (user) {
        // Guardar sesión en localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
          username: user.username,
          name: user.name
        }));

        return {
          success: true,
          user: { username: user.username, name: user.name },
          message: 'Login exitoso'
        };
      } else {
        return {
          success: false,
          message: 'Credenciales incorrectas'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error en el servidor'
      };
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  static logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  }

  /**
   * Verifica si hay una sesión activa
   * @returns {boolean}
   */
  static isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  /**
   * Obtiene la información del usuario actual
   * @returns {object|null}
   */
  static getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verifica autenticación y redirige si es necesario
   * @param {string} redirectUrl - URL de redirección si no está autenticado
   */
  static requireAuth(redirectUrl = '/login') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectUrl;
      throw new Error('No autorizado');
    }
  }

  /**
   * Actualiza la información del usuario en la UI
   * @param {string} containerId - ID del contenedor donde mostrar la info
   */
  static updateUserInfo(containerId = 'userInfo') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.isAuthenticated()) {
      const user = this.getCurrentUser();
      container.innerHTML = `
        <span class="text-gray-700 mr-4">👤 ${user.name}</span>
        <button id="logoutBtn" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
          Cerrar Sesión
        </button>
      `;

      // Agregar event listener al botón de logout
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          this.logout();
          window.location.href = '/login';
        });
      }
    } else {
      container.innerHTML = '';
    }
  }
}

// Exportar como default también para mayor flexibilidad
export default AuthService;