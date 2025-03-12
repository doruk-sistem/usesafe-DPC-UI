"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

function ApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // URL'den confirmation_url parametresini al
  const confirmationURL = searchParams.get("confirmation_url");
  
  if (!confirmationURL) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            Geçersiz Doğrulama Bağlantısı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Bu bağlantı geçersiz veya eksik görünüyor. Lütfen e-postanızdaki orijinal bağlantıyı kullanın.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => router.push("/")} 
            variant="outline"
            tabIndex={0}
            aria-label="Ana sayfaya dön"
          >
            Ana Sayfaya Dön
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const handleConfirmation = () => {
    setLoading(true);
    
    try {
      // Güvenlik önlemi: doğrulama URL'si Supabase domain'inden gelmiyor mu kontrolü
      const url = new URL(decodeURIComponent(confirmationURL));
      
      if (!url.hostname.includes("supabase.co")) {
        toast({
          title: "Güvenlik Uyarısı",
          description: "Geçersiz doğrulama bağlantısı.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Kullanıcıyı gerçek doğrulama URL'sine yönlendir
      window.location.href = decodeURIComponent(confirmationURL);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Doğrulama işlemi sırasında bir hata oluştu.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>E-posta Doğrulama</CardTitle>
        <CardDescription>
          Hesabınızı aktifleştirmek için e-posta adresinizi doğrulayın
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          UseSafe platformuna hoş geldiniz. Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekmektedir.
        </p>
        
        <Button 
          onClick={handleConfirmation} 
          disabled={loading}
          className="w-full"
          tabIndex={0}
          aria-label="E-postamı doğrula"
        >
          {loading ? "İşleniyor..." : "E-postamı Doğrula"}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Zaten bir hesabınız var mı?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Giriş Yap
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ApprovalPage() {
  return (
    <div className="flex h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <ApprovalContent />
        </Suspense>
      </div>
    </div>
  );
} 