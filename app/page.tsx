import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Box, Search, ArrowRight, Factory, QrCode, History, Link as LinkIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container px-6 md:px-8 mx-auto">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            <ShieldCheck className="h-20 w-20 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight">
              Digital Product Certification & Traceability System
            </h1>
            <p className="text-xl text-muted-foreground">
              Track, verify, and ensure product authenticity through blockchain-powered certification and end-to-end supply chain traceability
            </p>
            <div className="flex gap-4">
              <Link href="/auth/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline" size="lg">
                  Verify Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-6 md:px-8 mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <Factory className="h-12 w-12 text-primary mb-4" />
                <CardTitle>For Manufacturers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Register your company and certify your products with our digital certification system.
                </p>
                <Link href="/auth/register">
                  <Button className="w-full group">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <QrCode className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Product Traceability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Track complete product journey from raw materials to retail with blockchain verification.
                </p>
                <Link href="/products">
                  <Button className="w-full group">
                    Explore Products
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <History className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Supply Chain History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Access complete supply chain history and verify product authenticity instantly.
                </p>
                <Link href="/verify">
                  <Button variant="outline" className="w-full group">
                    Verify Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <LinkIcon className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Connected Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Link product data, certifications, and sustainability metrics in one place.
                </p>
                <Link href="/products">
                  <Button variant="secondary" className="w-full group">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Traceability Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-6 md:px-8 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">End-to-End Traceability</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track every step of your product's journey with complete transparency and verification
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-background">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Box className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Raw Materials</h3>
              <p className="text-muted-foreground">
                Track sourcing and origin of materials with verified sustainability credentials
              </p>
            </div>

            <div className="p-6 rounded-lg bg-background">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Factory className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manufacturing</h3>
              <p className="text-muted-foreground">
                Monitor production processes and sustainability metrics in real-time
              </p>
            </div>

            <div className="p-6 rounded-lg bg-background">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certification</h3>
              <p className="text-muted-foreground">
                Verify authenticity with blockchain-backed digital certification
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}