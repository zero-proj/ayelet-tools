import TopNavbar from "./navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <TopNavbar />
      <main className="container mx-auto px-6 grow">{children}</main>
      <footer className="w-full flex items-center justify-center py-3">
        <span>Powered by 玩伊会</span>
      </footer>
    </div>
  );
}
