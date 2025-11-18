import React, { useState, useEffect } from "react";
import { Product, ProductCategory } from "../types";
import { CategoryFilter } from "./CategoryFilter";
import { ProductGrid } from "./ProductGrid";
import { useFilterStore } from "../stores/filterStore";
import { productApi } from "../lib/api";
import PremiumButton from "./ui/PremiumButton";
import PremiumInput from "./ui/PremiumInput";
import { Filter, X } from "lucide-react";

interface EnhancedProductCatalogProps {
  onProductSelect?: (product: Product) => void;
}

export const EnhancedProductCatalog: React.FC<EnhancedProductCatalogProps> = ({
  onProductSelect,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    selectedCategories,
    searchTerm,
    sortBy,
    setSearchTerm,
    setSortBy,
    hasActiveFilters,
    clearFilters,
  } = useFilterStore();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productApi.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const filters: any = {};

        if (selectedCategories.length > 0) {
          filters.categories = selectedCategories;
        }

        if (searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }

        const productsData = await productApi.getProducts(filters);

        // Apply client-side sorting
        let sortedProducts = [...productsData];
        switch (sortBy) {
          case "price-low":
            sortedProducts.sort((a, b) => a.basePrice - b.basePrice);
            break;
          case "price-high":
            sortedProducts.sort((a, b) => b.basePrice - a.basePrice);
            break;
          case "newest":
          default:
            // Already sorted by createdAt DESC from API
            break;
        }

        setProducts(sortedProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategories, searchTerm, sortBy]);

  const handleProductClick = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">
            Product Catalog
          </h1>
          <p className="text-gray-600 mt-1">
            Discover our premium collection of customizable clothing
          </p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
          <div className="flex-1 lg:w-64">
            <PremiumInput
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Filter Toggle and Active Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <PremiumButton
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters() && (
              <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                {selectedCategories.length}
              </span>
            )}
          </PremiumButton>

          {hasActiveFilters() && (
            <PremiumButton
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              Clear All
            </PremiumButton>
          )}
        </div>

        {!loading && (
          <div className="text-sm text-gray-600">
            {products.length} {products.length === 1 ? "product" : "products"}{" "}
            found
          </div>
        )}
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <CategoryFilter
            categories={categories}
            onCategoryChange={() => {}} // Handled by store
          />
        </div>
      )}

      {/* Product Grid */}
      <div>
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <PremiumButton
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </PremiumButton>
          </div>
        ) : (
          <ProductGrid
            products={products}
            loading={loading}
            onProductClick={handleProductClick}
            className="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          />
        )}
      </div>
    </div>
  );
};
