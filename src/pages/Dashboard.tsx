import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Plus, LogOut, Edit, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Shipment {
  id: string;
  status: string;
  location: string;
  coordinates: any;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    status: 'Pending',
    location: '',
  });
  const { toast } = useToast();

  const statusOptions = ['Pending', 'In Transit', 'Delivered', 'Delayed'];

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shipments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('shipments')
          .update({
            status: formData.status,
            location: formData.location,
          })
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Shipment updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('shipments')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Shipment created successfully",
        });
      }

      setFormData({ id: '', status: 'Pending', location: '' });
      setShowForm(false);
      setEditingId(null);
      fetchShipments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save shipment",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (shipment: Shipment) => {
    setFormData({
      id: shipment.id,
      status: shipment.status,
      location: shipment.location,
    });
    setEditingId(shipment.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipment?')) return;

    try {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      });
      
      fetchShipments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete shipment",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">
                  {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.email}
                  {isAdmin && <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">Admin</span>}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{shipments.length}</div>
                <p className="text-xs text-muted-foreground">Total Shipments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-status-in-transit">
                  {shipments.filter(s => s.status === 'In Transit').length}
                </div>
                <p className="text-xs text-muted-foreground">In Transit</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-status-delivered">
                  {shipments.filter(s => s.status === 'Delivered').length}
                </div>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-status-pending">
                  {shipments.filter(s => s.status === 'Pending').length}
                </div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shipments</CardTitle>
                  <CardDescription>
                    {isAdmin ? 'Manage all shipments in the system' : 'Manage all your shipments'}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {showForm ? 'Cancel' : 'Add Shipment'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>
                      {editingId ? 'Edit Shipment' : 'Add New Shipment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {!editingId && (
                        <div className="space-y-2">
                          <Label htmlFor="id">Tracking ID</Label>
                          <Input
                            id="id"
                            placeholder="e.g., ABC123"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            required
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="e.g., Lagos, Nigeria"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          {editingId ? 'Update' : 'Create'} Shipment
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowForm(false);
                            setEditingId(null);
                            setFormData({ id: '', status: 'Pending', location: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {loading ? (
                <div className="text-center py-8">Loading shipments...</div>
              ) : shipments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No shipments found. Create your first shipment above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">{shipment.id}</TableCell>
                        <TableCell>
                          <StatusBadge status={shipment.status} />
                        </TableCell>
                        <TableCell>{shipment.location}</TableCell>
                        <TableCell>{formatDate(shipment.created_at)}</TableCell>
                        <TableCell>{formatDate(shipment.updated_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(shipment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(shipment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;