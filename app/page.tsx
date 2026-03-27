import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex justify-center items-center h-screen w-max-7xl ">
        <Button>
          <Link href="/auth/sign-in">Login</Link>
        </Button>
      </div>
    </>
  );
}
