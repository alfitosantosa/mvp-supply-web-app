import { Button } from "./ui/button";

export default function Navbar() {
  const dataNavbar = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Products",
      href: "/dashboard/products",
    },
    {
      name: "Sales",
      href: "/dashboard/sales",
    },
    {
      name: "Inventory",
      href: "/dashboard/inventory",
    },
    {
      name: "Catalog",
      href: "/dashboard/catalog",
    },
  ];

  return (
    <nav className="w-full bg-black text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-lg font-bold">MVP Supply</div>
        <Button className="flex space-x-4">
          {dataNavbar.map((item) => (
            <a key={item.name} href={item.href} className="hover:text-gray-300">
              {item.name}
            </a>
          ))}
        </Button>
        <Button variant="outline" className=" font-bold ml-4">
          <a href="/auth/login" className="hover:text-gray-300">
            Login
          </a>
        </Button>
      </div>
    </nav>
  );
}
