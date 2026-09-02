import StarMark from "@/components/StarMark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 py-16">
      <span className="logo-mark mx-auto flex h-20 w-20 items-center justify-center rounded-3xl">
        <StarMark className="h-11 w-11" />
      </span>
      {children}
    </div>
  );
}
