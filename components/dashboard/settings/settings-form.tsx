"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { useUsers } from "@/lib/hooks/use-users";
import { Skeleton } from "@/components/ui/skeleton";

const settingsSchema = z.object({
  // Company Information (Read-only)
  companyName: z.string().min(2),
  taxId: z.string().min(10),
  tradeRegisterNumber: z.string().optional(),
  mersisNumber: z.string().optional(),

  // Contact Information
  email: z.string().email(),
  phone: z.string().min(10),
  fax: z.string().optional(),
  website: z.string().url().optional(),

  // Address Information
  headquarters: z.string().min(10),
  factoryAddress: z.string().optional(),
  branchAddresses: z.string().optional(),

  // Authorized Person
  authorizedName: z.string().min(2),
  authorizedTitle: z.string().min(2),
  authorizedDepartment: z.string().min(2),
  authorizedEmail: z.string().email(),
  authorizedPhone: z.string().min(10),

  // Notification Preferences
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  systemAlerts: z.boolean(),
  documentReminders: z.boolean(),
  certificationAlerts: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const { toast } = useToast();
  const t = useTranslations("settings");
  const { canManageUsers, company, isCompanyLoading } = useAuth();
  const { users, invitations, loading, inviting, deleting, fetchUsers, inviteUser, deleteUser, updateInvitationStatus, deleteInvitation } = useUsers();
  const [inviteFormData, setInviteFormData] = useState({ full_name: "", email: "", role: "user" });
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Kullanıcı rolü için badge rengi belirleme
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'admin':
        return 'bg-red-100 text-red-800'; // Sistem yöneticisi
      case 'company_admin':
        return 'bg-green-100 text-green-800'; // Şirket yöneticisi
      case 'manufacturer':
        return 'bg-purple-100 text-purple-800'; // Şirket kurucusu
      case 'user':
      default:
        return 'bg-blue-100 text-blue-800'; // Normal kullanıcı
    }
  };
  
  // Kullanıcı rolü için görüntülenecek isim
  const getRoleDisplayName = (role: string) => {
    switch(role) {
      case 'admin':
        return 'Sistem Yöneticisi';
      case 'company_admin':
        return 'Şirket Yöneticisi';
      case 'manufacturer':
        return 'Şirket Kurucusu';
      case 'user':
      default:
        return 'Kullanıcı';
    }
  };

  // Sayfa yüklendiğinde kullanıcıları getir
  useEffect(() => {
    fetchUsers();
  }, []);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: company?.name || "",
      taxId: company?.taxInfo?.taxNumber || "",
      tradeRegisterNumber: company?.taxInfo?.tradeRegistryNo || "",
      mersisNumber: company?.taxInfo?.mersisNo || "",
      email: company?.email || "",
      phone: company?.phone || "",
      website: company?.website || "",
      headquarters: company?.address?.headquarters || "",
      factoryAddress: company?.address?.factory || "",
      branchAddresses: company?.address?.branches || "",
      authorizedName: company?.authorizedPerson?.name || "",
      authorizedTitle: company?.authorizedPerson?.title || "",
      authorizedDepartment: company?.authorizedPerson?.department || "",
      authorizedEmail: company?.authorizedPerson?.email || "",
      authorizedPhone: company?.authorizedPerson?.phone || "",
      emailNotifications: company?.notifications?.email || false,
      smsNotifications: company?.notifications?.sms || false,
      systemAlerts: company?.notifications?.system || false,
      documentReminders: company?.notifications?.documents || false,
      certificationAlerts: company?.notifications?.certifications || false,
    },
  });

  // Şirket verileri yüklendiğinde form değerlerini güncelle
  useEffect(() => {
    if (company) {
      form.reset({
        companyName: company.name || "",
        taxId: company.taxInfo?.taxNumber || "",
        tradeRegisterNumber: company.taxInfo?.tradeRegistryNo || "",
        mersisNumber: company.taxInfo?.mersisNo || "",
        email: company.email || "",
        phone: company.phone || "",
        website: company.website || "",
        headquarters: company.address?.headquarters || "",
        factoryAddress: company.address?.factory || "",
        branchAddresses: company.address?.branches || "",
        authorizedName: company.authorizedPerson?.name || "",
        authorizedTitle: company.authorizedPerson?.title || "",
        authorizedDepartment: company.authorizedPerson?.department || "",
        authorizedEmail: company.authorizedPerson?.email || "",
        authorizedPhone: company.authorizedPerson?.phone || "",
        emailNotifications: company.notifications?.email || false,
        smsNotifications: company.notifications?.sms || false,
        systemAlerts: company.notifications?.system || false,
        documentReminders: company.notifications?.documents || false,
        certificationAlerts: company.notifications?.certifications || false,
      });
    }
  }, [company, form]);

  if (isCompanyLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("company.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function onSubmit(data: SettingsFormValues) {
    toast({
      title: t("success.title"),
      description: t("success.description"),
    });
  }
  
  // Kullanıcı davet formu için değişiklik işleyicisi
  const handleInviteFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setInviteFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Kullanıcı davet işlemi
  const handleInviteSubmit = async () => {
    if (!inviteFormData.email || !inviteFormData.full_name) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await inviteUser(inviteFormData);
      toast({
        title: "Başarılı",
        description: "Davet başarıyla gönderildi",
      });
      // Form alanlarını temizle
      setInviteFormData({ full_name: "", email: "", role: "user" });
      // Davet formunu kapat
      setInviteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // Kullanıcı silme işlemi
  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };
  
  // Kullanıcı silme onayı
  const confirmDeleteUser = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Sil</DialogTitle>
            <DialogDescription>
              Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="company" className="space-y-4">
          <TabsList>
            <TabsTrigger value="company">{t("tabs.company")}</TabsTrigger>
            <TabsTrigger value="contact">{t("tabs.contact")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("tabs.notifications")}</TabsTrigger>
            <TabsTrigger value="security">{t("tabs.security")}</TabsTrigger>
            {canManageUsers() && (
              <TabsTrigger value="users">{t("tabs.users")}</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>{t("company.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("company.name.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        {t("company.name.description")}
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("company.taxId.label")}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        {t("company.taxId.description")}
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="tradeRegisterNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("company.tradeRegisterNumber.label")}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mersisNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("company.mersisNumber.label")}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("contact.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.email")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.phone")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.fax")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.website")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("contact.address.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="headquarters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.address.headquarters")}</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="factoryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.address.factory")}</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="branchAddresses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.address.branches")}</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("contact.authorized.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="authorizedName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.authorized.name")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorizedTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.authorized.title")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorizedDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.authorized.department")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorizedEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.authorized.email")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorizedPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.authorized.phone")}</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>{t("security.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("security.changePassword.label")}
                        </FormLabel>
                        <FormDescription>
                          {t("security.changePassword.description")}
                        </FormDescription>
                      </div>
                      <Button variant="outline">
                        {t("security.changePassword.button")}
                      </Button>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Yönetimi</CardTitle>
                <FormDescription>
                  Şirket kullanıcılarını yönetin ve yeni kullanıcılar davet edin
                </FormDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium">Mevcut Kullanıcılar</h3>
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Yeni Kullanıcı Davet Et
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Kullanıcı Davet Et</DialogTitle>
                          <DialogDescription>
                            Şirketinize yeni bir kullanıcı davet etmek için aşağıdaki formu doldurun.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <FormLabel className="text-right">Ad Soyad</FormLabel>
                            <Input 
                              id="full_name" 
                              className="col-span-3" 
                              placeholder="John Doe" 
                              value={inviteFormData.full_name}
                              onChange={handleInviteFormChange}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <FormLabel className="text-right">E-posta</FormLabel>
                            <Input 
                              id="email" 
                              className="col-span-3" 
                              placeholder="john.doe@example.com" 
                              type="email" 
                              value={inviteFormData.email}
                              onChange={handleInviteFormChange}
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <FormLabel className="text-right">Rol</FormLabel>
                            <select 
                              id="role"
                              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={inviteFormData.role}
                              onChange={handleInviteFormChange}
                            >
                              <option value="user">Kullanıcı</option>
                              <option value="company_admin">Şirket Yöneticisi</option>
                            </select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="button" 
                            onClick={handleInviteSubmit}
                            disabled={inviting}
                          >
                            {inviting ? "Gönderiliyor..." : "Davet Gönder"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {/* Bekleyen Davetler */}
                  {invitations.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Bekleyen Davetler</h3>
                      <div className="rounded-md border">
                        {invitations
                          .filter(invitation => {
                            // Sadece bekleyen davetleri göster
                            if (invitation.status !== "pending") return false;
                            
                            // Mevcut kullanıcıların e-posta adreslerini kontrol et
                            // Eğer davet edilen kişi zaten kullanıcı olarak eklenmişse, daveti gösterme
                            const isAlreadyUser = users.some(
                              user => user.email.toLowerCase() === invitation.email.toLowerCase()
                            );
                            return !isAlreadyUser;
                          })
                          .map((invitation, index) => (
                          <div key={invitation.id} className={index > 0 ? "border-t p-4" : "p-4"}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{invitation.full_name}</p>
                                <p className="text-sm text-muted-foreground">{invitation.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                  Bekliyor
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => deleteInvitation(invitation.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Mevcut Kullanıcılar */}
                  <h3 className="text-lg font-medium mb-2">Mevcut Kullanıcılar</h3>
                  {loading ? (
                    <div className="flex justify-center p-4">
                      <p>Kullanıcılar yükleniyor...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="rounded-md border p-4 text-center">
                      <p>Henüz kullanıcı bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      {users.map((user, index) => (
                        <div key={user.id} className={index > 0 ? "border-t p-4" : "p-4"}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                {getRoleDisplayName(user.role)}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                type="button"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleting}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t("notifications.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("notifications.email.label")}
                        </FormLabel>
                        <FormDescription>
                          {t("notifications.email.description")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("notifications.sms.label")}
                        </FormLabel>
                        <FormDescription>
                          {t("notifications.sms.description")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="systemAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("notifications.system.label")}
                        </FormLabel>
                        <FormDescription>
                          {t("notifications.system.description")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("notifications.documents.label")}
                        </FormLabel>
                        <FormDescription>
                          {t("notifications.documents.description")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificationAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("notifications.certifications.label")}
                        </FormLabel>
                        <FormDescription>
                          {t("notifications.certifications.description")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
    </>
  );
}