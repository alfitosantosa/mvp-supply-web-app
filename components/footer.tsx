export async function Footer() {
  return (
    <footer className="w-full border-t px-4 py-6 md:px-6">
      <p className="mx-auto max-w-7xl text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} MVP Supply. All rights reserved.
      </p>
    </footer>
  );
}
