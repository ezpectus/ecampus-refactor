'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/routing';
import { registerUser } from '@/actions/auth.actions';
import { useTranslations } from 'next-intl';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import PasswordInput from '@/components/ui/password-input';
import { useServerErrorToast } from '@/hooks/use-server-error-toast';
import { useRouter } from 'next/navigation';

export const RegisterForm = () => {
  const t = useTranslations('auth.register');
  const router = useRouter();
  const { errorToast } = useServerErrorToast();

  const FormSchema = z.object({
    name: z.string().min(1, { message: t('validation.name-required') }),
    email: z.string().min(1, { message: t('validation.email-required') }).email({ message: t('validation.email-invalid') }),
    password: z.string().min(8, { message: t('validation.password-min') }),
    passwordConfirm: z.string().min(1, { message: t('validation.password-confirm-required') }),
  }).refine((data) => data.password === data.passwordConfirm, {
    message: t('validation.password-match'),
    path: ['passwordConfirm'],
  });

  type FormData = z.infer<typeof FormSchema>;

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    form.clearErrors();

    try {
      const result = await registerUser(data.name, data.email, data.password);

      if (!result.ok) {
        form.setError('root', { message: t(`field.error.${result.error}`) });
        return;
      }

      router.push('/login');
    } catch {
      errorToast();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-6 grid w-full items-center gap-2">
              <Label htmlFor="name">{t('field.name')}</Label>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="mb-6 grid w-full items-center gap-2">
              <Label htmlFor="email">{t('field.email')}</Label>
              <Input {...field} type="email" />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="mb-6 grid w-full items-center gap-2">
              <Label htmlFor="password">{t('field.password')}</Label>
              <PasswordInput {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem className="mb-6 grid w-full items-center gap-2">
              <Label htmlFor="passwordConfirm">{t('field.passwordConfirm')}</Label>
              <PasswordInput {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormMessage>{form.formState.errors.root?.message}</FormMessage>
        <Button size="big" className="my-4 w-full" type="submit" loading={form.formState.isSubmitting}>
          {t('button.register')}
        </Button>
        <Link className="text-sm" href="/login">
          {t('button.login')}
        </Link>
      </form>
    </Form>
  );
};
