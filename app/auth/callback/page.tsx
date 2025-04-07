"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getHashParams } from "@/lib/utils";

function CallbackContent() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [hashParams, setHashParams] = useState<Record<string, string>>({});
  
  // Token hash ve type parametrelerini URL'den al
  // const tokenHash = searchParams.get("token_hash");
  // const type = searchParams.get("type");
  // const next = searchParams.get("next") || "/dashboard";
  
  // Extract hash parameters from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = getHashParams();
      if (Object.keys(params).length > 0) {
        setHashParams(params);
        
        // Handle Supabase auth if access_token is present in hash params
        if (params.access_token) {
          // The presence of access_token in hash indicates a successful auth
          handleSuccessfulAuth(params);
        }
      }
    }
  }, []);
  
  // Handle successful authentication
  const handleSuccessfulAuth = async (params: Record<string, string>) => {
    try {
      setLoading(true);
      
      // You can directly use the session data from the hash
      // or you can ask Supabase to set the session using the token
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        toast({
          title: "Oturum hatası",
          description: "Oturum bilgileri alınamadı: " + error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Optional: if you need to get user data
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user?.user_metadata) {
        setCompanyInfo(userData.user.user_metadata);
      }

      setLoading(false);

      router.push(hashParams.next);
      
      // If this is an invite flow (as indicated by type=invite in hash)
      // if (params.type === 'invite') {
      //   // Stay on this page to let the user set password if needed
      //   // or implement any other invite-specific logic
      // } else {
      //   // For regular sign-in, redirect to the next page
      //   router.push(hashParams.next);
      // }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Hata",
        description: "Oturum işlemi sırasında bir hata oluştu.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  // Şirket bilgilerini getir
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (hashParams.tokenHash && hashParams.type) {
        try {
          // Burada token hash kullanarak davet eden firma bilgilerini alabilirsiniz
          // Örnek olarak, doğrulama işlemini gerçekleştiriyoruz ama henüz şifre belirlemiyoruz
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            // Kullanıcı henüz doğrulanmamış, bu normal
            console.log("Kullanıcı henüz doğrulanmamış:", error);
            return;
          }
          
          if (data?.user?.user_metadata) {
            setCompanyInfo(data.user.user_metadata);
          }
        } catch (error) {
          console.error("Kullanıcı bilgileri alınamadı:", error);
        }
      }
    };
    
    fetchUserInfo();
  }, [hashParams.tokenHash, hashParams.type, supabase]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Hata",
        description: "Şifreler eşleşmiyor. Lütfen kontrol ediniz.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // We can use either tokenHash from query params or access_token from hash
      if (hashParams.tokenHash && hashParams.type) {
        // Handle the URL with query parameters (classic flow)
        const { data, error } = await supabase.auth.updateUser({
          password: password
        });
        
        if (error) {
          toast({
            title: "Şifre güncellenemedi",
            description: error.message,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        toast({
          title: "Şifre güncellendi",
          description: "Şifreniz başarıyla güncellendi!",
        });
        
        // Redirect to dashboard or the page specified in "next" parameter
        router.push(hashParams.next);
      } 
      else if (hashParams.access_token) {
        // Handle the URL with hash parameters
        // First, set the session manually using the access token
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: hashParams.access_token,
          refresh_token: hashParams.refresh_token || '',
        });
        
        if (sessionError) {
          toast({
            title: "Oturum hatası",
            description: sessionError.message,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Then update the password
        const { data, error } = await supabase.auth.updateUser({
          password: password
        });
        
        if (error) {
          toast({
            title: "Şifre güncellenemedi",
            description: error.message,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        toast({
          title: "Şifre güncellendi",
          description: "Şifreniz başarıyla güncellendi!",
        });
        
        // Redirect to dashboard or the page specified in "next" parameter
        router.push(hashParams.next);
      }
      else {
        toast({
          title: "Geçersiz işlem",
          description: "Doğrulama veya oturum bilgileri bulunamadı.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!hashParams.tokenHash || !hashParams.type) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geçersiz Bağlantı</CardTitle>
          <CardDescription>
            Bu davet bağlantısı geçersiz veya süresi dolmuş görünüyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Lütfen geçerli bir davet bağlantısı kullanın veya sistem yöneticinizle iletişime geçin.
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hesabınızı Oluşturun</CardTitle>
        <CardDescription>
          {companyInfo?.company_name ? (
            <>
              <span className="font-semibold">{companyInfo.company_name}</span> tarafından
              <span className="text-primary font-medium"> üretici olarak</span> davet edildiniz
            </>
          ) : (
            "Şifrenizi belirleyerek hesabınızı oluşturun"
          )}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrenizi belirleyin"
              required
              tabIndex={0}
              aria-label="Şifrenizi belirleyin"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifrenizi tekrar girin"
              required
              tabIndex={0}
              aria-label="Şifrenizi tekrar girin"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Zaten bir hesabınız var mı?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Giriş Yap
            </Link>
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            tabIndex={0}
            aria-label="Hesabı oluştur"
          >
            {loading ? "İşleniyor..." : "Hesabı Oluştur"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function AuthCallback() {
  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <Shield className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz</h1>
        <p className="text-muted-foreground">
          UseSafe platformunun Dijital Ürün Sertifikası sistemine katılın
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Yükleniyor...</CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
} 