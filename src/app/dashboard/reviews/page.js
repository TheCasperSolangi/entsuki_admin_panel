"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Trash2, Search, Star, User, Package, Filter, Download, RefreshCw, Calendar } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    productsReviewed: 0,
    recentCount: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    rating: '',
    product: '',
    dateRange: '',
    hasAttachment: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  // Calculate statistics from reviews
  const calculateStats = (reviewsData) => {
    const total = reviewsData.length;
    const averageRating = total > 0 
      ? (reviewsData.reduce((sum, review) => sum + review.review, 0) / total).toFixed(1)
      : 0;
    
    const productsReviewed = new Set(reviewsData.map(review => review.product_code)).size;
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCount = reviewsData.filter(review => new Date(review.createdAt) >= sevenDaysAgo).length;
    
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      ratingDistribution[review.review] = (ratingDistribution[review.review] || 0) + 1;
    });

    return {
      total,
      averageRating: parseFloat(averageRating),
      productsReviewed,
      recentCount,
      ratingDistribution
    };
  };

  // Fetch reviews with filters
  const fetchReviews = async (appliedFilters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add search term
      if (searchTerm) params.append('search', searchTerm);
      
      // Add filters
      Object.entries({ ...filters, ...appliedFilters }).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });
      
      // Add pagination
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      
      const queryString = params.toString();
      const url = `${API_URL}/reviews${queryString ? `?${queryString}` : ''}`;
      
      const res = await axios.get(url);
      const reviewsData = res.data.data || [];
      setReviews(reviewsData);
      setFilteredReviews(reviewsData);
      setTotalItems(res.data.total || reviewsData.length);
      
      // Calculate and set stats
      setStats(calculateStats(reviewsData));
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to fetch reviews.'
      });
      setStats({
        total: 0,
        averageRating: 0,
        productsReviewed: 0,
        recentCount: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  // Handle search
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setCurrentPage(1);
      fetchReviews();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchReviews(filters);
    setFilterDialogOpen(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      rating: '',
      product: '',
      dateRange: '',
      hasAttachment: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
    fetchReviews({});
  };

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/reviews/${selectedReview._id}`);
      setAlert({ type: 'success', message: 'Review deleted successfully.' });
      setDeleteDialogOpen(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to delete review.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Export reviews
  const handleExport = async (format) => {
    try {
      const response = await axios.get(`${API_URL}/reviews/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reviews.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setAlert({ type: 'success', message: `Reviews exported as ${format.toUpperCase()}` });
    } catch (error) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to export reviews.'
      });
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clear alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Products Reviewed</p>
                <p className="text-2xl font-bold">{stats.productsReviewed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Recent (7 days)</p>
                <p className="text-2xl font-bold">{stats.recentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Reviews Table */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Reviews Management
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <button
                onClick={() => setFilterDialogOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Filters
                {Object.values(filters).some(v => v !== '') && (
                  <span className="ml-1 px-2 py-0.5 bg-gray-200 text-xs rounded-full">
                    {Object.values(filters).filter(v => v !== '').length}
                  </span>
                )}
              </button>
              <div className={`fixed inset-0 z-50 ${filterDialogOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-black/50" onClick={() => setFilterDialogOpen(false)}></div>
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-96">
                  <h2 className="text-lg font-semibold mb-4">Filter Reviews</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Rating</label>
                      <select 
                        value={filters.rating} 
                        onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Any rating</option>
                        <option value="5">5 stars</option>
                        <option value="4">4 stars</option>
                        <option value="3">3 stars</option>
                        <option value="2">2 stars</option>
                        <option value="1">1 star</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Product</label>
                      <Input
                        placeholder="Product code"
                        value={filters.product}
                        onChange={(e) => setFilters(prev => ({ ...prev, product: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Date Range</label>
                      <select 
                        value={filters.dateRange} 
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Any time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 days</option>
                        <option value="month">Last 30 days</option>
                        <option value="year">Last year</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Attachments</label>
                      <select 
                        value={filters.hasAttachment} 
                        onChange={(e) => setFilters(prev => ({ ...prev, hasAttachment: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Any</option>
                        <option value="true">With attachments</option>
                        <option value="false">Without attachments</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" onClick={clearFilters} className="flex-1">
                      Clear All
                    </Button>
                    <Button onClick={applyFilters} className="flex-1">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </Dialog>

            <Button onClick={() => fetchReviews()} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <select 
              onChange={(e) => handleExport(e.target.value)}
              className="w-32 p-2 border border-gray-300 rounded-md"
              defaultValue=""
            >
              <option value="" disabled>Export</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {alert && (
            <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alert.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <table className="w-full">
              <thead className="border-b">
                <tr className="border-b">
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Product Code</th>
                  <th className="text-left p-4">Rating</th>
                  <th className="text-left p-4">Review Text</th>
                  <th className="text-left p-4">Attachments</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Loading reviews...
                      </div>
                    </td>
                  </tr>
                ) : currentReviews.length > 0 ? (
                  currentReviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50 border-b">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {review.profile_picture ? (
                              <img
                                src={review.profile_picture}
                                alt={review.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <span className="font-medium">{review.full_name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <span className="font-mono text-sm">{review.product_code}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {renderStars(review.review)}
                          <span className="ml-1 text-sm text-gray-600">({review.review})</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="truncate" title={review.review_text}>
                          {review.review_text}
                        </p>
                      </td>
                      <td className="p-4">
                        {review.review_attachment && review.review_attachment.length > 0 ? (
                          <span className="text-sm text-blue-600">
                            {review.review_attachment.length} attachment(s)
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No attachments</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReview(review);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm ? `No reviews found matching "${searchTerm}"` : 'No reviews found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <div className={`fixed inset-0 z-50 ${deleteDialogOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteDialogOpen(false)}></div>
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-96">
          <h2 className="text-lg font-semibold mb-4">Delete Review</h2>
          <div className="space-y-4">
            <p>Are you sure you want to delete this review?</p>
            {selectedReview && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <strong>User:</strong> {selectedReview.full_name}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <strong>Product:</strong> {selectedReview.product_code}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <strong>Rating:</strong> 
                  <div className="flex">{renderStars(selectedReview.review)}</div>
                </div>
                <div>
                  <strong>Review:</strong>
                  <p className="mt-1 text-sm text-gray-700">{selectedReview.review_text}</p>
                </div>
              </div>
            )}
            <p className="text-sm text-red-600">
              ⚠️ This action cannot be undone and will recalculate the products average rating.
            </p>
          </div>
          <div className="flex gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteReview}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Deleting...' : 'Delete Review'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}