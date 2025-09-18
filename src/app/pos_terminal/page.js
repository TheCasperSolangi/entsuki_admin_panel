"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign,
  Package,
  Search,
  User,
  Clock,
  Receipt,
  AlertCircle,
  CheckCircle,
  Loader,
  Wifi,
  WifiOff,
  Scan,
  Camera,
  X,
  Zap,
  UserPlus,
  Phone
} from 'lucide-react';

const POSTerminal = () => {
  // Configuration - these would come from your app config
  const [config, setConfig] = useState({
    terminal_id: "DTPOS-112",
    appName: "Entsuki",
    apiBaseUrl: "http://localhost:5000/api"
  });

  // Products and cart state
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({
    cart_code: '',
    username: 'POS_Terminal_User',
    products: [],
    subtotal: [],
    total: 0,
    discountInfo: null
  });
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerPaid, setCustomerPaid] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Credit customer information
  const [creditCustomer, setCreditCustomer] = useState({
    name: '',
    number: ''
  });

  // Barcode scanning state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState('');
  const barcodeInputRef = useRef(null);

  // Categories derived from products
  const categories = ['All', ...new Set(products.map(p => p.category_code))];

  // Initialize component
  useEffect(() => {
    initializePOS();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Keyboard event listener for barcode scanning
    const handleKeyDown = (e) => {
      // Toggle scanning mode when F2 is pressed
      if (e.key === 'F2') {
        e.preventDefault();
        setIsScanning(prev => !prev);
        if (!isScanning) {
          // Clear previous input when starting to scan
          setBarcodeInput('');
          setTimeout(() => barcodeInputRef.current?.focus(), 100);
        }
      }
      
      // Handle escape key to exit scanning mode
      if (e.key === 'Escape' && isScanning) {
        setIsScanning(false);
        setBarcodeInput('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScanning]);

  // Initialize POS system
  const initializePOS = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        createOrGetCart()
      ]);
    } catch (err) {
      setError('Failed to initialize POS system');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/products`);
      const data = await response.json();
      
      if (data.success) {
        // Transform products to match POS format
        const formattedProducts = data.data.map(product => ({
          id: product._id,
          name: product.product_name,
          price: parseFloat(product.price),
          category: product.category_code,
          image: product.productImages?.[0] || '📦',
          product_code: product.product_code,
          stock: product.stock || 0
        }));
        setProducts(formattedProducts);
      }
    } catch (err) {
      throw new Error('Failed to fetch products');
    }
  };

  // Create or get cart
  const createOrGetCart = async () => {
    try {
      const cartCode = `POS_${config.terminal_id}_${Date.now()}`;
      const response = await fetch(`${config.apiBaseUrl}/carts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_code: cartCode,
          username: 'POS_Cashier'
        })
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (err) {
      throw new Error('Failed to initialize cart');
    }
  };

  // Replace the processBarcodeInput function
  const processBarcodeInput = async (barcode) => {
    if (!barcode) return;

    try {
      setLoading(true);

      // Clear input immediately to prevent issues
      setBarcodeInput('');
      if (barcodeInputRef.current) {
        barcodeInputRef.current.value = '';
      }

      // Add to scan history
      const scanEntry = {
        code: barcode,
        timestamp: new Date(),
        status: 'processing'
      };
      setScanHistory(prev => [scanEntry, ...prev.slice(0, 9)]);

      // Find product by ID
      const product = products.find(p => p.id === barcode);

      if (product) {
        if (product.stock > 0) {
          await addToCartByBarcode(product);

          setScanHistory(prev => prev.map(scan => 
            scan.code === barcode && scan.status === 'processing'
              ? { ...scan, status: 'success', productName: product.name }
              : scan
          ));

          setSuccess(`Scanned: ${product.name} - Added to cart`);

          // Play success sound
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhWGk=');
            audio.play();
          } catch (e) {}
        } else {
          setScanHistory(prev => prev.map(scan => 
            scan.code === barcode && scan.status === 'processing'
              ? { ...scan, status: 'out_of_stock', productName: product.name }
              : scan
          ));
          setError(`${product.name} is out of stock`);
        }
      } else {
        setScanHistory(prev => prev.map(scan => 
          scan.code === barcode && scan.status === 'processing'
            ? { ...scan, status: 'not_found' }
            : scan
        ));
        setError(`Product not found for barcode: ${barcode}`);
      }

      // Refocus input for next scan
      setTimeout(() => {
        if (isScanning && barcodeInputRef.current) {
          barcodeInputRef.current.focus();
          setBarcodeInput(''); // Ensure it's clear
        }
      }, 50);

      setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);

    } catch (err) {
      setError('Failed to process barcode scan');
      setScanHistory(prev => prev.map(scan => 
        scan.code === barcode && scan.status === 'processing'
          ? { ...scan, status: 'error' }
          : scan
      ));
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (!isScanning) return;

  const handleScanKeyDown = (e) => {
    // Skip if typing in amount/credit/customer inputs
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
      if (activeElement !== barcodeInputRef.current) {
        return; // let normal typing happen
      }
    }

    if (isScanning) {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (barcodeBuffer.trim()) {
          processBarcodeInput(barcodeBuffer.trim());
        }
        setBarcodeBuffer("");
        if (barcodeInputRef.current) {
          barcodeInputRef.current.value = "";
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        setBarcodeBuffer((prev) => prev + e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        e.stopPropagation();
        setBarcodeBuffer((prev) => prev.slice(0, -1));
      }
    }
  };

  window.addEventListener("keydown", handleScanKeyDown, { capture: true });
  return () => {
    window.removeEventListener("keydown", handleScanKeyDown, { capture: true });
  };
}, [isScanning, barcodeBuffer]);

  // Add product to cart via barcode
  const addToCartByBarcode = async (product) => {
    if (!isOnline) {
      throw new Error('Cannot add items while offline');
    }

    const response = await fetch(`${config.apiBaseUrl}/carts/${cart.cart_code}/add-product`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product.id,
        quantity: 1
      })
    });

    const data = await response.json();
    if (data.success) {
      setCart(data.data);
    } else {
      throw new Error(data.message || 'Failed to add product');
    }
  };

  // Add product to cart
  const addToCart = async (product) => {
    if (!isOnline) {
      setError('Cannot add items while offline');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${config.apiBaseUrl}/carts/${cart.cart_code}/add-product`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
        setSuccess(`${product.name} added to cart`);
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(data.message || 'Failed to add product');
      }
    } catch (err) {
      setError('Failed to add product to cart');
    } finally {
      setLoading(false);
    }
  };

  // Update product quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (!isOnline) {
      setError('Cannot update items while offline');
      return;
    }

    try {
      setLoading(true);
      
      if (newQuantity <= 0) {
        // Remove product
        const response = await fetch(`${config.apiBaseUrl}/carts/${cart.cart_code}/remove-product`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId })
        });
        
        const data = await response.json();
        if (data.success) {
          setCart(data.data);
        }
      } else {
        // Update quantity
        const response = await fetch(`${config.apiBaseUrl}/carts/${cart.cart_code}/update-quantity`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: productId,
            quantity: newQuantity
          })
        });

        const data = await response.json();
        if (data.success) {
          setCart(data.data);
        }
      }
    } catch (err) {
      setError('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    if (!isOnline) {
      setError('Cannot remove items while offline');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${config.apiBaseUrl}/carts/${cart.cart_code}/remove-product`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      });

      const data = await response.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (err) {
      setError('Failed to remove product');
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isOnline) {
      setError('Cannot clear cart while offline');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${config.apiBaseUrl}/carts/${cart.cart_code}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await createOrGetCart(); // Create new cart
        setShowPayment(false);
        setCustomerPaid('');
        setCreditCustomer({ name: '', number: '' });
        setSuccess('Cart cleared');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  // Create ledger entry for credit sales
  const createLedgerEntry = async (orderData) => {
    try {
      const expectedDueDate = new Date();
      expectedDueDate.setDate(expectedDueDate.getDate() + 30); // 30 days credit period
      
      const ledgerEntry = {
        full_name: creditCustomer.name,
        mobile_number: creditCustomer.number,
        order_code: orderData.order_code,
        amount_due: cart.total,
        expected_due_date: expectedDueDate.toISOString().split('T')[0], // YYYY-MM-DD format
        is_paid: false
      };

      const response = await fetch(`${config.apiBaseUrl}/ledgers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ledgerEntry)
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error('Failed to create ledger entry');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Ledger creation failed: ${error.message}`);
    }
  };

  // Generate invoice HTML
  const generateInvoice = (orderData) => {
    const invoiceDate = new Date().toLocaleString();
    const invoiceItems = cart.products.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        name: product?.name || 'Unknown Product',
        quantity: item.quantity,
        unitPrice: item.finalPrice || item.price,
        total: (item.finalPrice || item.price) * item.quantity,
        discount: item.discountApplied ? item.discountAmount * item.quantity : 0
      };
    });

    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.total + item.discount), 0);
    const totalDiscount = invoiceItems.reduce((sum, item) => sum + item.discount, 0);
    const additionalCharges = cart.subtotal?.reduce((sum, item) => sum + item.value, 0) || 0;

    return `
      <div class="receipt">
        <!-- Header -->
        <div class="header">
          <div class="store-name">AQSA TRADERS</div>
          <div class="store-info">Sale Invoice</div>
          <div class="terminal-info">Terminal: ${config.terminal_id.slice(-8)}</div>
          <div class="divider">================================</div>
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
          <div class="row">
            <span>Invoice:</span>
            <span>${orderData.order_code}</span>
          </div>
          <div class="row">
            <span>Date:</span>
            <span>${new Date().toLocaleDateString()}</span>
          </div>
          <div class="row">
            <span>Time:</span>
            <span>${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="row">
            <span>Cashier:</span>
            <span>POS-${config.terminal_id.slice(-4)}</span>
          </div>
          ${paymentMethod === 'CREDIT' ? `
          <div class="row">
            <span>Customer:</span>
            <span>${creditCustomer.name}</span>
          </div>
          <div class="row">
            <span>Phone:</span>
            <span>${creditCustomer.number}</span>
          </div>
          ` : ''}
        </div>

        <div class="divider">================================</div>

        <!-- Items -->
        <div class="items-header">
          <div class="item-row header-row">
            <span class="item-name">ITEM</span>
            <span class="item-qty">QTY</span>
            <span class="item-price">PRICE</span>
            <span class="item-total">TOTAL</span>
          </div>
        </div>

        <div class="items">
          ${invoiceItems.map(item => `
            <div class="item-row">
              <span class="item-name">${item.name}</span>
              <span class="item-qty">${item.quantity}</span>
              <span class="item-price">RS ${item.unitPrice.toFixed(2)}</span>
              <span class="item-total">RS ${item.total.toFixed(2)}</span>
            </div>
            ${item.discount > 0 ? `
              <div class="discount-row">
                <span class="discount-text">  Discount Applied</span>
                <span class="discount-amount">-RS ${item.discount.toFixed(2)}</span>
              </div>
            ` : ''}
          `).join('')}
        </div>

        <div class="divider">--------------------------------</div>

        <!-- Totals -->
        <div class="totals">
          ${totalDiscount > 0 ? `
            <div class="row">
              <span>Subtotal:</span>
              <span>RS ${subtotal.toFixed(2)}</span>
            </div>
            <div class="row discount">
              <span>Total Discount:</span>
              <span>-RS ${totalDiscount.toFixed(2)}</span>
            </div>
          ` : ''}
          
          ${cart.subtotal?.map(item => `
            <div class="row">
              <span>${item.name}:</span>
              <span>RS ${item.value.toFixed(2)}</span>
            </div>
          `).join('') || ''}

          <div class="divider">--------------------------------</div>
          
          <div class="row total-row">
            <span>TOTAL:</span>
            <span>RS ${orderData.total.toFixed(2)}</span>
          </div>

          <div class="divider">================================</div>

          <!-- Payment Details -->
          <div class="payment-details">
            <div class="row">
              <span>Payment Method:</span>
              <span>${paymentMethod}</span>
            </div>
            ${paymentMethod === 'CASH' ? `
              <div class="row">
                <span>Amount Tendered:</span>
                <span>RS ${parseFloat(customerPaid).toFixed(2)}</span>
              </div>
              <div class="row">
                <span>Change:</span>
                <span>RS ${change.toFixed(2)}</span>
              </div>
            ` : ''}
            ${paymentMethod === 'CREDIT' ? `
              <div class="row">
                <span>Due Date:</span>
                <span>${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            ` : ''}
            <div class="row">
              <span>Status:</span>
              <span>${paymentMethod === 'CASH' ? 'PAID' : paymentMethod === 'CREDIT' ? 'CREDIT' : 'PENDING'}</span>
            </div>
          </div>
        </div>

        <div class="divider">================================</div>

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">Thank you for your business!</div>
          <div class="return-policy">
            Return Policy: Items Cannot be returned
            they can either be exchanged or converted into loyalti points
          </div>
          <div class="contact-info">
            For support: 03438021567
          </div>
          <div class="timestamp">
            Printed: ${new Date().toLocaleString()}
          </div>
        </div>

        <div class="divider">================================</div>
        
        <!-- QR Code Placeholder -->
        <div class="qr-section">
          <div class="qr-placeholder">
            POWERED BY LYCA TECHNOLOGIES
          </div>
        
        </div>
      </div>
    `;
  };

  // Receipt styles for thermal printer (58mm width)
  const getReceiptStyles = () => `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.2;
      color: #000;
      background: #fff;
      width: 58mm;
      margin: 0 auto;
      padding: 0;
    }

    .receipt {
      width: 100%;
      max-width: 58mm;
      padding: 8px;
    }

    .header {
      text-align: center;
      margin-bottom: 8px;
    }

    .store-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 2px;
      text-transform: uppercase;
    }

    .store-info {
      font-size: 10px;
      margin-bottom: 1px;
    }

    .terminal-info {
      font-size: 9px;
      color: #666;
      margin-bottom: 4px;
    }

    .divider {
      font-size: 10px;
      text-align: center;
      margin: 4px 0;
      letter-spacing: -1px;
    }

    .invoice-details {
      margin-bottom: 4px;
    }

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1px;
      font-size: 10px;
    }

    .row.total-row {
      font-weight: bold;
      font-size: 12px;
      margin: 4px 0;
    }

    .row.discount {
      color: #008000;
    }

    .items-header {
      margin: 4px 0 2px 0;
    }

    .item-row {
      display: grid;
      grid-template-columns: 2fr 0.5fr 0.8fr 0.8fr;
      gap: 2px;
      font-size: 9px;
      margin-bottom: 1px;
      align-items: center;
    }

    .header-row {
      font-weight: bold;
      font-size: 8px;
      text-transform: uppercase;
      border-bottom: 1px solid #000;
      padding-bottom: 1px;
      margin-bottom: 2px;
    }

    .item-name {
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-qty {
      text-align: center;
    }

    .item-price, .item-total {
      text-align: right;
    }

    .discount-row {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #008000;
      margin-bottom: 1px;
      font-style: italic;
    }

    .discount-text {
      text-align: left;
    }

    .discount-amount {
      text-align: right;
    }

    .totals {
      margin: 4px 0;
    }

    .payment-details {
      margin: 4px 0;
    }

    .footer {
      text-align: center;
      margin-top: 8px;
    }

    .thank-you {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .return-policy {
      font-size: 8px;
      margin-bottom: 2px;
      line-height: 1.3;
    }

    .contact-info {
      font-size: 8px;
      margin-bottom: 2px;
    }

    .timestamp {
      font-size: 8px;
      color: #666;
      margin-bottom: 4px;
    }

    .qr-section {
      text-align: center;
      margin-top: 4px;
    }

    .qr-placeholder {
      font-size: 8px;
      font-family: monospace;
      background: #f0f0f0;
      padding: 4px;
      margin-bottom: 2px;
      border: 1px solid #ccc;
    }

    .qr-text {
      font-size: 7px;
      color: #666;
    }

    /* Print specific styles */
    @media print {
      body {
        background: none !important;
        font-size: 11px;
      }
      
      .receipt {
        box-shadow: none !important;
        border: none !important;
      }

      .divider {
        color: #000 !important;
      }
    }

    /* Ensure proper spacing for thermal printers */
    @page {
      size: 58mm auto;
      margin: 0;
    }
  `;

  // Generate and print invoice
  const printReceipt = (orderData) => {
    const invoice = generateInvoice(orderData);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${orderData.order_code}</title>
          <style>
            ${getReceiptStyles()}
          </style>
        </head>
        <body>
          ${invoice}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Process payment and create order
  const processPayment = async () => {
    if (!isOnline) {
      setError('Cannot process payment while offline');
      return;
    }

    if (paymentMethod === 'CASH' && parseFloat(customerPaid) < cart.total) {
      setError('Insufficient payment amount');
      return;
    }

    if (paymentMethod === 'CREDIT' && (!creditCustomer.name.trim() || !creditCustomer.number.trim())) {
      setError('Please enter customer name and phone number for credit sales');
      return;
    }

    try {
      setLoading(true);
      
      // Add delivery charges if needed
      if (cart.total > 0) {
        await fetch(`${config.apiBaseUrl}/carts/${cart.cart_code}/add-subtotal`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Service Charge',
            value: 0 // No additional charges for POS
          })
        });
      }

      // Create order
      const orderCode = `ORDER_${config.terminal_id}_${Date.now()}`;
      const orderResponse = await fetch(`${config.apiBaseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_code: orderCode,
          cart_code: cart.cart_code,
          payment_method: paymentMethod,
          billing_address: paymentMethod === 'CREDIT' ? `${creditCustomer.name} - ${creditCustomer.number}` : 'Walk-in Customer',
          shipping_address: 'In-store pickup',
          special_instructions: `POS Order - Terminal: ${config.terminal_id}${paymentMethod === 'CREDIT' ? ` - Credit Customer: ${creditCustomer.name}` : ''}`,
          delivery_type: 'POS'
        })
      });

      const orderData = await orderResponse.json();
      
      if (orderData.success) {
        // Update order status to paid for cash payments
        if (paymentMethod === 'CASH') {
          await fetch(`${config.apiBaseUrl}/orders/${orderCode}/mark_paid`, {
            method: 'PUT'
          });
        }

        // Create ledger entry for credit sales
        if (paymentMethod === 'CREDIT') {
          try {
            await createLedgerEntry(orderData.data);
            setSuccess(`Credit sale completed! Order ${orderCode} added to ledger for ${creditCustomer.name}`);
          } catch (ledgerError) {
            setError(`Order created but failed to add to ledger: ${ledgerError.message}`);
          }
        } else {
          setSuccess(`Order ${orderCode} completed successfully!`);
        }
        
        // Print receipt automatically
        printReceipt(orderData.data);
        
        // Reset for next order
        setCart({
          cart_code: orderData.new_cart_code,
          username: 'POS_Cashier',
          products: [],
          subtotal: [],
          total: 0,
          discountInfo: null
        });
        setShowPayment(false);
        setCustomerPaid('');
        setCreditCustomer({ name: '', number: '' });
        
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(orderData.message || 'Failed to create order');
      }
    } catch (err) {
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate change
  const change = customerPaid ? Math.max(0, parseFloat(customerPaid) - cart.total) : 0;

  // Clear scan history
  const clearScanHistory = () => {
    setScanHistory([]);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Initializing POS Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{config.appName} POS</h1>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <User className="h-4 w-4 mr-1" />
              Terminal: {config.terminal_id.slice(-6)}
            </Badge>
            <Badge variant={isOnline ? "success" : "destructive"} className="px-3 py-1">
              {isOnline ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{currentTime.toLocaleString()}</span>
          </div>
        </div>

        {/* Hidden barcode input for scanning */}
        {isScanning && (
          <div className="fixed top-0 left-0 w-full bg-yellow-100 border-b border-yellow-400 py-2 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <Scan className="h-5 w-5 text-yellow-700 animate-pulse" />
                <span className="font-semibold text-yellow-800">Scanning Mode Active</span>
                <span className="text-yellow-700 text-sm">(Press ESC to cancel)</span>
              </div>
              <form className="flex items-center space-x-2" onSubmit={(e) => {
                e.preventDefault();
                if (barcodeBuffer.trim()) {
                  processBarcodeInput(barcodeBuffer.trim());
                }
              }}>
                <Input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeBuffer}
                  onChange={(e) => setBarcodeBuffer(e.target.value)}
                  placeholder="Scan or type barcode..."
                  className="w-48"
                  autoFocus
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-yellow-600 hover:bg-yellow-700"
                  disabled={!barcodeInput.trim()}
                >
                  Process
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsScanning(false);
                    setBarcodeInput('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-800">×</button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto text-green-800">×</button>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Products Section */}
          <div className="col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Products ({products.length})</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => {
                        setIsScanning(prev => !prev);
                        setBarcodeInput('');
                        setTimeout(() => barcodeInputRef.current?.focus(), 100);
                      }}
                      variant={isScanning ? "default" : "outline"}
                      size="sm"
                      className="flex items-center space-x-2"
                      disabled={loading || !isOnline}
                    >
                      <Scan className="h-4 w-4" />
                      <span>{isScanning ? 'Scanning...' : 'Scan (F2)'}</span>
                    </Button>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 flex-wrap">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="h-8 mb-2"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                      <Card 
                        key={product.id} 
                        className={`cursor-pointer hover:shadow-md transition-shadow ${product.stock <= 0 ? 'opacity-50' : ''}`}
                        onClick={() => product.stock > 0 && addToCart(product)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl mb-2">
                            {product.image.startsWith('http') ? 
                              <img src={product.image} alt={product.name} className="w-12 h-12 mx-auto object-cover rounded" /> :
                              product.image
                            }
                          </div>
                          <h3 className="font-semibold text-sm mb-1 truncate" title={product.name}>
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                          <p className="font-bold text-blue-600">${product.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                          <p className="text-xs text-gray-300 mt-1">ID: {product.id}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="col-span-4">
            <div className="space-y-4">
              {/* Scan History */}
              {scanHistory.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Scan className="h-4 w-4" />
                        <span>Recent Scans</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearScanHistory}
                        className="h-6 px-2 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-24">
                      <div className="space-y-1">
                        {scanHistory.map((scan, index) => (
                          <div key={index} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                            <span className="font-mono">{scan.code}</span>
                            <div className="flex items-center space-x-1">
                              {scan.status === 'success' && <CheckCircle className="h-3 w-3 text-green-600" />}
                              {scan.status === 'error' && <AlertCircle className="h-3 w-3 text-red-600" />}
                              {scan.status === 'not_found' && <X className="h-3 w-3 text-orange-600" />}
                              {scan.status === 'out_of_stock' && <AlertCircle className="h-3 w-3 text-yellow-600" />}
                              {scan.status === 'processing' && <Loader className="h-3 w-3 animate-spin text-blue-600" />}
                              <span className="text-gray-500">
                                {scan.timestamp.toLocaleTimeString().slice(0, 5)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Cart */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5" />
                      <span>Order Summary</span>
                    </div>
                    <Badge variant="secondary">{cart.products?.length || 0} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-full">
                  <ScrollArea className="flex-1 mb-4">
                    {!cart.products || cart.products.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Cart is empty</p>
                        <p className="text-sm">Add products or scan barcodes</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.products.map(item => {
                          const product = products.find(p => p.id === item.product_id);
                          return (
                            <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">
                                  {product?.image?.startsWith('http') ? 
                                    <img src={product.image} alt="" className="w-8 h-8 object-cover rounded" /> :
                                    product?.image || '📦'
                                  }
                                </span>
                                <div>
                                  <h4 className="font-semibold text-sm">{product?.name || 'Unknown Product'}</h4>
                                  <p className="text-xs text-gray-500">
                                    ${(item.finalPrice || item.price).toFixed(2)} each
                                    {item.discountApplied && (
                                      <span className="text-green-600 ml-1">(${item.discountAmount.toFixed(2)} off)</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                  className="h-8 w-8 p-0"
                                  disabled={loading}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                  className="h-8 w-8 p-0"
                                  disabled={loading}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeFromCart(item.product_id)}
                                  className="h-8 w-8 p-0 ml-2"
                                  disabled={loading}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Order Totals */}
                  {cart.products && cart.products.length > 0 && (
                    <div className="space-y-4">
                      <Separator />
                      <div className="space-y-2 text-sm">
                        {cart.discountInfo?.totalDiscountAmount > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>${cart.discountInfo.totalOriginalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Discount:</span>
                              <span>-${cart.discountInfo.totalDiscountAmount.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        {cart.subtotal?.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.name}:</span>
                            <span>${item.value.toFixed(2)}</span>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span>${cart.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Payment Section */}
                      {!showPayment ? (
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            onClick={() => setShowPayment(true)}
                            disabled={cart.products.length === 0 || loading || !isOnline}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Proceed to Payment
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={clearCart}
                            disabled={loading}
                          >
                            Clear Cart
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex space-x-2">
                            <Button
                              variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPaymentMethod('CASH')}
                              className="flex-1"
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Cash
                            </Button>
                            <Button
                              variant={paymentMethod === 'CREDIT' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPaymentMethod('CREDIT')}
                              className="flex-1"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Credit
                            </Button>
                          </div>

                          {paymentMethod === 'CASH' && (
                            <div className="space-y-2">
                              <Input
                                type="number"
                                placeholder="Amount received"
                                value={customerPaid}
                                onChange={(e) => setCustomerPaid(e.target.value)}
                                className="text-lg"
                                step="0.01"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (parseFloat(customerPaid) >= cart.total) {
                                      processPayment();
                                    }
                                  }
                                }}
                              />
                              {customerPaid && (
                                <div className="text-sm">
                                  <div className="flex justify-between">
                                    <span>Change:</span>
                                    <span className="font-bold text-green-600">
                                      ${change.toFixed(2)}
                                    </span>
                                  </div>
                                  {parseFloat(customerPaid) < cart.total && (
                                    <div className="text-red-600 text-xs mt-1">
                                      Insufficient amount. Please enter at least ${cart.total.toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {paymentMethod === 'CREDIT' && (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <div className="relative">
                                  <User className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <Input
                                    type="text"
                                    placeholder="Customer Name"
                                    value={creditCustomer.name}
                                    onChange={(e) => setCreditCustomer(prev => ({...prev, name: e.target.value}))}
                                    className="pl-10"
                                    autoFocus
                                  />
                                </div>
                                <div className="relative">
                                  <Phone className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                  <Input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={creditCustomer.number}
                                    onChange={(e) => setCreditCustomer(prev => ({...prev, number: e.target.value}))}
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                              <div className="bg-orange-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 text-orange-800 text-sm">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>Credit Sale - 30 days payment term</span>
                                </div>
                                <div className="text-orange-700 text-xs mt-1">
                                  This sale will be added to the customer ledger
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button 
                              className="flex-1" 
                              onClick={processPayment}
                              disabled={loading || 
                                (paymentMethod === 'CASH' && parseFloat(customerPaid) < cart.total) ||
                                (paymentMethod === 'CREDIT' && (!creditCustomer.name.trim() || !creditCustomer.number.trim()))
                              }
                            >
                              {loading ? (
                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Receipt className="h-4 w-4 mr-2" />
                              )}
                              Complete Sale & Print
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowPayment(false);
                                setCustomerPaid('');
                                setCreditCustomer({ name: '', number: '' });
                                setPaymentMethod('CASH'); // Reset to default payment method
                              }}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Help */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Quick Help</h3>
          <div className="grid grid-cols-3 gap-4 text-xs text-blue-700">
            <div>
              <strong>Barcode Scanning:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Click Scan Barcode button</li>
                <li>• Type barcode manually or scan</li>
                <li>• Click X to cancel scanning</li>
              </ul>
            </div>
            <div>
              <strong>Product Management:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Click product to add to cart</li>
                <li>• Use +/- to adjust quantities</li>
                <li>• Search or filter by category</li>
              </ul>
            </div>
            <div>
              <strong>Payment Process:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Choose CASH or CREDIT payment</li>
                <li>• Enter amount for cash payments</li>
                <li>• Credit sales go to ledger book</li>
                <li>• Receipt prints automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSTerminal;