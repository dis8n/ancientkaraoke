"use client";

/**
 * Sidebar компонент для защищенных страниц
 * 
 * Отображает навигацию между страницами:
 * - Генерация караоке
 * - История генераций (мой профиль)
 * - Лидерборд
 * 
 * Минималистичный дизайн без градиентов и эмодзи.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, History, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Генерация",
    href: "/generate",
    icon: Music,
  },
  {
    name: "Мой профиль",
    href: "/dashboard",
    icon: History,
  },
  {
    name: "Лидерборд",
    href: "/leaderboard",
    icon: Trophy,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-background">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

