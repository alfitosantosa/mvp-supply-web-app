"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import Image from "next/image";
import Logo from "@/public/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "./ui/avatar";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Example static navbar data
  const dataNavbar = [
    // { name: "Sales", href: "/dashboard/sales" },
    // { name: "Inventory", href: "/dashboard/inventory" },
    // { name: "Catalog", href: "/dashboard/catalog" },
    { name: "Home", href: "/" },
    { name: "Products", href: "/dashboard/products" },
    { name: "Invoice", href: "/dashboard/invoice" },
    { name: "Company", href: "/dashboard/company" },
    { name: "Customer", href: "/dashboard/customer" },
  ];

  // Session dari Better Auth
  const { data: session, isPending } = useSession();

  const handleNavigate = (value: string) => {
    router.push(value);
  };

  const handleUserAction = async (value: string) => {
    if (value === "profile") {
      router.push("/dashboard/profile");
    }
    if (value === "logout") {
      router.push("/auth/sign-in");
      await signOut();
    }
    if (value === "useradmin") {
      router.push("/dashboard/users");
    }
  };

  // Loading state — render struktur yang sama agar tidak hydration mismatch
  if (isPending) {
    return (
      <nav className="h-full bg-black text-white p-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Image src={Logo} alt="logo" width={100} height={100} />
          <div className="w-48 h-9 bg-gray-800 rounded animate-pulse" />
          <div className="w-40 h-9 bg-gray-800 rounded animate-pulse ml-4" />
        </div>
      </nav>
    );
  }

  // Not logged in
  if (!session?.user) {
    return (
      <nav className="h-full bg-black text-white p-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Image src={Logo} alt="Logo" width={100} height={100} />
          <Button
            variant="outline"
            className="text-black bg-white hover:bg-gray-200"
          >
            <a href="/auth/sign-in">Login</a>
          </Button>
        </div>
      </nav>
    );
  }

  // Logged in
  return (
    <nav className="h-full bg-black text-white p-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <Image src={Logo} alt="logo" width={100} height={100} />

        {/* Select Menu Navigation */}
        <Select onValueChange={handleNavigate} value={pathname}>
          <SelectTrigger className="w-48 bg-black text-white border-white">
            <SelectValue placeholder="Select a page" />
          </SelectTrigger>

          <SelectContent className="bg-black text-white border border-gray-700">
            <SelectGroup>
              {dataNavbar.map((item) => (
                <SelectItem
                  key={item.href}
                  value={item.href}
                  className="hover:bg-gray-800"
                >
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* User Menu / Logout Select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-10 h-10">
              <Image
                src={session.user.image}
                alt={session.user.name}
                width={40}
                height={40}
              />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleUserAction("profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUserAction("useradmin")}>
                User Admin
              </DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleUserAction("logout")}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
