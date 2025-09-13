import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Search, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Shipment {
  id: string;
  status: string;
  location: string;
  coordinates: any;
  created_at: string;
  updated_at: string;
}

const Track = () => {
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      // Use the edge function for tracking
      const { data, error } = await supabase.functions.invoke('track-shipment', {
        body: { tracking_id: trackingId.trim() }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to search for shipment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data && !data.error) {
        setShipment(data);
        toast({
          title: "Shipment Found",
          description: `Tracking successful for ID: ${trackingId}`,
        });
      } else {
        setShipment(null);
        toast({
          title: "Not Found",
          description: `No shipment found with tracking ID: ${trackingId}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setShipment(null);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex items-center justify-center gap-2">
              <Truck className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Track Your Package</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Enter your tracking ID to get real-time updates on your shipment
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Track Package
              </CardTitle>
              <CardDescription>
                Enter your tracking ID (e.g., ABC123, XYZ789)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="flex gap-2">
                <Input
                  placeholder="Enter tracking ID..."
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Searching...' : 'Track'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {searched && shipment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Shipment Details</span>
                  <StatusBadge status={shipment.status} />
                </CardTitle>
                <CardDescription>
                  Tracking ID: {shipment.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Current Location</p>
                    <p className="text-muted-foreground">{shipment.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-muted-foreground">{formatDate(shipment.updated_at)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Created</p>
                      <p>{formatDate(shipment.created_at)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Status</p>
                      <StatusBadge status={shipment.status} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {searched && !shipment && !loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold">No shipment found</h3>
                  <p className="text-muted-foreground">
                    Please check your tracking ID and try again
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Try sample tracking IDs: ABC123, XYZ789, DEF456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Track;