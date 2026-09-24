import NavBar from "@/components/NavBar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-warung-krem lg:flex-row">
      <NavBar />
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}