import UserCard from "@/components/main/user-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function MainHeader() {
  return (
    <header className="flex justify-between items-center  w-full mt-2 h-16 backdrop-blur-lg">
      <UserCard />
      <ThemeToggle />
    </header>
  );
}
