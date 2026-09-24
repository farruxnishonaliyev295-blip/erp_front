import AuthBackdrop from "@/components/AuthBackdrop";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <AuthBackdrop />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl accent-gradient shadow-lg shadow-accent/30 ring-4 ring-background">
            <Icon className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
        </div>
        <div className="relative mt-[-1.75rem] rounded-3xl border border-border/60 bg-card/80 p-8 pt-12 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <div className="mb-7 text-center">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && (
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        )}
      </div>
    </div>
  );
}
