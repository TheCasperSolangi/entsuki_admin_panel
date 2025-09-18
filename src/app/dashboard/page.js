"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

import Cookies from 'js-cookie';
import { useAuth } from '../../context/authContext';

const StatCard = ({ title, value, description, icon: Icon, trend, trendValue }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center text-xs text-muted-foreground">
        {trend === 'up' ? (
          <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
        ) : (
          <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
        )}
        <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
          {trendValue}
        </span>
        <span className="ml-1">{description}</span>
      </div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }) => {
  const variants = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    paid: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <Badge className={`${variants[status]} border-none`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function DashboardHome() {
  const { user, loading: authLoading } = useAuth();
  const [financialData, setFinancialData] = useState(null);
  const [products, setProducts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    // If auth is still loading or user is not authenticated, return early
    if (authLoading || !user) {
      return;
    }

    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const [financialRes, productsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/financial_report`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })
        ]);
        
        if (!financialRes.ok || !productsRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const financialJson = await financialRes.json();
        const productsJson = await productsRes.json();
        
        setFinancialData(financialJson);
        setProducts(productsJson.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]);

  // Show loading state
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 flex items-center justify-center">
        <div>Loading dashboard data...</div>
      </div>
    );
  }

  // If not authenticated (handled by AuthProvider redirect)
  if (!user) {
    return null;
  }

  // If data failed to load
  if (!financialData) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 flex items-center justify-center">
        <div>Error loading dashboard data. Please try again.</div>
      </div>
    );
  }

  // Calculate percentage change for stats
  const revenueChange = financialData.change_percentage || 0;
  const revenueTrend = revenueChange >= 0 ? 'up' : 'down';
  const revenueChangeText = `${Math.abs(revenueChange).toFixed(2)}%`;

  // Prepare order status data for pie chart with fallbacks
  const orderStatusData = (financialData.charts?.orderStatusDistribution || []).map(status => ({
    name: status.status,
    value: status.count,
    color: 
      status.status === 'completed' ? '#8884d8' :
      status.status === 'paid' ? '#82ca9d' :
      status.status === 'pending' ? '#ffc658' :
      '#ff7300'
  }));

  // Prepare top products data with fallbacks
  const topProductsData = (financialData.charts?.topProducts || []).map((product, index) => ({
    name: product.name,
    totalSold: product.totalSold,
    revenue: `$${(product.totalSold * (products.find(p => p.product_name === product.name)?.price || 0)).toFixed(2)}`,
    trend: index < 2 ? 'up' : 'down'
  }));

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={process.env.NEXT_PUBLIC_FRONTEND_URL || '/'}>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Store
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`$${(financialData.revenue_this_month || 0).toFixed(2)}`}
            description="from last month"
            icon={DollarSign}
            trend={revenueTrend}
            trendValue={revenueChangeText}
          />
          <StatCard
            title="Orders"
            value={(financialData.so_far_financial_summary?.completed?.count || 0).toString()}
            description="completed this month"
            icon={ShoppingCart}
            trend="up"
            trendValue="+15%"
          />
          <StatCard
            title="Customers"
            value="1,234"
            description="active this month"
            icon={Users}
            trend="up"
            trendValue="+8.2%"
          />
          <StatCard
            title="Products"
            value={products.length.toString()}
            description="in inventory"
            icon={Package}
            trend="up"
            trendValue="+5.3%"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue for the last 2 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={financialData.charts?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Loss Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Loss Overview</CardTitle>
              <CardDescription>Monthly loss for the last 2 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialData.charts?.monthlyLoss || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Loss']} />
                  <Line type="monotone" dataKey="loss" stroke="#ff7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts and Tables */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current month order status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProductsData.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.totalSold} units sold</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{product.revenue}</span>
                      {product.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities and Profit/Loss */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Current month financial overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gross Revenue</span>
                <span className="font-semibold text-green-600">${(financialData.revenue_this_month || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Loss</span>
                <span className="font-semibold text-red-600">-${(financialData.this_month_loss || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed Orders</span>
                <span className="font-semibold text-green-600">${(financialData.so_far_financial_summary?.completed?.total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Orders</span>
                <span className="font-semibold text-yellow-600">${(financialData.so_far_financial_summary?.pending?.total || 0).toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Profit</span>
                <span className="font-bold text-green-600 text-lg">
                  ${((financialData.revenue_this_month || 0) - (financialData.this_month_loss || 0)).toFixed(2)}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Profit Margin</span>
                  <span>
                    {((financialData.revenue_this_month || 0) > 0 
                      ? (((financialData.revenue_this_month || 0) - (financialData.this_month_loss || 0)) / (financialData.revenue_this_month || 0) * 100).toFixed(2)
                      : 0
                    )}%
                  </span>
                </div>
                <Progress 
                  value={((financialData.revenue_this_month || 0) > 0 
                    ? (((financialData.revenue_this_month || 0) - (financialData.this_month_loss || 0)) / (financialData.revenue_this_month || 0) * 100)
                    : 0
                  )} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Product Highlights</CardTitle>
              <CardDescription>Key product metrics this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Best Selling Product</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{financialData.most_selling_product?.product_name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{financialData.most_selling_product?.product_code || ''}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Least Selling Product</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">{financialData.least_selling_product?.product_name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{financialData.least_selling_product?.product_code || ''}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Most Cancelled Product</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">{financialData.most_cancelled_product?.product_name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{financialData.most_cancelled_product?.product_code || ''}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}