import { ThemeToggle } from "@/components/Theme/theme-toggle";
import Image from "next/image";

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Image
          className="mr-2"
          width={32}
          height={32}
          src="/icon.png"
          alt="user"
        />
        WalletX
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
