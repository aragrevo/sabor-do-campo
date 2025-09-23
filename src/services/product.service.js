import { supabase } from "@/lib/supabase";
/**
 * Servicio de gestión de productos para Sabor del Campo
 * Utiliza Supabase como backend para todas las operaciones CRUD
 */
class ProductService {
  constructor() {
    this.products = [];
    this.editingId = null;
  }

  // ==================== GESTIÓN DE DATOS ====================

  /**
   * Cargar productos desde Supabase
   */
  async loadProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories (
            name
          )
        `)
      // .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Error loading products: " + error.message);
      }

      this.products = data || [];
      return this.products;
    } catch (error) {
      console.error("Error in loadProducts:", error);
      this.products = [];
      return [];
    }
  }

  // ==================== OPERACIONES CRUD ====================

  /**
   * Obtener todos los productos
   */
  getAllProducts() {
    return [...this.products];
  }

  /**
   * Obtener producto por ID
   */
  getProductById(id) {
    return this.products.find((p) => p.id === id);
  }

  /**
   * Agregar nuevo producto
   */
  async addProduct(productData) {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([{
          name: productData.name,
          category_id: productData.category,
          cost: productData.cost,
          price: productData.price,
          description: productData.description || null
        }])
        .select(`
          *,
          category:categories (
            name
          )
        `)
        .single();

      if (error) {
        console.error("Error adding product:", error);
        throw new Error("Error al agregar el producto");
      }

      // Actualizar la lista local
      this.products.unshift(data);
      return data;
    } catch (error) {
      console.error("Error in addProduct:", error);
      throw error;
    }
  }

  /**
   * Actualizar producto existente
   */
  async updateProduct(id, productData) {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          name: productData.name,
          category_id: productData.category,
          cost: productData.cost,
          price: productData.price,
          description: productData.description || null
        })
        .eq("id", id)
        .select(`
          *,
          category:categories (
            name
          )
        `)
        .single();

      if (error) {
        console.error("Error updating product:", error);
        throw new Error("Error al actualizar el producto");
      }

      // Actualizar la lista local
      const index = this.products.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.products[index] = data;
      }

      return data;
    } catch (error) {
      console.error("Error in updateProduct:", error);
      throw error;
    }
  }

  /**
   * Eliminar producto
   */
  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting product:", error);
        throw new Error("Error al eliminar el producto");
      }

      // Actualizar la lista local
      this.products = this.products.filter((p) => p.id.toString() !== id.toString());
      return true;
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      throw error;
    }
  }

  // ==================== FILTROS Y BÚSQUEDA ====================

  /**
   * Filtrar productos por término de búsqueda y categoría
   */
  filterProducts(searchTerm = "", categoryFilter = "") {
    if (!this.products) return [];
    return this.products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !categoryFilter || product.category_id.toString() === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  /**
   * Obtener todas las categorías únicas
   */
  getCategories() {
    return [...new Set(this.products.map((p) => p.category_id))];
  }

  // ==================== UTILIDADES ====================

  /**
   * Formatear moneda en pesos colombianos
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Calcular margen de ganancia
   */
  calculateMargin(cost, price) {
    if (cost === 0) return 0;
    return (((price - cost) / cost) * 100).toFixed(1);
  }

  // ==================== ESTADÍSTICAS ====================

  /**
   * Obtener estadísticas generales de productos
   */
  getStatistics() {
    const totalProducts = this.products.length;
    const totalInventoryValue = this.products.reduce(
      (sum, p) => sum + p.cost * 1,
      0,
    );
    const averageMargin =
      totalProducts > 0
        ? this.products.reduce(
          (sum, p) => sum + parseFloat(this.calculateMargin(p.cost, p.price)),
          0,
        ) / totalProducts
        : 0;
    const uniqueCategories = this.getCategories().length;

    return {
      totalProducts,
      totalInventoryValue,
      averageMargin: averageMargin.toFixed(1),
      uniqueCategories,
    };
  }

  // ==================== VALIDACIONES ====================

  /**
   * Validar datos de producto
   */
  validateProduct(productData) {
    const errors = [];

    if (!productData.name || !productData.name.trim()) {
      errors.push("El nombre del producto es obligatorio");
    }

    if (!productData.category) {
      errors.push("La categoría es obligatoria");
    }

    if (!productData.cost || productData.cost <= 0) {
      errors.push("El precio de costo debe ser mayor a 0");
    }

    if (!productData.price || productData.price <= 0) {
      errors.push("El precio de venta debe ser mayor a 0");
    }

    if (productData.price < productData.cost) {
      errors.push("El precio de venta es menor al costo");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ==================== GESTIÓN DE EDICIÓN ====================

  /**
   * Establecer producto en modo edición
   */
  setEditingProduct(id) {
    this.editingId = +id;
    return this.getProductById(+id);
  }

  /**
   * Obtener ID del producto en edición
   */
  getEditingId() {
    return this.editingId;
  }

  /**
   * Cancelar edición
   */
  cancelEdit() {
    this.editingId = null;
  }

  /**
   * Verificar si está en modo edición
   */
  isEditing() {
    return this.editingId !== null;
  }
}

export default ProductService;
