import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Factory, Search, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            <ShieldCheck className="h-20 w-20 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight">
              Digital Product Certification System
            </h1>
            <p className="text-xl text-muted-foreground">
              Ensuring product authenticity and sustainability through blockchain-powered certification
            </p>
            <div className="flex gap-4">
              <Link href="/manufacturer/register">
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
        <div className="container px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <Factory className="h-12 w-12 text-primary mb-4" />
                <CardTitle>For Manufacturers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Register your company and certify your products with our digital certification system.
                </p>
                <Link href="/manufacturer/register">
                  <Button className="w-full group">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <Search className="h-12 w-12 text-primary mb-4" />
                <CardTitle>For Consumers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Verify product authenticity and access detailed product information instantly.
                </p>
                <Link href="/verify">
                  <Button variant="outline" className="w-full group">
                    Verify Product
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Blockchain Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Immutable and transparent product certification powered by blockchain technology.
                </p>
                <Link href="/about">
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
    </div>
  );
}