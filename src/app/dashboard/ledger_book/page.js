"use client"
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, DollarSign, Calendar, Phone, User, 
  CreditCard, TrendingUp, Clock, AlertCircle, CheckCircle, 
  Shield, Star, Activity, Filter, Eye, Lock, X, ArrowUp, ArrowDown,
  Receipt, Wallet, PieChart, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import QRCode from "qrcode";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ModernLedgerSystem() {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    order_code: '',
    amount_due: '',
    expected_due_date: ''
  });



const printReceipt = async (transaction_summary) => {
  const { full_name, mobile_number, amount_paid, paid_with, transaction_id } = transaction_summary;
  const verificationUrl = `http://aqsatraders.lycatechnologies.com/transactions/verification/${transaction_id}`;

  try {
    // Generate QR code as DataURL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 120,
      margin: 1,
      errorCorrectionLevel: 'H', // High error correction for better scan reliability
    });

    // Create printable HTML for thermal printer
    const receiptContent = `
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { font-family: monospace; text-align: center; width: 250px; margin: 0 auto; }
            img { width: 120px; height: 120px; image-rendering: pixelated; }
            hr { border: none; border-top: 1px solid #000; margin: 10px 0; }
            p { margin: 5px 0; }
            h3 { margin: 10px 0; }
          </style>
        </head>
        <body>
          <h3>PAYMENT RECEIPT</h3>
          <hr />
          <p>Customer: ${full_name}</p>
          <p>Mobile: ${mobile_number}</p>
          <p>Transaction ID: ${transaction_id}</p>
          <p>Amount Paid: ${amount_paid}</p>
          <p>Payment Method: ${paid_with}</p>
          <p style="margin-top:10px;">Thank you for your payment!</p>
          <p>Scan QR to verify:</p>
          <img src="${qrCodeDataUrl}" alt="QR Code" />
          <hr />
        </body>
      </html>
    `;

    // Open print window and ensure content is fully loaded before printing
    const printWindow = window.open("", "PRINT", "width=300,height=600");
    printWindow.document.write(receiptContent);
    printWindow.document.close();

    // Wait for the image to load before triggering print
    const img = printWindow.document.querySelector("img");
    if (img.complete) {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      img.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
      img.onerror = () => {
        console.error("Failed to load QR code image");
        printWindow.close();
      };
    }
  } catch (error) {
    console.error("Error generating QR code or printing receipt:", error);
  }
};
  // API Functions
  const fetchLedgers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/ledgers`);
      const result = await response.json();
      
      if (result.success) {
        setLedgers(result.data);
      } else {
        setError(result.message || 'Failed to fetch ledgers');
      }
    } catch (err) {
      setError('Network error: Could not fetch ledgers');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createLedger = async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/ledgers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          amount_due: parseFloat(data.amount_due),
          expected_due_date: new Date(data.expected_due_date).toISOString()
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Ledger entry created successfully');
        await fetchLedgers();
        resetForm();
        setIsCreateDialogOpen(false);
      } else {
        setError(result.message || 'Failed to create ledger');
      }
    } catch (err) {
      setError('Network error: Could not create ledger');
      console.error('Create error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLedger = async (id, data) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/ledgers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          amount_due: parseFloat(data.amount_due),
          expected_due_date: new Date(data.expected_due_date).toISOString()
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Ledger entry updated successfully');
        await fetchLedgers();
        resetForm();
        setIsEditDialogOpen(false);
      } else {
        setError(result.message || 'Failed to update ledger');
      }
    } catch (err) {
      setError('Network error: Could not update ledger');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLedger = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/ledgers/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Ledger entry deleted successfully');
        await fetchLedgers();
      } else {
        setError(result.message || 'Failed to delete ledger');
      }
    } catch (err) {
      setError('Network error: Could not delete ledger');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/ledgers/paid/${id}`, {
        method: 'PATCH',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess('Payment marked as paid successfully');
        await fetchLedgers();
        await printReceipt(result.transaction_summary);
      } else {
        setError(result.message || 'Failed to mark as paid');
      }
    } catch (err) {
      setError('Network error: Could not mark as paid');
      console.error('Mark paid error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerProfile = async (mobileNumber) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/ledgers/customer/${mobileNumber}`);
      const result = await response.json();
      
      if (result.success) {
        const profile = {
          name: result.ledgers_summary[0]?.full_name || 'Unknown',
          mobile: mobileNumber,
          totalAmount: result.total,
          paidAmount: result.paid,
          outstandingAmount: result.outstanding_balance,
          creditScore: Math.floor((result.credit_score / 100) * 850),
          paymentHistory: Math.floor((result.paid / result.total) * 100) || 0,
          totalTransactions: result.total_ledger_entries,
          paidTransactions: result.ledgers_summary.filter(l => l.is_paid).length,
          overdueTransactions: result.missed_due_ledgers.length,
          ledgers: result.ledgers_summary.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
          joinDate: result.ledgers_summary[0]?.created_at
        };
        
        setSelectedCustomer(profile);
        setIsCustomerProfileOpen(true);
      } else {
        setError(result.message || 'Failed to fetch customer profile');
      }
    } catch (err) {
      setError('Network error: Could not fetch customer profile');
      console.error('Customer profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const resetForm = () => {
    setFormData({
      full_name: '',
      mobile_number: '',
      order_code: '',
      amount_due: '',
      expected_due_date: ''
    });
  };

  const handleCreate = async () => {
    if (!formData.full_name || !formData.mobile_number || !formData.order_code || !formData.amount_due || !formData.expected_due_date) {
      setError('Please fill in all fields');
      return;
    }
    await createLedger(formData);
  };

  const handleEdit = (ledger) => {
    setSelectedLedger(ledger);
    setFormData({
      full_name: ledger.full_name,
      mobile_number: ledger.mobile_number,
      order_code: ledger.order_code,
      amount_due: ledger.amount_due.toString(),
      expected_due_date: ledger.expected_due_date.split('T')[0]
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!formData.full_name || !formData.mobile_number || !formData.order_code || !formData.amount_due || !formData.expected_due_date) {
      setError('Please fill in all fields');
      return;
    }
    await updateLedger(selectedLedger._id, formData);
  };

  const handleViewProfile = (mobileNumber) => {
    fetchCustomerProfile(mobileNumber);
  };

  const handleMarkAsPaid = async (id) => {
    await markAsPaid(id);
  };

  const handleDelete = async (id) => {
    await deleteLedger(id);
  };

  const filteredLedgers = ledgers.filter(ledger => {
    const matchesSearch = ledger.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ledger.mobile_number.includes(searchTerm) ||
      ledger.order_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'paid') return matchesSearch && ledger.is_paid;
    if (statusFilter === 'pending') return matchesSearch && !ledger.is_paid && new Date(ledger.expected_due_date) >= new Date();
    if (statusFilter === 'overdue') return matchesSearch && !ledger.is_paid && new Date(ledger.expected_due_date) < new Date();
    
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dateString, isPaid) => {
    return new Date(dateString) < new Date() && !isPaid;
  };

  const getStatusBadge = (ledger) => {
    if (ledger.is_paid) {
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
    }
    if (isOverdue(ledger.expected_due_date, ledger.is_paid)) {
      return <Badge className="bg-red-100 text-red-700 border-red-200 font-medium"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const getCreditScoreColor = (score) => {
    if (score >= 750) return 'text-emerald-600';
    if (score >= 650) return 'text-amber-600';
    return 'text-red-600';
  };

  const getCreditScoreGradient = (score) => {
    if (score >= 750) return 'from-emerald-500 to-emerald-600';
    if (score >= 650) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  const totalAmount = ledgers.reduce((sum, l) => sum + l.amount_due, 0);
  const paidAmount = ledgers.filter(l => l.is_paid).reduce((sum, l) => sum + l.amount_due, 0);
  const overdueAmount = ledgers.filter(l => isOverdue(l.expected_due_date, l.is_paid)).reduce((sum, l) => sum + l.amount_due, 0);
  const pendingAmount = totalAmount - paidAmount - overdueAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            {success}
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Ledger Management
            </h1>
            <p className="text-slate-600 text-lg">Comprehensive payment tracking and customer insights</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
              <DialogHeader className="border-b border-slate-100 pb-4">
                <DialogTitle className="text-2xl font-semibold text-slate-800">Create New Entry</DialogTitle>
                <DialogDescription className="text-slate-600">
                  Add a new customer payment entry to the ledger system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-3">
                  <Label htmlFor="full_name" className="text-sm font-medium text-slate-700">Customer Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Enter full name"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="mobile_number" className="text-sm font-medium text-slate-700">Mobile Number</Label>
                  <Input
                    id="mobile_number"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                    placeholder="+1234567890"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="order_code" className="text-sm font-medium text-slate-700">Order Code</Label>
                  <Input
                    id="order_code"
                    value={formData.order_code}
                    onChange={(e) => setFormData({...formData, order_code: e.target.value})}
                    placeholder="ORD-001"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="amount_due" className="text-sm font-medium text-slate-700">Amount Due</Label>
                  <Input
                    id="amount_due"
                    type="number"
                    step="0.01"
                    value={formData.amount_due}
                    onChange={(e) => setFormData({...formData, amount_due: e.target.value})}
                    placeholder="0.00"
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="expected_due_date" className="text-sm font-medium text-slate-700">Due Date</Label>
                  <Input
                    id="expected_due_date"
                    type="date"
                    value={formData.expected_due_date}
                    onChange={(e) => setFormData({...formData, expected_due_date: e.target.value})}
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <DialogFooter className="border-t border-slate-100 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-200">
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  {loading ? 'Creating...' : 'Create Entry'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Amount</p>
                  <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-blue-400 bg-opacity-20 p-3 rounded-full">
                  <Wallet className="h-6 w-6 text-blue-100" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Paid</p>
                  <p className="text-2xl font-bold">${paidAmount.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-400 bg-opacity-20 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-emerald-100" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold">${pendingAmount.toLocaleString()}</p>
                </div>
                <div className="bg-amber-400 bg-opacity-20 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-amber-100" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Overdue</p>
                  <p className="text-2xl font-bold">${overdueAmount.toLocaleString()}</p>
                </div>
                <div className="bg-red-400 bg-opacity-20 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search customers, orders, or phone numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-md focus:border-blue-500 focus:ring-blue-500 bg-white/80 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
                <Badge variant="outline" className="px-3 py-1">
                  {filteredLedgers.length} entries
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl font-semibold text-slate-800">Payment Ledger</CardTitle>
            <CardDescription className="text-slate-600">
              Comprehensive view of all customer transactions and payment status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLedgers.map((ledger, index) => (
                      <tr key={ledger._id} className={`hover:bg-slate-50/50 transition-colors ${ledger.is_paid ? 'opacity-75' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {ledger.full_name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-800">{ledger.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <Button
                              variant="link"
                              className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                              onClick={() => handleViewProfile(ledger.mobile_number)}
                            >
                              {ledger.mobile_number}
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Receipt className="h-4 w-4 text-slate-400" />
                            <span className="font-mono text-sm text-slate-700">{ledger.order_code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-semibold text-slate-800">${ledger.amount_due.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className={`text-sm ${isOverdue(ledger.expected_due_date, ledger.is_paid) ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                              {formatDate(ledger.expected_due_date)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(ledger)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewProfile(ledger.mobile_number)}
                              className="border-slate-200 hover:border-blue-300 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {ledger.is_paid ? (
                              <div className="flex items-center space-x-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-500">
                                <Lock className="h-3 w-3" />
                                <span>Locked</span>
                              </div>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(ledger)}
                                  className="border-slate-200 hover:border-amber-300 hover:text-amber-700"
                                  disabled={loading}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(ledger._id)}
                                  className="border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                                  disabled={loading}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-slate-200 hover:border-red-300 hover:text-red-700" disabled={loading}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="border-0 shadow-2xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-slate-800">Confirm Deletion</AlertDialogTitle>
                                      <AlertDialogDescription className="text-slate-600">
                                        This will permanently delete the ledger entry for <strong>{ledger.full_name}</strong>. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-slate-200">Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(ledger._id)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        disabled={loading}
                                      >
                                        {loading ? 'Deleting...' : 'Delete Entry'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

     <Dialog open={isCustomerProfileOpen} onOpenChange={setIsCustomerProfileOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-xl bg-white">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base">
                {selectedCustomer?.name?.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800">{selectedCustomer?.name}</DialogTitle>
                <DialogDescription className="text-slate-600 flex items-center space-x-2 text-sm">
                  <Phone className="h-3 w-3" />
                  <span>{selectedCustomer?.mobile}</span>
                  <span className="text-slate-400">•</span>
                  <span>Customer since {selectedCustomer?.joinDate && formatDate(selectedCustomer.joinDate)}</span>
                </DialogDescription>
              </div>
            </div>
          
          </div>
        </DialogHeader>

        {selectedCustomer && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-slate-100">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className={`text-3xl font-bold ${getCreditScoreColor(selectedCustomer.creditScore)}`}>
                      {selectedCustomer.creditScore}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <Shield className={`h-4 w-4 ${getCreditScoreColor(selectedCustomer.creditScore)}`} />
                        <span className="text-xs font-medium text-slate-600">Credit Score</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${getCreditScoreGradient(selectedCustomer.creditScore)}`}
                          style={{ width: `${(selectedCustomer.creditScore - 300) / 550 * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedCustomer.creditScore >= 750 ? 'Excellent' : 
                         selectedCustomer.creditScore >= 650 ? 'Good' : 'Fair'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-slate-700 text-sm">Payment History</span>
                    </div>
                    <div className="text-xl font-bold text-slate-800">{selectedCustomer.paymentHistory}%</div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${selectedCustomer.paymentHistory}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {selectedCustomer.paidTransactions} of {selectedCustomer.totalTransactions} payments completed
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-slate-700 text-sm">Account Status</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Active Orders</span>
                        <span className="font-medium">{selectedCustomer.totalTransactions - selectedCustomer.paidTransactions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Overdue</span>
                        <span className="font-medium text-red-600">{selectedCustomer.overdueTransactions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Orders</span>
                        <span className="font-medium">{selectedCustomer.totalTransactions}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium">Total Business</p>
                      <p className="text-xl font-bold">${selectedCustomer.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs font-medium">Paid Amount</p>
                      <p className="text-xl font-bold">${selectedCustomer.paidAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-xs font-medium">Outstanding</p>
                      <p className="text-xl font-bold">${selectedCustomer.outstandingAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="h-4 w-4 text-slate-600" />
                  <span>Transaction History</span>
                </CardTitle>
                <CardDescription className="text-sm">Complete payment history and order details</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Order</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Due Date</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCustomer.ledgers.map((ledger) => (
                        <tr key={ledger._id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2">
                            <span className="font-mono text-sm text-slate-700">{ledger.order_code}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-semibold text-slate-800">${ledger.amount_due.toLocaleString()}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`text-sm ${isOverdue(ledger.expected_due_date, ledger.is_paid) ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                              {formatDate(ledger.expected_due_date)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {getStatusBadge(ledger)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {selectedCustomer.overdueTransactions > 0 && (
              <Card className="border-0 shadow-md border-l-4 border-l-red-500 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>Risk Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-red-700 font-medium text-sm">
                      Customer has {selectedCustomer.overdueTransactions} overdue payment(s)
                    </p>
                    <p className="text-xs text-red-600">
                      Consider implementing payment reminders or adjusting credit terms for future transactions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
            <DialogHeader className="border-b border-slate-100 pb-4">
              <DialogTitle className="text-2xl font-semibold text-slate-800">Edit Entry</DialogTitle>
              <DialogDescription className="text-slate-600">
                Update the ledger entry information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-3">
                <Label htmlFor="edit_full_name" className="text-sm font-medium text-slate-700">Customer Name</Label>
                <Input
                  id="edit_full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit_mobile_number" className="text-sm font-medium text-slate-700">Mobile Number</Label>
                <Input
                  id="edit_mobile_number"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit_order_code" className="text-sm font-medium text-slate-700">Order Code</Label>
                <Input
                  id="edit_order_code"
                  value={formData.order_code}
                  onChange={(e) => setFormData({...formData, order_code: e.target.value})}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit_amount_due" className="text-sm font-medium text-slate-700">Amount Due</Label>
                <Input
                  id="edit_amount_due"
                  type="number"
                  step="0.01"
                  value={formData.amount_due}
                  onChange={(e) => setFormData({...formData, amount_due: e.target.value})}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit_expected_due_date" className="text-sm font-medium text-slate-700">Due Date</Label>
                <Input
                  id="edit_expected_due_date"
                  type="date"
                  value={formData.expected_due_date}
                  onChange={(e) => setFormData({...formData, expected_due_date: e.target.value})}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-200">
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={loading} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                {loading ? 'Updating...' : 'Update Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}