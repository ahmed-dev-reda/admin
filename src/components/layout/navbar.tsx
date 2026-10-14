import { ModeToggle } from "./theme-toggle";

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
