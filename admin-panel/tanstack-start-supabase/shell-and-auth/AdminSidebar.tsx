import { useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Palette,
  FolderOpen,
  FileText,
  LogOut,
  Globe,
  Search,
  ShoppingBag,
  Tag,
  ClipboardList,
  MessageSquareText,
  Mail,
  Newspaper,
  Users,
  Image,
} from "lucide-react";
import { signOut } from "@/lib/admin";

type Item = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  external?: boolean;
};
type Group = { title: string | null; items: Item[] };

const groups: Group[] = [
  {
    title: null,
    items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Shop",
    items: [
      { label: "Products", to: "/admin/products", icon: ShoppingBag },
      { label: "Shop Categories", to: "/admin/shop-categories", icon: Tag },
      { label: "Orders", to: "/admin/orders", icon: ClipboardList },
      { label: "Reviews", to: "/admin/reviews", icon: MessageSquareText },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { label: "Artworks", to: "/admin/artworks", icon: Palette },
      { label: "Categories", to: "/admin/categories", icon: FolderOpen },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Journal", to: "/admin/blog", icon: Newspaper },
      { label: "Pages", to: "/admin/website-content", icon: FileText },
      { label: "Media", to: "/admin/media", icon: Image },
      { label: "SEO", to: "/admin/seo", icon: Search },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Leads", to: "/admin/leads", icon: Users },
      { label: "Subscribers", to: "/admin/subscribers", icon: Mail },
    ],
  },
  { title: null, items: [{ label: "View Site", to: "/", icon: Globe, external: true }] },
];

export function AdminSidebar() {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const isActive = (to: string, exact?: boolean) =>
    exact ? currentPath === to : currentPath.startsWith(to);

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: "/admin/login" });
  };

  return (
    <aside className="hidden md:flex flex-col w-[228px] h-screen sticky top-0 bg-white border-r border-border">
      <div className="px-5 py-5 border-b border-border">
        <span className="font-display text-[22px] text-forest font-medium">The Artspire</span>
        <p className="font-body text-[11px] text-stone mt-0.5">Studio Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={gi} className="space-y-1">
            {group.title && (
              <div className="px-3 pt-1 pb-1 font-body text-[10px] uppercase tracking-[0.18em] text-stone/50 font-semibold">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const active = isActive(item.to, item.exact);
              return item.external ? (
                <a
                  key={item.to}
                  href={item.to}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-[13px] font-medium text-stone hover:text-forest hover:bg-forest/5 transition-colors"
                >
                  <item.icon size={17} />
                  {item.label}
                </a>
              ) : (
                <a
                  key={item.to}
                  href={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-[13px] font-medium transition-colors ${active ? "bg-forest/10 text-forest" : "text-stone hover:text-forest hover:bg-forest/5"}`}
                >
                  <item.icon size={17} />
                  {item.label}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-body text-[13px] font-medium text-stone hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={17} /> Log Out
        </button>
      </div>
    </aside>
  );
}
