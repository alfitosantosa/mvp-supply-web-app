export async function Footer() {
  return (
    <footer className="w-full bg-black text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} MVP Supply. All rights reserved.</p>
      </div>
    </footer>
  );
}
