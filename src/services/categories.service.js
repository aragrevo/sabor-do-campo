import { supabase } from "@/lib/supabase";

class CategoryService {
  constructor() {
    this.categories = this.loadCategories();
  }

  // ==================== GESTIÓN DE DATOS ====================

  /**
   * Cargar categorias desde localStorage
   * En el futuro, esto se reemplazará por una llamada a API
   */
  async loadCategories() {
    const { data, error } = await supabase.from("categories").select();

    if (error) {
      console.error("Error loading categories:", error);
      return [];
    }
    return data;
  }
}

export default CategoryService;
