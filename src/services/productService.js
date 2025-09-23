/**
 * Servicio de gestión de productos para Sabor del Campo
 * Centraliza toda la lógica de productos para facilitar futuras implementaciones externas
 */
class ProductService {
  constructor() {
    this.products = this.loadProducts();
    this.editingId = null;
  }

  // ==================== GESTIÓN DE DATOS ====================

  /**
   * Cargar productos desde localStorage
   * En el futuro, esto se reemplazará por una llamada a API
   */
  loadProducts() {
    const stored = localStorage.getItem("sabor-del-campo-products");
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Guardar productos en localStorage
   * En el futuro, esto se reemplazará por una llamada a API
   */
  saveProducts() {
    localStorage.setItem(
      "sabor-del-campo-products",
      JSON.stringify(this.products)
    );
  }

  /**
   * Generar ID único para productos
   * En el futuro, esto lo manejará el backend
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
    return this.products.find(p => p.id === id);
  }

  /**
   * Agregar nuevo producto
   */
  addProduct(productData) {
    const newProduct = {
      ...productData,
      id: this.generateId()
    };
    
    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  /**
   * Actualizar producto existente
   */
  updateProduct(id, productData) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...productData, id };
      this.saveProducts();
      return this.products[index];
    }
    return null;
  }

  /**
   * Eliminar producto
   */
  deleteProduct(id) {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    
    if (this.products.length < initialLength) {
      this.saveProducts();
      return true;
    }
    return false;
  }

  // ==================== FILTROS Y BÚSQUEDA ====================

  /**
   * Filtrar productos por término de búsqueda y categoría
   */
  filterProducts(searchTerm = '', categoryFilter = '') {
    return this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  /**
   * Obtener todas las categorías únicas
   */
  getCategories() {
    return [...new Set(this.products.map(p => p.category))];
  }

  // ==================== UTILIDADES ====================

  /**
   * Formatear moneda en pesos colombianos
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    const totalInventoryValue = this.products.reduce((sum, p) => sum + p.cost * 1, 0);
    const averageMargin = totalProducts > 0
      ? this.products.reduce((sum, p) => sum + parseFloat(this.calculateMargin(p.cost, p.price)), 0) / totalProducts
      : 0;
    const uniqueCategories = this.getCategories().length;

    return {
      totalProducts,
      totalInventoryValue,
      averageMargin: averageMargin.toFixed(1),
      uniqueCategories
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
      errors
    };
  }

  // ==================== DATOS DE EJEMPLO ====================

  /**
   * Inicializar con datos de ejemplo si no hay productos
   */
  initializeSampleData() {
    if (this.products.length === 0) {
      const sampleProducts = [
        {
          id: "sample1",
          name: "Tomate Cherry",
          category: "Verduras",
          cost: 2500,
          price: 4000,
          description: "Tomates cherry frescos, ideales para ensaladas",
        },
        {
          id: "sample2",
          name: "Aguacate Hass",
          category: "Frutas",
          cost: 1800,
          price: 3000,
          description: "Aguacates maduros de excelente calidad",
        },
        {
          id: "sample3",
          name: "Queso Campesino",
          category: "Lácteos",
          cost: 8000,
          price: 12000,
          description: "Queso fresco artesanal de la región",
        },
      ];

      this.products = sampleProducts;
      this.saveProducts();
    }
  }

  // ==================== GESTIÓN DE EDICIÓN ====================

  /**
   * Establecer producto en modo edición
   */
  setEditingProduct(id) {
    this.editingId = id;
    return this.getProductById(id);
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