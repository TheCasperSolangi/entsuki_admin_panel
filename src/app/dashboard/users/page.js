"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Trash2, Pencil, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Cookies from 'js-cookie';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ username: "", email: "", password: "", user_type: "user" });

  const token = Cookies.get('token');
  const AUTH_TOKEN = token ? `Bearer ${token}` : null;

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `${AUTH_TOKEN}`,
        },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const fetchUserProfile = async (username) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}`, {
        headers: {
          Authorization: `${AUTH_TOKEN}`,
        },
      });
      const data = await res.json();
      setSelectedUser(data);
      setProfileDialog(true);
    } catch (error) {
      console.error("Error fetching user profile", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async () => {
    try {
      if (editingUser) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${editingUser._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `${AUTH_TOKEN}` },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setOpenDialog(false);
      setEditingUser(null);
      setFormData({ username: "", email: "", password: "", user_type: "user" });
      fetchUsers();
    } catch (error) {
      console.error("Error saving user", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: AUTH_TOKEN }
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setOpenDialog(true)}>Add User</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.user_type}</TableCell>
              <TableCell className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => fetchUserProfile(user.username)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => {
                    setEditingUser(user);
                    setFormData({ ...user, password: "" });
                    setOpenDialog(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(user._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit/Add User Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            {!editingUser && (
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}
            <div>
              <Label>User Type</Label>
              <select
                className="border rounded w-full p-2"
                value={formData.user_type}
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingUser ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     <Dialog open={profileDialog} onOpenChange={setProfileDialog}>
        <DialogContent className="w-full max-w-lg h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.profile_picture} alt={selectedUser.full_name} />
                  <AvatarFallback>{selectedUser.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedUser.full_name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{selectedUser.user_type}</p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="min-w-[150px]">
                    <Label className="text-xs font-medium">Username</Label>
                    <p>{selectedUser.username}</p>
                  </div>
                  <div className="min-w-[150px]">
                    <Label className="text-xs font-medium">Email</Label>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div className="min-w-[150px]">
                    <Label className="text-xs font-medium">Phone</Label>
                    <p>{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div className="min-w-[150px]">
                    <Label className="text-xs font-medium">Gender</Label>
                    <p>{selectedUser.gender || 'N/A'}</p>
                  </div>
                  <div className="min-w-[150px]">
                    <Label className="text-xs font-medium">Birthday</Label>
                    <p>{selectedUser.birthday || 'N/A'}</p>
                  </div>
                  <div className="min-w-[150px]">
                    <Label className="text-xs font-medium">Wallet Balance</Label>
                    <p>${selectedUser.wallet_balance?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="min-w-[150px]">
                    <Label className="text-xs font-medium">Reward Points</Label>
                    <p>{selectedUser.reward_points || 0}</p>
                  </div>
                  <div className="min-w-[150px]">
                    <Label className="text-xs font-medium">Verified</Label>
                    <p>{selectedUser.is_verified ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium">Addresses</Label>
                  {selectedUser.addresses?.length > 0 ? (
                    selectedUser.addresses.map((address) => (
                      <div key={address._id} className="mt-2 p-2 bg-muted rounded-md">
                        <p className="font-medium text-sm">{address.field}</p>
                        <p className="text-sm">{address.full_address}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm">No addresses available</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-medium">Saved Cards</Label>
                  {selectedUser.saved_cards?.length > 0 ? (
                    selectedUser.saved_cards.map((card, index) => (
                      <div key={index} className="mt-2 p-2 bg-muted rounded-md">
                        <p className="font-medium text-sm">{card.cardholder_name}</p>
                        <p className="text-sm">**** **** **** {card.card_number.slice(-4)}</p>
                        <p className="text-sm">Expires: {card.expiry}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm">No saved cards</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-medium">Notification Preferences</Label>
                  <p className="text-sm">{selectedUser.notification_preferences?.join(', ') || 'None'}</p>
                </div>
              </CardContent>
            </Card>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}