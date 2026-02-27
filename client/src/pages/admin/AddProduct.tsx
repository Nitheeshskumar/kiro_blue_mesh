import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  Link,
  Image as ImageIcon,
  Ruler,
  DollarSign,
} from "lucide-react";
import { api } from "../../lib/api";
import {
  SupabaseUploadWidget,
  type SupabaseUploadResult,
} from "../../components/SupabaseUploadWidget";
import {
  STORAGE_BUCKETS,
  validateProductImage,
} from "../../lib/supabaseStorage";
import { SizingChart } from "../../components/SizingChart";
import { PRICING } from "../../constants/pricing";

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  productCount: number;
}

const SIZES = [
  // Baby sizes
  "0-3 months",
  "3-6 months",
  "6-9 months",
  "9-12 months",
  "12-18 months",
  "18-24 months",
  // Kids sizes
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "10",
  "12",
  "14",
  "16",
  // Adult sizes
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
];

const PRESET_COLORS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
  "#A52A2A",
  "#808080",
  "#000080",
  "#008000",
];

interface ProductImage {
  id: string;
  url: string;
  type: "upload" | "url";
  file?: File;
  uploading?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

export const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showSizingChart, setShowSizingChart] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    categories: [] as string[],
    basePrice: "",
    images: [] as ProductImage[],
    sizes: ["M"],
    colors: ["#000000"],
    colorType: "customizable" as "customizable" | "fixed",
    hasFixedColors: false,
    sizePricing: {} as Record<string, number>,
    colorPricing: {} as Record<string, number>,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/products/categories/all");
      const fetchedCategories = response.data;
      setCategories(fetchedCategories);

      // Set default category to first one if available
      if (fetchedCategories.length > 0 && !formData.category) {
        setFormData((prev) => ({
          ...prev,
          category: fetchedCategories[0].id,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addImageUrl = () => {
    const newImage: ProductImage = {
      id: `url-${Date.now()}`,
      url: "",
      type: "url",
    };
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImage],
    }));
  };

  const removeImage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  const updateImageUrl = (id: string, url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) => (img.id === id ? { ...img, url } : img)),
    }));

    // Clear image validation errors when valid images are added
    const validImages = formData.images.filter((img) => img.url.trim() !== "");
    if (validImages.length > 0 && hasFieldError("images")) {
      setValidationErrors((prev) =>
        prev.filter((err) => err.field !== "images")
      );
    }
  };

  const handleImageUpload = (results: SupabaseUploadResult[]) => {
    const newImages: ProductImage[] = results.map((result) => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      url: result.publicUrl,
      type: "upload",
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));

    // Clear image validation errors when images are added
    if (hasFieldError("images")) {
      setValidationErrors((prev) =>
        prev.filter((err) => err.field !== "images")
      );
    }
  };

  const handleUploadError = (error: string) => {
    console.error("Image upload error:", error);
    alert(`Image upload failed: ${error}`);
  };

  const validateForm = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Basic Information Validation
    if (!formData.name.trim()) {
      errors.push({ field: "name", message: "Product name is required" });
    } else if (formData.name.trim().length < 3) {
      errors.push({
        field: "name",
        message: "Product name must be at least 3 characters long",
      });
    } else if (formData.name.trim().length > 100) {
      errors.push({
        field: "name",
        message: "Product name must be less than 100 characters",
      });
    }

    if (!formData.description.trim()) {
      errors.push({
        field: "description",
        message: "Product description is required",
      });
    } else if (formData.description.trim().length < 10) {
      errors.push({
        field: "description",
        message: "Description must be at least 10 characters long",
      });
    } else if (formData.description.trim().length > 1000) {
      errors.push({
        field: "description",
        message: "Description must be less than 1000 characters",
      });
    }

    if (!formData.category) {
      errors.push({
        field: "category",
        message: "Primary category is required",
      });
    }

    // Price Validation
    if (!formData.basePrice) {
      errors.push({ field: "basePrice", message: "Base price is required" });
    } else {
      const price = parseFloat(formData.basePrice);
      if (isNaN(price)) {
        errors.push({
          field: "basePrice",
          message: "Base price must be a valid number",
        });
      } else if (price <= 0) {
        errors.push({
          field: "basePrice",
          message: "Base price must be greater than 0",
        });
      } else if (price > 100000) {
        errors.push({
          field: "basePrice",
          message: "Base price must be less than ₹1,00,000",
        });
      } else if (price < 100) {
        errors.push({
          field: "basePrice",
          message: "Base price should be at least ₹100",
        });
      }
    }

    // Images Validation
    const validImages = formData.images.filter((img) => img.url.trim() !== "");
    if (validImages.length === 0) {
      errors.push({
        field: "images",
        message: "At least one product image is required",
      });
    } else if (validImages.length > 10) {
      errors.push({
        field: "images",
        message: "Maximum 10 images allowed per product",
      });
    }

    // Validate image URLs
    validImages.forEach((img, index) => {
      if (img.type === "url" && img.url) {
        try {
          new URL(img.url);
        } catch {
          errors.push({
            field: "images",
            message: `Image ${index + 1} has an invalid URL format`,
          });
        }
      }
    });

    // Sizes Validation
    if (formData.sizes.length === 0) {
      errors.push({
        field: "sizes",
        message: "At least one size option is required",
      });
    } else if (formData.sizes.length > 10) {
      errors.push({
        field: "sizes",
        message: "Maximum 10 size options allowed",
      });
    }

    // Colors Validation
    if (formData.colors.length === 0) {
      errors.push({
        field: "colors",
        message: "At least one color option is required",
      });
    } else if (
      formData.colorType === "customizable" &&
      formData.colors.length > 15
    ) {
      errors.push({
        field: "colors",
        message: "Maximum 15 color options allowed",
      });
    }

    // Fixed Colors Specific Validation
    if (formData.colorType === "fixed") {
      if (!formData.colors[0] || !formData.colors[0].trim()) {
        errors.push({
          field: "colors",
          message: "Color description is required for fixed color products",
        });
      } else if (formData.colors[0].trim().length < 3) {
        errors.push({
          field: "colors",
          message: "Color description must be at least 3 characters long",
        });
      }
    }

    // Customizable Colors Validation
    if (formData.colorType === "customizable") {
      const invalidColors = formData.colors.filter((color) => {
        return !/^#[0-9A-F]{6}$/i.test(color);
      });
      if (invalidColors.length > 0) {
        errors.push({
          field: "colors",
          message: "All colors must be valid hex color codes (e.g., #FF0000)",
        });
      }
    }

    return errors;
  };

  const getFieldError = (fieldName: string): string | undefined => {
    const error = validationErrors.find((err) => err.field === fieldName);
    return error?.message;
  };

  const hasFieldError = (fieldName: string): boolean => {
    return validationErrors.some((err) => err.field === fieldName);
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addColor = (color: string) => {
    if (!formData.colors.includes(color)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, color],
      }));
    }
  };

  const removeColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== color),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors([]);

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to first error
      const firstErrorField = document.querySelector(
        `[data-field="${errors[0].field}"]`
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);

    try {
      const validImages = formData.images.filter(
        (img) => img.url.trim() !== ""
      );
      const productData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        basePrice: parseFloat(formData.basePrice),
        images: validImages.map((img) => img.url),
        hasFixedColors: formData.colorType === "fixed",
        colorType: formData.colorType,
        colors:
          formData.colorType === "fixed"
            ? [formData.colors[0].trim()]
            : formData.colors,
        sizePricing: formData.sizePricing,
        colorPricing: formData.colorType === 'customizable' ? formData.colorPricing : {},
      };

      await api.post("/products", productData);

      // Show success message
      alert("Product created successfully!");
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Failed to create product:", error);

      // Handle specific API errors
      if (error.response?.status === 400) {
        const apiError = error.response.data?.error || "Invalid product data";
        alert(`Validation Error: ${apiError}`);
      } else if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
      } else {
        alert(
          "Failed to create product. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/products")}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
      </div>

      {/* Validation Errors Summary */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following errors:
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div data-field="name">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  handleInputChange("name", e.target.value);
                  // Clear validation error when user starts typing
                  if (hasFieldError("name")) {
                    setValidationErrors((prev) =>
                      prev.filter((err) => err.field !== "name")
                    );
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  hasFieldError("name")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="e.g., Classic Cotton T-Shirt"
              />
              {getFieldError("name") && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError("name")}
                </p>
              )}
            </div>

            <div data-field="category">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => {
                  handleInputChange("category", e.target.value);
                  if (hasFieldError("category")) {
                    setValidationErrors((prev) =>
                      prev.filter((err) => err.field !== "category")
                    );
                  }
                }}
                disabled={loadingCategories}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                  hasFieldError("category")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                {loadingCategories ? (
                  <option>Loading categories...</option>
                ) : categories.length === 0 ? (
                  <option>No categories available</option>
                ) : (
                  <>
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {getFieldError("category") && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError("category")}
                </p>
              )}
            </div>

            <div data-field="basePrice">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (₹) *
              </label>
              <input
                type="number"
                required
                min="100"
                max="100000"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => {
                  handleInputChange("basePrice", e.target.value);
                  if (hasFieldError("basePrice")) {
                    setValidationErrors((prev) =>
                      prev.filter((err) => err.field !== "basePrice")
                    );
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  hasFieldError("basePrice")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="2500.00"
              />
              {getFieldError("basePrice") && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError("basePrice")}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum: ₹100, Maximum: ₹1,00,000
              </p>
            </div>
          </div>

          <div className="mt-6" data-field="description">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => {
                handleInputChange("description", e.target.value);
                if (hasFieldError("description")) {
                  setValidationErrors((prev) =>
                    prev.filter((err) => err.field !== "description")
                  );
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                hasFieldError("description")
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Describe your product in detail..."
              maxLength={1000}
            />
            {getFieldError("description") && (
              <p className="mt-1 text-sm text-red-600">
                {getFieldError("description")}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/1000 characters (minimum 10
              required)
            </p>
          </div>

          {/* Additional Categories */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Categories (Optional)
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Select additional categories this product belongs to
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.categories.includes(category.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.id)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...formData.categories, category.id]
                        : formData.categories.filter((c) => c !== category.id);
                      handleInputChange("categories", newCategories);
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">
                    {category.icon} {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Images */}
        <div
          className="bg-white p-6 rounded-lg shadow-md border"
          data-field="images"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Product Images *
            {getFieldError("images") && (
              <span className="text-sm font-normal text-red-600 ml-2">
                - {getFieldError("images")}
              </span>
            )}
          </h2>

          {/* Upload Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Upload Images
            </h3>
            <SupabaseUploadWidget
              onUpload={handleImageUpload}
              onError={handleUploadError}
              bucket={STORAGE_BUCKETS.PRODUCT_IMAGES}
              path="products"
              maxFiles={10}
              maxSizeMB={7}
              validateFile={validateProductImage}
              disabled={loading || uploadingImages}
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP up to 7MB each
                </p>
              </div>
            </SupabaseUploadWidget>
          </div>

          {/* Current Images */}
          {formData.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Current Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {image.url ? (
                        <img
                          src={image.url}
                          alt="Product"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEyVjdBMiAyIDAgMCAwIDE5IDVINUEyIDIgMCAwIDAgMyA3VjE3QTIgMiAwIDAgMCA1IDE5SDE5QTIgMiAwIDAgMCAyMSAxN1YxMloiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTMgMTNMMTAgNkwxNiAxMkwyMSA3IiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Image type indicator */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          image.type === "upload"
                            ? "bg-secondary-100 text-secondary-800"
                            : "bg-primary-100 text-primary-800"
                        }`}
                      >
                        {image.type === "upload" ? "Uploaded" : "URL"}
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* URL input for URL type images */}
                    {image.type === "url" && (
                      <div className="mt-2">
                        <input
                          type="url"
                          value={image.url}
                          onChange={(e) =>
                            updateImageUrl(image.id, e.target.value)
                          }
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Image URL"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add URL Option */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={addImageUrl}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Link className="w-4 h-4" />
              Add Image URL
            </button>
          </div>
        </div>

        {/* Sizes */}
        <div
          className="bg-white p-6 rounded-lg shadow-md border"
          data-field="sizes"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Available Sizes *
              {getFieldError("sizes") && (
                <span className="text-sm font-normal text-red-600 ml-2">
                  - {getFieldError("sizes")}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={() => setShowSizingChart(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Ruler className="w-4 h-4" />
              <span>Size Chart</span>
            </button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  toggleSize(size);
                  if (hasFieldError("sizes")) {
                    setValidationErrors((prev) =>
                      prev.filter((err) => err.field !== "sizes")
                    );
                  }
                }}
                className={`py-2 px-2 border rounded-lg font-medium transition-colors text-xs ${
                  formData.sizes.includes(size)
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : hasFieldError("sizes")
                    ? "border-red-300 hover:border-red-400"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Select at least one size. Selected: {formData.sizes.length}
          </p>
        </div>

        {/* Colors */}
        <div
          className="bg-white p-6 rounded-lg shadow-md border"
          data-field="colors"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Color Options *
            {getFieldError("colors") && (
              <span className="text-sm font-normal text-red-600 ml-2">
                - {getFieldError("colors")}
              </span>
            )}
          </h2>

          {/* Color Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.colorType === "customizable"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="colorType"
                  value="customizable"
                  checked={formData.colorType === "customizable"}
                  onChange={(e) => {
                    handleInputChange("colorType", e.target.value);
                    handleInputChange("hasFixedColors", false);
                    if (formData.colors.length === 0) {
                      handleInputChange("colors", ["#000000"]);
                    }
                    if (hasFieldError("colors")) {
                      setValidationErrors((prev) =>
                        prev.filter((err) => err.field !== "colors")
                      );
                    }
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    Customizable Colors
                  </div>
                  <div className="text-sm text-gray-600">
                    Customers can choose from available color options
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.colorType === "fixed"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="colorType"
                  value="fixed"
                  checked={formData.colorType === "fixed"}
                  onChange={(e) => {
                    handleInputChange("colorType", e.target.value);
                    handleInputChange("hasFixedColors", true);
                    handleInputChange("colors", ["As Shown in Image"]);
                    if (hasFieldError("colors")) {
                      setValidationErrors((prev) =>
                        prev.filter((err) => err.field !== "colors")
                      );
                    }
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Fixed Colors</div>
                  <div className="text-sm text-gray-600">
                    Colors are part of the design/image (e.g., prints, patterns)
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Color Options based on type */}
          {formData.colorType === "customizable" ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">Selected Colors:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color) => (
                    <div key={color} className="relative">
                      <div
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">Add Colors:</p>
                <div className="grid grid-cols-8 md:grid-cols-15 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => addColor(color)}
                      className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Description
                </label>
                <input
                  type="text"
                  value={formData.colors[0] || ""}
                  onChange={(e) => {
                    handleInputChange("colors", [e.target.value]);
                    if (hasFieldError("colors")) {
                      setValidationErrors((prev) =>
                        prev.filter((err) => err.field !== "colors")
                      );
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    hasFieldError("colors")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="e.g., As Shown in Image, Floral Pattern, Original Design"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe the fixed color/pattern that customers will see in
                  the product images
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      Fixed Color Product
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This product will show the colors/patterns as they appear
                      in the uploaded images. Customers won't be able to change
                      colors during customization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Size Pricing */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Size Pricing Modifiers</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Set additional charges for different sizes. Leave at 0 for no extra cost.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.sizes.map((size) => (
              <div key={size} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {size}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.sizePricing[size] || 0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      handleInputChange('sizePricing', {
                        ...formData.sizePricing,
                        [size]: value
                      })
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Default: ₹{PRICING.DEFAULT_SIZE_PRICING[size] || 0}
                </p>
              </div>
            ))}
          </div>
          
          {formData.sizes.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Select sizes above to configure pricing modifiers
            </p>
          )}
        </div>

        {/* Color Pricing */}
        {formData.colorType === 'customizable' && (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Color Pricing Modifiers</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Set additional charges for different colors. Leave at 0 for no extra cost.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.colors.map((color) => (
                <div key={color} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    {color}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.colorPricing[color] || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        handleInputChange('colorPricing', {
                          ...formData.colorPricing,
                          [color]: value
                        })
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Default: ₹{PRICING.DEFAULT_COLOR_PRICING[color] || 0}
                  </p>
                </div>
              ))}
            </div>
            
            {formData.colors.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Select colors above to configure pricing modifiers
              </p>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || validationErrors.length > 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>

          {validationErrors.length > 0 && (
            <p className="text-sm text-red-600">
              Please fix {validationErrors.length} error
              {validationErrors.length > 1 ? "s" : ""} above
            </p>
          )}
        </div>
      </form>

      {/* Sizing Chart Modal */}
      <SizingChart
        isOpen={showSizingChart}
        onClose={() => setShowSizingChart(false)}
        availableSizes={formData.sizes}
        selectedSizes={[]} // No specific selection in admin, just showing available sizes
      />
    </div>
  );
};
