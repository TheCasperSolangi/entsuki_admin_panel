'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  SortAsc, 
  Package, 
  Star, 
  Eye, 
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Heart,
  MessageSquare,
  Activity,
  Calendar,
  Award,
  Target,
  Clock,
  X
} from 'lucide-react';
import Cookies from 'js-cookie';
import JsBarcode from 'jsbarcode';

const EMPTY_PRODUCT = {
  product_sku: '',
  product_code: '',
  product_name: '',
  category_code: '',
  price: '',
  stock: '',
  is_featured: false,
  short_description: '',
  long_description: '',
  features: [],
};

const ProductAnalyticsDialog = ({ isOpen, onOpenChange, analytics, loading, error }) => {
  if (!analytics && !loading && !error) return null;

  const formatCurrency = (amount) => `$${amount?.toFixed(2) || '0.00'}`;
  const formatNumber = (num) => num?.toLocaleString() || '0';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white border border-gray-200 text-black">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Analytics Dashboard</DialogTitle>
                <DialogDescription className="text-gray-500 text-sm">
                  Performance insights and metrics
                </DialogDescription>
              </div>
            </div>
          
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
              <span className="ml-3 text-gray-600">Loading analytics...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Product Header - Compact */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{analytics.product_name}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <span><strong>Code:</strong> {analytics.product_code}</span>
                      <span><strong>Category:</strong> {analytics.category_code}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analytics.isFeatured && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">⭐ Featured</span>}
                    {analytics.isNewArrival && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">🆕 New</span>}
                    {analytics.isBestSeller && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">🏆 Best Seller</span>}
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid - Responsive */}
              <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-3 gap-3">
                <MetricCard
                  icon={DollarSign}
                  title="Revenue"
                  value={formatCurrency(analytics.totalRevenue)}
                  subtitle={`${formatNumber(analytics.totalOrders)} orders`}
                  color="green"
                />
                <MetricCard
                  icon={ShoppingCart}
                  title="Orders"
                  value={formatNumber(analytics.totalOrders)}
                  subtitle={`${formatNumber(analytics.totalQuantity)} units`}
                  color="blue"
                />
                <MetricCard
                  icon={Package}
                  title="Stock"
                  value={formatNumber(analytics.stock)}
                  subtitle={analytics.trackInventory ? 'Tracked' : 'Not tracked'}
                  color="purple"
                />
                <MetricCard
                  icon={Star}
                  title="Rating"
                  value={analytics.averageRating > 0 ? `${analytics.averageRating.toFixed(1)}⭐` : 'N/A'}
                  subtitle={`${formatNumber(analytics.totalReviews)} reviews`}
                  color="yellow"
                />
                <MetricCard
                  icon={Eye}
                  title="Views"
                  value={formatNumber(analytics.views)}
                  subtitle={`${formatNumber(analytics.clicks)} clicks`}
                  color="indigo"
                />
                <MetricCard
                  icon={Heart}
                  title="Favorites"
                  value={formatNumber(analytics.favoritesCount)}
                  subtitle={analytics.views > 0 ? `${((analytics.clicks / analytics.views) * 100).toFixed(1)}% CTR` : '0% CTR'}
                  color="pink"
                />
              </div>

              {/* Performance Dashboard - Two Row Layout */}
              <div className="space-y-">
                {/* First Row - Performance & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Performance Insights */}
                  <Card className="bg-white border border-gray-100 shadow-sm">
                    <CardHeader className="pb-3 pt-0 bg-gradient-to-r from-green-50 to-blue-50">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Performance Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Avg Order Value</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(analytics.totalOrders > 0 ? analytics.totalRevenue / analytics.totalOrders : 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Units per Order</span>
                        <span className="font-semibold text-blue-600">
                          {analytics.totalOrders > 0 ? (analytics.totalQuantity / analytics.totalOrders).toFixed(1) : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Conversion Rate</span>
                        <span className="font-semibold text-purple-600">
                          {analytics.clicks > 0 ? `${((analytics.totalOrders / analytics.clicks) * 100).toFixed(2)}%` : '0%'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Status */}
                  <Card className="bg-white border border-gray-100 shadow-sm">
                    <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-yellow-50">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-600" />
                        Product Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Stock Status</span>
                        <span className={`font-semibold text-sm ${
                          analytics.stock > 10 ? 'text-green-600' : 
                          analytics.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {analytics.stock > 10 ? '✅ In Stock' : 
                           analytics.stock > 0 ? '⚠️ Low Stock' : '❌ Out of Stock'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Inventory Tracking</span>
                        <span className={`font-semibold text-sm ${analytics.trackInventory ? 'text-green-600' : 'text-gray-500'}`}>
                          {analytics.trackInventory ? '🟢 On' : '🔴 Off'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Launch Date</span>
                        <span className="font-semibold text-indigo-600 text-sm">
                          {analytics.launchDate ? 
                            new Date(analytics.launchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Not set'
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Second Row - Availability Timeline */}
                <div className="grid grid-cols-1">
                  <Card className="bg-white border border-gray-100 shadow-sm">
                    <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-indigo-50">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        Availability Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700 text-sm font-medium">Available From</span>
                          </div>
                          <span className="font-semibold text-green-700 text-sm">
                            {analytics.availableFrom ? 
                              new Date(analytics.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'Not set'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-600" />
                            <span className="text-gray-700 text-sm font-medium">Available Until</span>
                          </div>
                          <span className="font-semibold text-red-700 text-sm">
                            {analytics.availableUntil ? 
                              new Date(analytics.availableUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'Not set'
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Reusable Metric Card Component
const MetricCard = ({ icon: Icon, title, value, subtitle, color }) => {
  const colorClasses = {
    green: 'from-green-50 to-green-100 border-green-200 text-green-700',
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700',
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700',
    pink: 'from-pink-50 to-pink-100 border-pink-200 text-pink-700',
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wide opacity-80">{title}</span>
        </div>
        <div>
          <p className="text-lg font-bold mb-1">{value}</p>
          <p className="text-xs opacity-75">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Demo component with sample data
const DemoAnalyticsDialog = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  
  const sampleAnalytics = {
    product_name: "Premium Wireless Headphones",
    product_code: "PWH-001",
    category_code: "AUDIO",
    totalRevenue: 45250.75,
    totalOrders: 156,
    totalQuantity: 203,
    stock: 45,
    trackInventory: true,
    averageRating: 4.7,
    totalReviews: 89,
    views: 3240,
    clicks: 567,
    favoritesCount: 234,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    launchDate: "2024-03-15",
    availableFrom: "2024-03-15",
    availableUntil: "2024-12-31"
  };

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)} className="mb-4">
        Open Analytics Dashboard
      </Button>
      <ProductAnalyticsDialog 
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        analytics={sampleAnalytics}
        loading={false}
        error={null}
      />
    </div>
  );
};
// ProductDialog component moved outside the main component
const ProductDialog = ({ 
  isOpen, 
  onOpenChange, 
  isEdit = false, 
  newProduct, 
  setNewProduct, 
  categories, 
  categoriesLoading, 
  categoriesError, 
  selectedFiles, 
  setSelectedFiles, 
  uploading, 
  handleInputChange, 
  updateFeature, 
  removeFeature, 
  addFeature, 
  handleFileChange, 
  handleUpdateProduct, 
  handleAddProduct, 
  editingProduct,
  resetForm
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => {
    onOpenChange(open);
    if (!open) resetForm();
  }}>
    <DialogContent 
      className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white border border-gray-200 text-black"
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
    >
      <DialogHeader className="border-b border-gray-200 pb-4">
        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
          {isEdit ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          {isEdit ? 'Update product details below.' : 'Fill in the details below to create a new product.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={(e) => {
        e.preventDefault();
        isEdit ? handleUpdateProduct() : handleAddProduct();
      }}>
        <div className="grid gap-6 py-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_sku" className="text-black">Product SKU *</Label>
                <Input
                  id="product_sku"
                  name="product_sku"
                  value={newProduct.product_sku}
                  onChange={handleInputChange}
                  placeholder="e.g. SKU123"
                  disabled={uploading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="product_code" className="text-black">Product Code *</Label>
                <Input
                  id="product_code"
                  name="product_code"
                  value={newProduct.product_code}
                  onChange={handleInputChange}
                  placeholder="e.g. PCODE123"
                  disabled={uploading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="product_name" className="text-black">Product Name *</Label>
                <Input
                  id="product_name"
                  name="product_name"
                  value={newProduct.product_name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                  disabled={uploading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="category_code" className="text-black">Category *</Label>
                {categoriesLoading ? (
                  <p className="text-gray-500">Loading categories...</p>
                ) : categoriesError ? (
                  <p className="text-red-500">{categoriesError}</p>
                ) : (
                  <select
                    id="category_code"
                    name="category_code"
                    value={newProduct.category_code}
                    onChange={handleInputChange}
                    disabled={uploading}
                    className="w-full rounded border bg-white border-gray-300 text-black px-3 py-2 focus:border-black"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.category_code}>
                        {cat.category_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-black">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  disabled={uploading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                />
              </div>
              <div>
                <Label htmlFor="stock" className="text-black">Stock *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  disabled={uploading}
                  className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                name="is_featured"
                checked={newProduct.is_featured}
                onCheckedChange={(checked) =>
                  setNewProduct((prev) => ({ ...prev, is_featured: checked }))
                }
                disabled={uploading}
                className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:text-white"
              />
              <Label htmlFor="is_featured" className="text-black flex items-center gap-2">
                <Star className="w-4 h-4" />
                Featured Product
              </Label>
            </div>
          </div>

          {/* Product Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Product Features</h3>
            {newProduct.features.length === 0 && (
              <p className="text-gray-500">No features added yet.</p>
            )}
            <div className="space-y-3">
              {newProduct.features.map((feature, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    type="text"
                    placeholder="Feature Name"
                    value={feature.feature_name}
                    onChange={(e) => updateFeature(idx, 'feature_name', e.target.value)}
                    disabled={uploading}
                    className="flex-1 bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                  />
                  <Input
                    type="text"
                    placeholder="Feature Value"
                    value={feature.feature_value}
                    onChange={(e) => updateFeature(idx, 'feature_value', e.target.value)}
                    disabled={uploading}
                    className="flex-1 bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature(idx)}
                    disabled={uploading}
                    className="border-gray-300 text-black hover:bg-red-100 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addFeature}
              disabled={uploading}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Descriptions</h3>
            <div>
              <Label htmlFor="short_description" className="text-black">Short Description</Label>
              <Input
                id="short_description"
                name="short_description"
                value={newProduct.short_description}
                onChange={handleInputChange}
                placeholder="Brief product description"
                disabled={uploading}
                className="bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
              />
            </div>
            <div>
              <Label htmlFor="long_description" className="text-black">Long Description</Label>
              <textarea
                id="long_description"
                name="long_description"
                value={newProduct.long_description}
                onChange={handleInputChange}
                placeholder="Detailed product description"
                disabled={uploading}
                rows={4}
                className="w-full rounded border bg-white border-gray-300 text-black placeholder-gray-400 px-3 py-2 resize-y focus:border-black"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Product Images</h3>
            <div>
              <input
                type="file"
                id="product_images"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="mt-1 block w-full rounded border-2 border-dashed border-gray-300 bg-white p-6 cursor-pointer text-center text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
              )}
              {isEdit && editingProduct?.productImages?.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Current: {editingProduct.productImages.length} image{editingProduct.productImages.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-gray-200 pt-4 space-x-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={uploading}
            className="border-gray-300 text-black hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={uploading}
            className="bg-black text-white hover:bg-gray-800"
          >
            {uploading ? 'Processing...' : (isEdit ? 'Update Product' : 'Create Product')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [barcodeData, setBarcodeData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productAnalytics, setProductAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [sortOption, setSortOption] = useState('date_new');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [newProduct, setNewProduct] = useState({ ...EMPTY_PRODUCT });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);
  const alertTimeoutRef = useRef(null);
  const [generatingBarcode, setGeneratingBarcode] = useState(false);
  const [generatingBulkBarcode, setGeneratingBulkBarcode] = useState(false);
  const token = Cookies.get('token');
  const AUTH_TOKEN = token ? `Bearer ${token}` : null;
  
  const showAlert = (type, message) => {
    setAlert({ type, message });
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => setAlert(null), 4000);
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.data || []);
      setCategoriesError('');
    } catch (err) {
      setCategoriesError(err.message || 'Something went wrong');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductAnalytics = async (productCode) => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    setProductAnalytics(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/analytics/${productCode}`, {method: "PATCH"});
      if (!res.ok) throw new Error('Failed to fetch product analytics');
      const data = await res.json();
      setProductAnalytics(data.data);
    } catch (err) {
      setAnalyticsError(err.message || 'Something went wrong while fetching analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleViewAnalytics = (product) => {
    setIsAnalyticsOpen(true);
    fetchProductAnalytics(product.product_code);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Feature management functions
  const addFeature = () => {
    setNewProduct((prev) => ({
      ...prev,
      features: [...prev.features, { feature_name: '', feature_value: '' }],
    }));
  };

  const removeFeature = (index) => {
    setNewProduct((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index, field, value) => {
    setNewProduct((prev) => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[index] = {
        ...updatedFeatures[index],
        [field]: value,
      };
      return {
        ...prev,
        features: updatedFeatures,
      };
    });
  };

const generateBarcode = (text) => { 
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');

    JsBarcode(canvas, text, {
      format: 'CODE128',
      width: 2,       // moderate width to avoid distortion
      height: 120,    // taller height for HD
      displayValue: false,
      margin: 10,     // keep some breathing space
    });

    resolve(canvas.toDataURL());
  });
};

const generatePDF = async (barcodeData) => {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const rows = 2;
  const cols = 2;
  const gap = 15; // gap between barcodes

  // Keep each barcode proportional (width < height)
  const barcodeWidth = (pageWidth - gap * (cols + 1)) / cols;
  const barcodeHeight = 40; // proportional to width

  for (let i = 0; i < barcodeData.length; i++) {
    const row = Math.floor((i % 4) / cols);
    const col = i % cols;
    const x = gap + col * (barcodeWidth + gap);
    const y = gap + row * (barcodeHeight + gap);

    pdf.addImage(barcodeData[i].barcode, 'PNG', x, y, barcodeWidth, barcodeHeight);

    if ((i + 1) % 4 === 0 && i + 1 < barcodeData.length) {
      pdf.addPage();
    }
  }

  pdf.save('barcodes_hd_fixed.pdf');
};

// 4. Add these functions inside your main component (before the return statement)
const handleGenerateIndividualBarcode = async (product) => {
  setGeneratingBarcode(true);
  try {
    const barcode = await generateBarcode(product._id);
    const barcodeData = {
      barcode,
      name: product.product_name,
      sku: product.product_sku,
      price: product.price.toFixed(2)
    };
    
    await generatePDF(barcodeData, false);
    showAlert('success', 'Barcode generated successfully!');
  } catch (error) {
    showAlert('error', 'Failed to generate barcode');
  } finally {
    setGeneratingBarcode(false);
  }
};

const handleGenerateBulkBarcodes = async () => {
  if (filteredProducts.length === 0) {
    showAlert('error', 'No products to generate barcodes for');
    return;
  }
  
  setGeneratingBulkBarcode(true);
  try {
    const barcodePromises = filteredProducts.map(async (product) => {
      const barcode = await generateBarcode(product._id);
      return {
        barcode,
        name: product.product_name,
        sku: product.product_sku,
        price: product.price.toFixed(2)
      };
    });
    
    const barcodeData = await Promise.all(barcodePromises);
    await generatePDF(barcodeData, true);
    showAlert('success', `Generated barcodes for ${filteredProducts.length} products!`);
  } catch (error) {
    showAlert('error', 'Failed to generate bulk barcodes');
  } finally {
    setGeneratingBulkBarcode(false);
  }
};

  // Edit product functions
  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      ...product,
      features: product.features || [],
    });
    setSelectedFiles([]);
    setIsEditOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (
      !newProduct.product_sku ||
      !newProduct.product_code ||
      !newProduct.product_name ||
      !newProduct.category_code ||
      !newProduct.price ||
      !newProduct.stock
    ) {
      showAlert('error', 'Please fill all required fields');
      return;
    }

    setUploading(true);
    try {
      let uploadedUrls = [];
      for (const file of selectedFiles) {
        const url = await uploadSingleFile(file);
        uploadedUrls.push(url);
      }

      const productPayload = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        productImages: uploadedUrls.length > 0 ? uploadedUrls : editingProduct.productImages,
        features: newProduct.features.filter(
          (f) => f.feature_name.trim() !== '' || f.feature_value.trim() !== ''
        ),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `${AUTH_TOKEN}`
        },
        body: JSON.stringify(productPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update product');

      showAlert('success', 'Product updated successfully');
      setIsEditOpen(false);
      setEditingProduct(null);
      setNewProduct({ ...EMPTY_PRODUCT });
      setSelectedFiles([]);
      fetchProducts();
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  // Filtering and sorting
  const filteredProducts = products
    .filter((p) => (filterCategory ? p.category_code === filterCategory : true))
    .filter((p) =>
      filterFeatured === 'all'
        ? true
        : filterFeatured === 'yes'
        ? p.is_featured === true
        : p.is_featured === false
    )
    .filter((p) =>
      searchTerm ? 
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.product_code.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'date_old':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'date_new':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeleteLoadingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', "Authorization": `${AUTH_TOKEN}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete product');
      }
      showAlert('success', 'Product deleted successfully');
      fetchProducts();
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const uploadSingleFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_STORAGE_URL}/api/uploads`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to upload image');
    }
    const data = await res.json();
    return data.url || data.data?.url || data.fileUrl || data.file_url || data.file;
  };

  const handleAddProduct = async () => {
    if (
      !newProduct.product_sku ||
      !newProduct.product_code ||
      !newProduct.product_name ||
      !newProduct.category_code ||
      !newProduct.price ||
      !newProduct.stock
    ) {
      showAlert('error', 'Please fill all required fields');
      return;
    }

    setUploading(true);
    try {
      let uploadedUrls = [];
      for (const file of selectedFiles) {
        const url = await uploadSingleFile(file);
        uploadedUrls.push(url);
      }

      const productPayload = {
        ...newProduct,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        productImages: uploadedUrls,
        features: newProduct.features.filter(
          (f) => f.feature_name.trim() !== '' || f.feature_value.trim() !== ''
        ),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `${AUTH_TOKEN}`
        },
        body: JSON.stringify(productPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add product');

      showAlert('success', 'Product added successfully');
      setIsAddOpen(false);
      setNewProduct({ ...EMPTY_PRODUCT });
      setSelectedFiles([]);
      fetchProducts();
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    const { name, value, type, checked } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setNewProduct({ ...EMPTY_PRODUCT });
    setSelectedFiles([]);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-4xl font-bold flex items-center gap-3">
        <Package className="w-10 h-10" />
        Product Management
      </h1>
      <p className="text-gray-600 mt-2">Manage your product inventory with style</p>
    </div>
    <div className="flex gap-3">
      <Button 
        onClick={handleGenerateBulkBarcodes}
        disabled={generatingBulkBarcode || filteredProducts.length === 0}
        className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-6 py-3"
      >
        {generatingBulkBarcode ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Generating...
          </>
        ) : (
          <>
            <BarChart3 className="w-5 h-5 mr-2" />
            Generate Bulk Barcode
          </>
        )}
      </Button>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-3">
            <Plus className="w-5 h-5 mr-2" />
            Add New Product
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  </div>
</div>

        {/* Alert */}
        {alert && (
          <Alert 
            variant={alert.type === 'error' ? 'destructive' : 'default'} 
            className={`mb-6 ${
              alert.type === 'error' 
                ? 'bg-red-100 border-red-300 text-red-700' 
                : 'bg-green-100 border-green-300 text-green-700'
            }`}
          >
            <AlertTitle className="font-semibold">
              {alert.type === 'error' ? 'Error' : 'Success'}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <Card className="bg-white border-gray-200 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label className="text-black mb-2 block">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search by name, SKU, or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-300 text-black placeholder-gray-400 focus:border-black"
                  />
                </div>
              </div>

              {/* Category filter */}
              <div>
                <Label className="text-black mb-2 block flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Category
                </Label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded border bg-white border-gray-300 text-black px-3 py-2 focus:border-black"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.category_code}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured filter */}
              <div>
                <Label className="text-black mb-2 block flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Featured
                </Label>
                <select
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value)}
                  className="w-full rounded border bg-white border-gray-300 text-black px-3 py-2 focus:border-black"
                >
                  <option value="all">All</option>
                  <option value="yes">Featured</option>
                  <option value="no">Not Featured</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <Label className="text-black mb-2 block flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
                  Sort By
                </Label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full rounded border bg-white border-gray-300 text-black px-3 py-2 focus:border-black"
                >
                  <option value="date_new">Date: New to Old</option>
                  <option value="date_old">Date: Old to New</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 hover:bg-gray-50">
                      <TableHead className="text-black font-semibold">SKU</TableHead>
                      <TableHead className="text-black font-semibold">Name</TableHead>
                      <TableHead className="text-black font-semibold">Category</TableHead>
                      <TableHead className="text-black font-semibold">Price</TableHead>
                      <TableHead className="text-black font-semibold">Stock</TableHead>
                      <TableHead className="text-black font-semibold">Featured</TableHead>
                      <TableHead className="text-black font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product._id} className="border-gray-200 hover:bg-gray-50">
                        <TableCell className="font-medium text-black">{product.product_sku}</TableCell>
                        <TableCell className="text-black">{product.product_name}</TableCell>
                        <TableCell className="text-gray-600">
                          {categories.find(c => c.category_code === product.category_code)?.category_name || product.category_code}
                        </TableCell>
                        <TableCell className="text-black">${product.price.toFixed(2)}</TableCell>
                        <TableCell className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                          {product.stock}
                        </TableCell>
                        <TableCell>
                          {product.is_featured ? (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                       <TableCell className="text-right space-x-2">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleViewAnalytics(product)}
    className="text-gray-600 hover:text-green-600 hover:bg-gray-100"
    title="View Analytics"
  >
    <TrendingUp className="w-4 h-4" />
  </Button>
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleGenerateIndividualBarcode(product)}
    disabled={generatingBarcode}
    className="text-gray-600 hover:text-blue-600 hover:bg-gray-100"
    title="Generate Barcode"
  >
    <BarChart3 className="w-4 h-4" />
  </Button>
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleEdit(product)}
    className="text-gray-600 hover:text-black hover:bg-gray-100"
  >
    <Edit3 className="w-4 h-4" />
  </Button>
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleDelete(product._id)}
    disabled={deleteLoadingId === product._id}
    className="text-gray-600 hover:text-red-600 hover:bg-gray-100"
  >
    {deleteLoadingId === product._id ? (
      <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-black rounded-full"></div>
    ) : (
      <Trash2 className="w-4 h-4" />
    )}
  </Button>
</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {!loading && !error && filteredProducts.length > 0 && (
            <CardFooter className="border-t border-gray-200 py-4 px-6">
              <p className="text-gray-500 text-sm">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Add Product Dialog */}
      <ProductDialog 
        isOpen={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        isEdit={false}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        uploading={uploading}
        handleInputChange={handleInputChange}
        updateFeature={updateFeature}
        removeFeature={removeFeature}
        addFeature={addFeature}
        handleFileChange={handleFileChange}
        handleUpdateProduct={handleUpdateProduct}
        handleAddProduct={handleAddProduct}
        editingProduct={editingProduct}
        resetForm={resetForm}
      />

      {/* Edit Product Dialog */}
      <ProductDialog 
        isOpen={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        isEdit={true}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        uploading={uploading}
        handleInputChange={handleInputChange}
        updateFeature={updateFeature}
        removeFeature={removeFeature}
        addFeature={addFeature}
        handleFileChange={handleFileChange}
        handleUpdateProduct={handleUpdateProduct}
        handleAddProduct={handleAddProduct}
        editingProduct={editingProduct}
        resetForm={resetForm}
      />

      {/* Product Analytics Dialog */}
      <ProductAnalyticsDialog 
        isOpen={isAnalyticsOpen}
        onOpenChange={setIsAnalyticsOpen}
        analytics={productAnalytics}
        loading={analyticsLoading}
        error={analyticsError}
      />
    </div>
  );
}