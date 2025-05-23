"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Shield } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

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
import { Session } from "@supabase/supabase-js";
import { supabase as supabaseClient } from "@/lib/supabase/client";

export default function SetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // URL'den token ve type parametrelerini al
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    // URL'deki hash parametrelerini kontrol et
    const getHashParams = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const email = params.get('email');
        
        if (access_token) {
          setAccessToken(access_token);
          // Oturumu ayarla
          supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || "",
          });
        }
        
        if (email) {
          setEmail(email);
        }
      }
    };
    
    getHashParams();
    
    // E-posta parametresi varsa kaydet
    if (emailParam) {
      setEmail(emailParam);
    }

    // Token ve type varsa, şifre sıfırlama modunda olduğumuzu belirt
    if (token && type) {
      setIsResetMode(true);
    }
  }, [token, type, emailParam, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Şifreler eşleşmiyor",
        description: "Lütfen şifrelerin aynı olduğundan emin olun.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      let emailToUse = email;
      
      // URL'den hash parametrelerini al
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const type = params.get('type');
        
        if (access_token && refresh_token && type === 'invite') {
          try {
            // Önce oturumu ayarla
            const { error: sessionError } = await supabaseClient.auth.setSession({
              access_token,
              refresh_token
            });

            if (sessionError) {
              throw sessionError;
            }

            // Oturumun ayarlandığından emin ol
            const { data: { session }, error: getSessionError } = await supabaseClient.auth.getSession();
            
            if (getSessionError) {
              throw getSessionError;
            }

            if (!session) {
              throw new Error('Oturum bulunamadı');
            }
            
            // Şifre güncelleme
            const { error: updateError } = await supabaseClient.auth.updateUser({
              password
            });
            
            if (updateError) {
              throw updateError;
            }
            
            toast({
              title: "Başarılı",
              description: "Şifreniz başarıyla güncellendi.",
              variant: "default"
            });
            
            // Başarılı olduktan sonra dashboard'a yönlendir
            window.location.href = "http://localhost:3000/dashboard";
            return;
          } catch (err: any) {
            throw new Error(err.message || 'Şifre güncellenirken bir hata oluştu');
          }
        }
      }
      
      // Eğer hash parametreleri yoksa, normal akışa devam et
      // Eğer token ve type varsa, OTP doğrulama yap
      if (token && type) {
        // Eğer email yoksa, oturumdan almaya çalış
        if (!emailToUse) {
          const { data: session } = await supabase.auth.getSession();
          if (session?.session?.user?.email) {
            emailToUse = session.session.user.email;
          } else {
            toast({
              title: "Hata",
              description: "Kullanıcı e-postası bulunamadı.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
        }

        // OTP doğrulama
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token,
          type: type as any,
          email: emailToUse
        });

        if (verifyError) {
          toast({
            title: "Doğrulama Hatası",
            description: verifyError.message,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      // Şifre güncelleme
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });

      if (updateError) {
        toast({
          title: "Şifre Güncelleme Hatası",
          description: updateError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Başarılı",
        description: "Şifreniz başarıyla güncellendi.",
        variant: "default"
      });

      // Başarılı olduktan sonra dashboard'a yönlendir
      window.location.href = "http://localhost:3000/dashboard";
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Bir hata oluştu.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="flex flex-col items-center text-center mb-10">
        <Shield className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz</h1>
        <p className="text-muted-foreground">
          UseSafe platformunun Dijital Ürün Sertifikası sistemine katılın
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Şifrenizi Belirleyin</CardTitle>
          <CardDescription>
            {email ? `${email} hesabınız için şifrenizi belirleyin` : "Hesabınızı oluşturmak için şifrenizi belirleyin"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          {!email && isResetMode && (
            <CardContent className="pt-0">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresinizi girin"
                  required
                />
              </div>
            </CardContent>
          )}
          
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
                minLength={8}
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
                minLength={8}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "İşleniyor..." : "Şifreyi Oluştur"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
