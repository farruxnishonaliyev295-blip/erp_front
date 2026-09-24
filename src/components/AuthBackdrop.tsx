export default function AuthBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-background">
      <div className="auth-grid absolute inset-0" />
      <div className="auth-blob absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-[110px]" />
      <div className="auth-blob auth-blob-delay absolute top-1/3 -right-32 h-[26rem] w-[26rem] rounded-full bg-accent/25 blur-[110px]" />
      <div className="auth-blob absolute -bottom-40 left-1/4 h-[24rem] w-[24rem] rounded-full bg-lime-500/20 blur-[110px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/10 to-background" />
    </div>
  );
}
