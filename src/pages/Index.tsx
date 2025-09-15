import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, Search, Shield, Users, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const Index = () => {
  const {
    user
  } = useAuth();
  const [trackingId, setTrackingId] = useState("MYAPP12345");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleCreateDemoTracking = async () => {
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-tracking');
      if (error) throw error;
      toast.success("Demo tracking MYAPP12345 created successfully!");
      setTrackingResult(data);
    } catch (error) {
      console.error('Error creating demo tracking:', error);
      toast.error("Failed to create demo tracking");
    } finally {
      setIsLoading(false);
    }
  };
  const handleTrackPackage = async () => {
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('track', {
        body: {
          tracking_id: trackingId
        }
      });
      if (error) throw error;
      setTrackingResult(data);
      toast.success("Tracking information fetched!");
    } catch (error) {
      console.error('Error tracking package:', error);
      toast.error("Failed to fetch tracking information");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Truck className="h-12 w-12" />
              <h1 className="text-4xl md:text-6xl font-bold">doublequick</h1>
            </div>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Track your packages in real-time with our modern delivery tracking system. 
              Fast, reliable, and always up-to-date.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button asChild variant="secondary" size="lg">
                <Link to="/track">
                  <Search className="h-5 w-5 mr-2" />
                  Track Package
                </Link>
              </Button>
              {user ? <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Link to="/dashboard">
                    <Shield className="h-5 w-5 mr-2" />
                    Dashboard
                  </Link>
                </Button> : <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Link to="/auth">
                    <Users className="h-5 w-5 mr-2" />
                    Admin Login
                  </Link>
                </Button>}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose doublequick?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience seamless package tracking with our cutting-edge technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Real-Time Tracking</CardTitle>
                <CardDescription>
                  Get instant updates on your package location and delivery status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our advanced tracking system provides accurate, real-time location data 
                  so you always know where your package is.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Fast & Reliable</CardTitle>
                <CardDescription>
                  Lightning-fast updates with 99.9% uptime reliability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built with modern technology to ensure your tracking information 
                  is always available when you need it.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your data is protected with enterprise-grade security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We use the latest security protocols to protect your personal 
                  information and tracking data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Tracking Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Test Our Tracking System</h2>
            <div className="space-y-6">
              
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Input value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="Enter tracking ID" className="flex-1" />
                <Button onClick={handleTrackPackage} disabled={isLoading || !trackingId.trim()} size="lg" className="w-full sm:w-auto">
                  {isLoading ? "Tracking..." : "Track Package"}
                </Button>
              </div>

              {trackingResult && <Card className="text-left mt-6">
                  <CardHeader>
                    <CardTitle>Tracking Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                      {JSON.stringify(trackingResult, null, 2)}
                    </pre>
                  </CardContent>
                </Card>}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Track Your Package?
            </h2>
            <p className="text-xl text-muted-foreground">
              Enter your tracking ID and get instant updates on your delivery status
            </p>
            <Button asChild variant="hero" size="lg">
              <Link to="/track">
                Start Tracking Now
              </Link>
            </Button>
            {user ? <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  Dashboard
                </Button>
              </Link> : <Link to="/auth">
                <Button variant="outline" size="lg">
                  Admin Login
                </Button>
              </Link>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Truck className="h-6 w-6" />
            <span className="font-bold text-lg">doublequick</span>
          </div>
          <p className="text-primary-foreground/80">
            © 2025 DeliveryDash. A modern delivery tracking solution.
          </p>
        </div>
      </footer>
    </div>;
};
export default Index;