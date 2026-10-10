import { ModeToggle } from "./theme-toggle";

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "U";
  const parts = source.split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : source.slice(0, 2).toUpperCase();
}

export default async function Navbar() {
  return (
    <nav className="p-4 flex items-center justify-between w-full">
      {/* LEFT  */}
      <h2>Admin Panel</h2>
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </nav>
  );
}
