'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Function to auto-generate category code
const generateCategoryCode = () => 'CAT-' + Math.random().toString(36).substr(2, 6).toUpperCase();

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_code: generateCategoryCode(),
    category_name: '',
    description: '',
    short_description: '',
    image: '',
    icon: '',
    metaTitle: '',
    metaDesc: '',
    keywords: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const token = Cookies.get('token'); // replace with your token cookie name
  const AUTH_TOKEN = token ? `Bearer ${token}` : null;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
      setCategories(res.data.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to fetch categories.' });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle image and icon file selection
  const handleImageChange = (e) => setImageFile(e.target.files[0]);
  const handleIconChange = (e) => setIconFile(e.target.files[0]);

  // Upload file to server
  const uploadFile = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_STORAGE_URL}/api/uploads`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url; // expecting { url: '...' } in response
    } catch (err) {
      setAlert({ type: 'error', message: `Failed to upload ${file.name}.` });
      return null;
    }
  };

  // Handle Add Category
  const handleAddCategory = async () => {
    if (!form.category_name.trim()) {
      setAlert({ type: 'error', message: 'Please enter a category name.' });
      return;
    }

    setLoading(true);
    try {
      const uploadedImageUrl = await uploadFile(imageFile);
      const uploadedIconUrl = await uploadFile(iconFile);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`,
        { ...form, image: uploadedImageUrl, icon: uploadedIconUrl },
        { headers: { Authorization: AUTH_TOKEN } }
      );

      setAlert({ type: 'success', message: 'Category added successfully.' });
      setOpen(false);
      setForm({
        category_code: generateCategoryCode(),
        category_name: '',
        description: '',
        short_description: '',
        image: '',
        icon: '',
        metaTitle: '',
        metaDesc: '',
        keywords: ''
      });
      setImageFile(null);
      setIconFile(null);
      fetchCategories();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to add category.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Categories Management</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>

              {alert && (
                <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{alert.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Input
                  name="category_code"
                  placeholder="Auto Generated Code"
                  value={form.category_code}
                  disabled
                />
                <Input
                  name="category_name"
                  placeholder="Category Name"
                  value={form.category_name}
                  onChange={handleChange}
                />
                <Textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                />
                <Textarea
                  name="short_description"
                  placeholder="Short Description"
                  value={form.short_description}
                  onChange={handleChange}
                />

                {/* Image upload */}
                <div>
                  <label className="block mb-1 font-medium">Category Image</label>
                  <Input type="file" accept="image/*" onChange={handleImageChange} />
                  {imageFile && (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Selected Image"
                      className="mt-2 h-16 w-16 object-cover rounded"
                    />
                  )}
                </div>

                {/* Icon upload */}
                <div>
                  <label className="block mb-1 font-medium">Category Icon</label>
                  <Input type="file" accept="image/*" onChange={handleIconChange} />
                  {iconFile && (
                    <img
                      src={URL.createObjectURL(iconFile)}
                      alt="Selected Icon"
                      className="mt-2 h-16 w-16 object-cover rounded"
                    />
                  )}
                </div>

                <Input
                  name="metaTitle"
                  placeholder="Meta Title"
                  value={form.metaTitle}
                  onChange={handleChange}
                />
                <Input
                  name="metaDesc"
                  placeholder="Meta Description"
                  value={form.metaDesc}
                  onChange={handleChange}
                />
                <Input
                  name="keywords"
                  placeholder="Keywords (comma-separated)"
                  value={form.keywords}
                  onChange={handleChange}
                />
              </div>

              <DialogFooter className="mt-4">
                <Button onClick={handleAddCategory} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Category'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-4">
          {alert && !open && (
            <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alert.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell>{cat.category_code}</TableCell>
                    <TableCell>{cat.category_name}</TableCell>
                    <TableCell>{cat.short_description || cat.description}</TableCell>
                    <TableCell>
                      {cat.image && <img src={cat.image} alt={cat.category_name} className="h-8 w-8 object-cover rounded" />}
                    </TableCell>
                    <TableCell>
                      {cat.icon && <img src={cat.icon} alt={`${cat.category_name}-icon`} className="h-8 w-8 object-cover rounded" />}
                    </TableCell>
                    <TableCell>{new Date(cat.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
