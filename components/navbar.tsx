"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Example static navbar data
  const dataNavbar = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/dashboard/products" },
    { name: "Sales", href: "/dashboard/sales" },
    { name: "Inventory", href: "/dashboard/inventory" },
    { name: "Catalog", href: "/dashboard/catalog" },
    { name: "Invoice", href: "/dashboard/invoice" },
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
  };

  // Loading state
  if (isPending) {
    return (
      <nav className="w-full bg-black text-white p-4">
        <div className="text-center">Loading...</div>
      </nav>
    );
  }

  // Not logged in
  if (!session?.user) {
    return (
      <nav className="w-full bg-black text-white p-4">
        <div className="mx-auto flex items-center justify-between">
          <div className="text-lg font-bold">MVP Supply</div>

          <Button variant="outline" className="font-bold text-black bg-white hover:bg-gray-200">
            <a href="/auth/sign-in">Login</a>
          </Button>
        </div>
      </nav>
    );
  }

  // Logged in
  return (
    <nav className="w-full h-full bg-black text-white p-4">
      <div className="mx-auto flex items-center justify-between">
        <div className="text-lg font-bold">MVP Supply</div>

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
        <Select onValueChange={handleUserAction}>
          <SelectTrigger className="w-40 bg-black text-white border-white ml-4">
            <SelectValue placeholder={session.user.name ?? "User"} />
          </SelectTrigger>

          <SelectContent className="bg-black text-white border border-gray-700">
            <SelectGroup>
              <SelectItem value="profile" className="cursor-pointer hover:bg-gray-800">
                Profile
              </SelectItem>

              <SelectItem
                value="logout"
                className="cursor-pointer text-red-400 hover:bg-gray-800"
              >
                Logout
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </nav>
  );
}