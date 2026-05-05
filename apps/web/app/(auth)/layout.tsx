export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-175 w-175 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-150 w-150 rounded-full bg-blue-50 blur-3xl" />
        <div className="absolute left-1/2 top-[30%] h-100 w-100 -translate-x-1/2 rounded-full bg-blue-100/30 blur-2xl" />
        <div className="absolute bottom-[10%] left-[15%] h-50 w-50 rounded-full bg-blue-50/60 blur-2xl" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Glass card */}
      <div className="relative w-full max-w-md rounded-2xl border border-blue-100 bg-white/75 p-8 shadow-xl shadow-blue-100/40 backdrop-blur-xl">
        {/* Logo / Brand */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-200/50">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">ChatApp</h1>
        </div>

        {children}
      </div>
    </div>
  );
}
