"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// This would come from your API in a real app
const defaultValues: Partial<SettingsFormValues> = {
  companyName: "İnci Akü",
  taxId: "1234567890",
  tradeRegisterNumber: "123456",
  mersisNumber: "0123456789",
  email: "contact@inciaku.com",
  phone: "+90 555 123 4567",
  website: "https://www.inciaku.com",
  headquarters: "İzmir, Turkey",
  authorizedName: "John Doe",
  authorizedTitle: "Production Manager",
  authorizedDepartment: "Manufacturing",
  authorizedEmail: "john.doe@inciaku.com",
  authorizedPhone: "+90 555 987 6543",
  emailNotifications: true,
  smsNotifications: false,
  systemAlerts: true,
  documentReminders: true,
  certificationAlerts: true,
};

export function SettingsForm() {
  const { toast } = useToast();
  const t = useTranslations("settings");

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  function onSubmit(data: SettingsFormValues) {
    toast({
      title: t("success.title"),
      description: t("success.description"),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="company" className="space-y-4">
          <TabsList>
            <TabsTrigger value="company">{t("tabs.company")}</TabsTrigger>
            <TabsTrigger value="contact">{t("tabs.contact")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("tabs.notifications")}</TabsTrigger>
            <TabsTrigger value="security">{t("tabs.security")}</TabsTrigger>
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
  );
}