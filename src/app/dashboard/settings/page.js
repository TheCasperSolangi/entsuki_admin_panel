"use client"
import React, { useState, useEffect } from 'react';
import { 
  User, MapPin, CreditCard, Wallet, Gift, Settings, Save, Plus, 
  Edit3, Trash2, Phone, Mail, Calendar, Globe, Bell, Shield,
  Camera, Eye, EyeOff
} from 'lucide-react';

const ProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userInfo, setUserInfo] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState({});

  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    birthday: '',
    gender: '',
    language: '',
    currency: '',
    timezone: '',
    accept_marketing: false,
    notification_preferences: []
  });

  const [addressForm, setAddressForm] = useState({
    field: '',
    address1: '',
    address2: '',
    country: '',
    city: '',
    state: '',
    postal_code: ''
  });

  const [cardForm, setCardForm] = useState({
    card_number: '',
    expiry: '',
    cvv: '',
    cardholder_name: ''
  });

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.entsuki.com'}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user info
        const userData = await apiCall('/auth/me');
        setUserInfo(userData);
        setProfileForm({
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          birthday: userData.birthday || '',
          gender: userData.gender || '',
          language: userData.language || '',
          currency: userData.currency || '',
          timezone: userData.timezone || '',
          accept_marketing: userData.accept_marketing || false,
          notification_preferences: userData.notification_preferences || []
        });

        // Fetch addresses
        const addressData = await apiCall(`/users/${userData.username}/addresses`);
        setAddresses(addressData);

        // Fetch payment methods
        const paymentData = await apiCall(`/users/${userData.username}/payment-methods`);
        setPaymentMethods(paymentData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update profile
  const handleUpdateProfile = async () => {
    if (!userInfo) return;
    
    try {
      setSaving(true);
      await apiCall(`/users/${userInfo.username}`, {
        method: 'PUT',
        body: JSON.stringify(profileForm)
      });
      
      // Update local state
      setUserInfo(prev => ({ ...prev, ...profileForm }));
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Address operations
  const handleAddAddress = async () => {
    if (!userInfo) return;
    
    try {
      const newAddresses = await apiCall(`/users/${userInfo.username}/addresses`, {
        method: 'POST',
        body: JSON.stringify(addressForm)
      });
      setAddresses(newAddresses);
      setShowAddAddress(false);
      setAddressForm({
        field: '',
        address1: '',
        address2: '',
        country: '',
        city: '',
        state: '',
        postal_code: ''
      });
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address');
    }
  };

  const handleUpdateAddress = async (index) => {
    if (!userInfo) return;
    
    try {
      const updatedAddresses = await apiCall(`/users/${userInfo.username}/addresses/${index}`, {
        method: 'PUT',
        body: JSON.stringify(addressForm)
      });
      setAddresses(updatedAddresses);
      setEditingAddress(null);
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address');
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!userInfo || !confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const updatedAddresses = await apiCall(`/users/${userInfo.username}/addresses/${index}`, {
        method: 'DELETE'
      });
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  // Payment method operations
  const handleAddCard = async () => {
    if (!userInfo) return;
    
    try {
      const newCards = await apiCall(`/users/${userInfo.username}/payment-methods`, {
        method: 'POST',
        body: JSON.stringify(cardForm)
      });
      setPaymentMethods(newCards);
      setShowAddCard(false);
      setCardForm({
        card_number: '',
        expiry: '',
        cvv: '',
        cardholder_name: ''
      });
    } catch (error) {
      console.error('Error adding card:', error);
      alert('Failed to add card');
    }
  };

  const handleDeleteCard = async (cardCode) => {
    if (!userInfo || !confirm('Are you sure you want to delete this card?')) return;
    
    try {
      const updatedCards = await apiCall(`/users/${userInfo.username}/payment-methods/${cardCode}`, {
        method: 'DELETE'
      });
      setPaymentMethods(updatedCards);
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
   
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={userInfo?.profile_picture || '/api/placeholder/80/80'}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
                <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5 hover:bg-blue-700 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{userInfo?.full_name || 'User Profile'}</h1>
                <p className="text-gray-600">@{userInfo?.username}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    {userInfo?.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className="text-sm text-gray-500">{userInfo?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                <input
                  type="date"
                  value={profileForm.birthday}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, birthday: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <input
                  type="text"
                  value={profileForm.language}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, language: e.target.value }))}
                  placeholder="e.g., English, Spanish"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <input
                  type="text"
                  value={profileForm.currency}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, currency: e.target.value }))}
                  placeholder="e.g., USD, EUR"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profileForm.accept_marketing}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, accept_marketing: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Accept marketing communications</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No addresses saved yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {addresses.map((address, index) => (
                    <div key={address._id || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">{address.field}</h3>
                          <p className="text-gray-600 mt-1">{address.full_address}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingAddress(index);
                              setAddressForm(address);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Address Form Modal */}
            {(showAddAddress || editingAddress !== null) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingAddress !== null ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                        <select
                          value={addressForm.field}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, field: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Type</option>
                          <option value="home">Home</option>
                          <option value="office">Office</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                        <input
                          type="text"
                          value={addressForm.address1}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, address1: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={addressForm.address2}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, address2: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            type="text"
                            value={addressForm.country}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                          <input
                            type="number"
                            value={addressForm.postal_code}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => {
                          if (editingAddress !== null) {
                            handleUpdateAddress(editingAddress);
                          } else {
                            handleAddAddress();
                          }
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {editingAddress !== null ? 'Update' : 'Add'} Address
                      </button>
                      <button
                        onClick={() => {
                          setShowAddAddress(false);
                          setEditingAddress(null);
                          setAddressForm({
                            field: '',
                            address1: '',
                            address2: '',
                            country: '',
                            city: '',
                            state: '',
                            postal_code: ''
                          });
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
              <button
                onClick={() => setShowAddCard(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </button>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No payment methods saved yet</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {paymentMethods.map((card) => (
                  <div key={card.card_code} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{card.cardholder_name}</p>
                          <p className="text-gray-600">**** **** **** {card.card_number?.slice(-4)}</p>
                          <p className="text-sm text-gray-500">Expires {card.expiry}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCard(card.card_code)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Card Modal */}
            {showAddCard && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Card</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardForm.cardholder_name}
                          onChange={(e) => setCardForm(prev => ({ ...prev, cardholder_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardForm.card_number}
                          onChange={(e) => setCardForm(prev => ({ ...prev, card_number: e.target.value }))}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={cardForm.expiry}
                            onChange={(e) => setCardForm(prev => ({ ...prev, expiry: e.target.value }))}
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <input
                            type="text"
                            value={cardForm.cvv}
                            onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value }))}
                            placeholder="123"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={handleAddCard}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Add Card
                      </button>
                      <button
                        onClick={() => {
                          setShowAddCard(false);
                          setCardForm({
                            card_number: '',
                            expiry: '',
                            cvv: '',
                            cardholder_name: ''
                          });
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Wallet Balance</h3>
                  <p className="text-3xl font-bold mt-2">
                    ${userInfo?.wallet_balance?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-blue-100 mt-1">{userInfo?.currency || 'USD'}</p>
                </div>
                <Wallet className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>

            {/* Rewards Points Card */}
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Reward Points</h3>
                  <p className="text-3xl font-bold mt-2">
                    {userInfo?.reward_points?.toLocaleString() || '0'}
                  </p>
                  <p className="text-green-100 mt-1">Points available</p>
                </div>
                <Gift className="w-12 h-12 text-white opacity-80" />
              </div>
              
              {userInfo?.reward_points > 0 && (
                <div className="mt-4">
                  <button 
                    onClick={() => {
                      const points = prompt('Enter points to redeem (minimum varies by store settings):');
                      if (points && !isNaN(points) && parseInt(points) > 0) {
                        handleRedeemPoints(parseInt(points));
                      }
                    }}
                    className="bg-black hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                  >
                    Redeem Points
                  </button>
                </div>
              )}
            </div>

            {/* Wallet Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Phone Verification</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {userInfo?.is_phone_verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Email Verification</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {userInfo?.is_verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Wallet Activity</h3>
              <div className="text-center py-8 text-gray-500">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent wallet activity</p>
                <p className="text-sm mt-1">Your transactions will appear here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Helper function to handle reward points redemption
  async function handleRedeemPoints(points) {
    if (!userInfo) return;
    
    try {
      const response = await apiCall(`/api/users/${userInfo.username}/redeem`, {
        method: 'POST',
        body: JSON.stringify({ amount: points })
      });
      
      // Update local state
      setUserInfo(prev => ({
        ...prev,
        reward_points: response.remaining_points,
        wallet_balance: response.wallet_balance
      }));
      
      alert(response.message);
    } catch (error) {
      console.error('Error redeeming points:', error);
      alert('Failed to redeem points. Please check the minimum redemption amount.');
    }
  }
};

export default ProfileManagement;