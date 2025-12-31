export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-bg-primary safe-area-top safe-area-bottom">
      <div className="w-full max-w-[320px] sm:max-w-sm">
        {children}
      </div>
    </div>
  );
}
