import { supabase } from "@/lib/supabase";

/**
 * Servicio de autenticación para Sabor del Campo
 * Utiliza Supabase Auth para todas las operaciones de autenticación
 */
export class AuthService {
  /**
   * Autentica un usuario con credenciales usando Supabase Auth
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<{success: boolean, user?: object, message?: string}>}
   */
  static async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });



      if (error) {
        console.error("Error en login:", error);
        return {
          success: false,
          message: this.getErrorMessage(error),
        };
      }

      if (data.user) {
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email,
          },
          message: "Login exitoso",
        };
      }

      return {
        success: false,
        message: "Error desconocido en la autenticación",
      };
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        message: "Error en el servidor",
      };
    }
  }

  /**
   * Cierra la sesión del usuario actual usando Supabase Auth
   */
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error en logout:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  }

  /**
   * Verifica si hay una sesión activa usando Supabase Auth
   * @returns {Promise<boolean>}
   */
  static async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      return session !== null;
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      return false;
    }
  }

  /**
   * Obtiene la información del usuario actual desde Supabase Auth
   * @returns {Promise<object|null>}
   */
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email,
        };
      }

      return null;
    } catch (error) {
      console.error("Error obteniendo usuario actual:", error);
      return null;
    }
  }

  /**
   * Verifica autenticación y redirige si es necesario
   * @param {string} redirectUrl - URL de redirección si no está autenticado
   */
  static async requireAuth(redirectUrl = "/login") {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      window.location.href = redirectUrl;
      throw new Error("No autorizado");
    }
  }

  /**
   * Actualiza la información del usuario en la UI
   * @param {string} containerId - ID del contenedor donde mostrar la info
   */
  static async updateUserInfo(containerId = "userInfo") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isAuth = await this.isAuthenticated();
    if (isAuth) {
      const user = await this.getCurrentUser();
      if (user) {
        container.innerHTML = `
          <span class="text-gray-700 mr-4">👤 ${user.name}</span>
          <button id="logoutBtn" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
            Cerrar Sesión
          </button>
        `;

        // Agregar event listener al botón de logout
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", async () => {
            try {
              await this.logout();
              window.location.href = "/login";
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              alert("Error al cerrar sesión");
            }
          });
        }
      }
    } else {
      container.innerHTML = "";
    }
  }

  /**
   * Registra un nuevo usuario usando Supabase Auth
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @param {string} name - Nombre del usuario
   * @returns {Promise<{success: boolean, user?: object, message?: string}>}
   */
  static async register(email, password, name) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        console.error("Error en registro:", error);
        return {
          success: false,
          message: this.getErrorMessage(error),
        };
      }

      if (data.user) {
        return {
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            name: name,
          },
          message: "Registro exitoso. Revisa tu email para confirmar tu cuenta.",
        };
      }

      return {
        success: false,
        message: "Error desconocido en el registro",
      };
    } catch (error) {
      console.error("Error en registro:", error);
      return {
        success: false,
        message: "Error en el servidor",
      };
    }
  }

  /**
   * Convierte errores de Supabase a mensajes legibles
   * @param {object} error - Error de Supabase
   * @returns {string} - Mensaje de error legible
   */
  static getErrorMessage(error) {
    switch (error.message) {
      case "Invalid login credentials":
        return "Credenciales incorrectas";
      case "Email not confirmed":
        return "Email no confirmado. Revisa tu bandeja de entrada.";
      case "User already registered":
        return "El usuario ya está registrado";
      case "Password should be at least 6 characters":
        return "La contraseña debe tener al menos 6 caracteres";
      case "Unable to validate email address: invalid format":
        return "Formato de email inválido";
      default:
        return error.message || "Error desconocido";
    }
  }

  /**
   * Escucha cambios en el estado de autenticación
   * @param {function} callback - Función a ejecutar cuando cambie el estado
   */
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
}

// Exportar como default también para mayor flexibilidad
export default AuthService;
