'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Search, ArrowRight, Clock, DollarSign, Phone, User, Hash } from 'lucide-react';

export default function TransactionVerification() {
  const [transactionId, setTransactionId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const router = useRouter();
  const params = useParams();

  const verifyTransaction = async (id) => {
    setIsLoading(true);
    setError(null);
    setVerificationStatus(null);
    setShowResult(false);

    try {
      const response = await fetch(`https://api.entsuki.com/api/ledgers/transactions/by-code/${id}`);
      const data = await response.json();

      if (data.success) {
        setVerificationStatus({
          success: true,
          data: data.data
        });
      } else {
        setVerificationStatus({
          success: false
        });
      }
      
      // Delay to show result animation
      setTimeout(() => setShowResult(true), 100);
    } catch (err) {
      setError('Failed to verify transaction. Please try again.');
      setTimeout(() => setShowResult(true), 100);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.transaction_id) {
      setTransactionId(params.transaction_id);
      verifyTransaction(params.transaction_id);
    }
  }, [params.transaction_id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (transactionId) {
     
      verifyTransaction(transactionId);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="w-5 h-5 text-blue-600 animate-pulse" />
        </div>
      </div>
    </div>
  );

  const TransactionDetails = ({ data }) => (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
          <Hash className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">Transaction ID</p>
            <p className="text-sm font-mono text-gray-900">{data.transaction_id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
          <User className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">Full Name</p>
            <p className="text-sm text-gray-900">{data.full_name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">Amount Paid</p>
            <p className="text-lg font-semibold text-emerald-600">${data.amount_paid}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
          <Clock className="w-4 h-4 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">Payment Method</p>
            <p className="text-sm text-gray-900">{data.paid_with}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100">
          <Phone className="w-4 h-4 text-orange-600" />
          <div>
            <p className="text-sm font-medium text-gray-600">Mobile Number</p>
            <p className="text-sm font-mono text-gray-900">{data.mobile_number}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Verification</h1>
          <p className="text-gray-600">Verify your transaction status quickly and securely</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-8 duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="w-5 h-5 text-blue-600" />
              Verify Transaction
            </CardTitle>
            <CardDescription>Enter your transaction number to check its status</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="Enter transaction number (e.g., TXN123456)"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-lg border-2 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 group-hover:border-gray-400"
                />
                <Hash className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500" />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || !transactionId} 
                className="w-full py-3 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Verify Transaction
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
            </form>

            {/* Loading State */}
            {isLoading && (
              <div className="animate-in fade-in-0 duration-300">
                <LoadingSpinner />
                <p className="text-center text-sm text-gray-600 mt-4 animate-pulse">
                  Searching for your transaction...
                </p>
              </div>
            )}

            {/* Error Alert */}
            {error && showResult && (
              <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Verification Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Results */}
            {verificationStatus && showResult && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-6 duration-400">
                {verificationStatus.success ? (
                  <div className="space-y-4">
                    <Alert variant="default" className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <AlertTitle className="text-green-800">Verification Successful!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Your transaction has been found and verified.
                      </AlertDescription>
                    </Alert>
                    
                    <Card className="border border-green-200 bg-green-50/50">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Transaction Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TransactionDetails data={verificationStatus.data} />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Alert variant="destructive" className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300 border-red-200 bg-red-50">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <AlertTitle className="text-red-800">Transaction Not Found</AlertTitle>
                    <AlertDescription className="text-red-700">
                      No transaction found with the provided ID. Please check your transaction number and try again.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 animate-in fade-in-0 delay-700 duration-500">
          <p className="text-sm text-gray-500">
            Having trouble? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}