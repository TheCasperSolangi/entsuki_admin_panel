"use client"
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const QnAManagement = () => {
  const [qnas, setQnas] = useState([]);
  const [filteredQnas, setFilteredQnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [answerFilter, setAnswerFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('');
  const [selectedQnA, setSelectedQnA] = useState(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [notification, setNotification] = useState(null);

  const baseURL = 'https://api.entsuki.com/api/qna';

  // Fetch all QnAs
  const fetchQnAs = async () => {
    try {
      setLoading(true);
      const response = await fetch(baseURL);
      const data = await response.json();
      setQnas(data);
      setFilteredQnas(data);
    } catch (error) {
      showNotification('Failed to fetch QnAs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQnAs();
  }, []);

  // Filter QnAs based on search and filters
  useEffect(() => {
    let filtered = qnas;

    if (searchTerm) {
      filtered = filtered.filter(qna => 
        qna.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qna.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qna.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qna.question_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(qna => qna.status === statusFilter);
    }

    if (answerFilter !== 'all') {
      if (answerFilter === 'answered') {
        filtered = filtered.filter(qna => qna.answer && qna.answer.trim() !== '');
      } else if (answerFilter === 'unanswered') {
        filtered = filtered.filter(qna => !qna.answer || qna.answer.trim() === '');
      }
    }

    if (productFilter) {
      filtered = filtered.filter(qna => 
        qna.product_code.toLowerCase().includes(productFilter.toLowerCase())
      );
    }

    setFilteredQnas(filtered);
  }, [qnas, searchTerm, statusFilter, answerFilter, productFilter]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Answer a question
  const handleAnswerQuestion = async () => {
    if (!answerText.trim()) return;

    try {
      const response = await fetch(`${baseURL}/${selectedQnA._id}/answer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: answerText }),
      });

      if (response.ok) {
        await fetchQnAs();
        setShowAnswerModal(false);
        setAnswerText('');
        setSelectedQnA(null);
        showNotification('Answer added successfully!');
      } else {
        showNotification('Failed to add answer', 'error');
      }
    } catch (error) {
      showNotification('Error adding answer', 'error');
    }
  };

  // Close answer modal
  const closeAnswerModal = () => {
    setShowAnswerModal(false);
    setSelectedQnA(null);
    setAnswerText('');
  };

  // Update QnA status
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`${baseURL}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchQnAs();
        showNotification(`QnA ${newStatus === 'visible' ? 'shown' : 'hidden'} successfully!`);
      } else {
        showNotification('Failed to update status', 'error');
      }
    } catch (error) {
      showNotification('Error updating status', 'error');
    }
  };

  // Delete QnA
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this QnA?')) return;

    try {
      const response = await fetch(`${baseURL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchQnAs();
        showNotification('QnA deleted successfully!');
      } else {
        showNotification('Failed to delete QnA', 'error');
      }
    } catch (error) {
      showNotification('Error deleting QnA', 'error');
    }
  };

  // Get unique product codes for filter
  const uniqueProducts = [...new Set(qnas.map(qna => qna.product_code))];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QnA Management</h1>
            <p className="text-gray-600 mt-1">Manage customer questions and answers</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Total QnAs: <span className="font-semibold text-gray-900">{qnas.length}</span>
            </div>
            <div className="text-sm text-gray-500">
              Unanswered: <span className="font-semibold text-red-600">
                {qnas.filter(q => !q.answer || q.answer.trim() === '').length}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions, answers, or codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          <select
            value={answerFilter}
            onChange={(e) => setAnswerFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Questions</option>
            <option value="answered">Answered</option>
            <option value="unanswered">Unanswered</option>
          </select>

          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Products</option>
            {uniqueProducts.map(product => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>
        </div>
      </div>

      {/* QnA List */}
      <div className="space-y-4">
        {filteredQnas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No QnAs found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredQnas.map((qna) => (
            <div key={qna._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {qna.product_code}
                      </span>
                      <span className="text-sm text-gray-500">{qna.question_code}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        qna.status === 'visible' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {qna.status === 'visible' ? <Eye size={12} className="mr-1" /> : <EyeOff size={12} className="mr-1" />}
                        {qna.status}
                      </span>
                      {(!qna.answer || qna.answer.trim() === '') && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Unanswered
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{qna.question}</h3>
                    {qna.answer && qna.answer.trim() !== '' && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-gray-700 font-medium mb-1">Answer:</p>
                        <p className="text-gray-600">{qna.answer}</p>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      Created: {formatDate(qna.createdAt)}
                      {qna.updatedAt !== qna.createdAt && (
                        <span className="ml-4">Updated: {formatDate(qna.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedQnA(qna);
                        setAnswerText(qna.answer || '');
                        setShowAnswerModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Answer Question"
                    >
                      <Edit2 size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate(qna._id, qna.status === 'visible' ? 'hidden' : 'visible')}
                      className={`p-2 rounded-lg transition-colors ${
                        qna.status === 'visible' 
                          ? 'text-gray-600 hover:bg-gray-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={qna.status === 'visible' ? 'Hide QnA' : 'Show QnA'}
                    >
                      {qna.status === 'visible' ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(qna._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete QnA"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Answer Dialog with shadcn */}
      <Dialog open={showAnswerModal} onOpenChange={setShowAnswerModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedQnA?.answer && selectedQnA.answer.trim() !== '' ? 'Edit Answer' : 'Add Answer'}
            </DialogTitle>
            <DialogDescription>
              Provide a helpful answer to the customer question.
            </DialogDescription>
          </DialogHeader>
          
          {selectedQnA && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="question" className="text-base font-medium">Question</Label>
                <div className="mt-2 bg-muted/50 p-4 rounded-lg border">
                  <p className="text-sm text-foreground mb-2">{selectedQnA.question}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {selectedQnA.product_code}
                    </span>
                    <span>{selectedQnA.question_code}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="answer" className="text-base font-medium">Answer</Label>
                <Textarea
                  id="answer"
                  placeholder="Enter your answer here..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={6}
                  className="mt-2 resize-vertical"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeAnswerModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleAnswerQuestion} 
              disabled={!answerText.trim()}
            >
              Save Answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QnAManagement;