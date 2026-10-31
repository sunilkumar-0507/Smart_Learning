import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FlaskConical,
  LayoutDashboard,
  Library,
  Route,
  Settings,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/progress', label: 'Progress', icon: TrendingUp },
    ],
  },
  {
    label: 'Learn',
    items: [
      { to: '/subjects', label: 'Subjects', icon: BookOpen },
      { to: '/assessment', label: 'Assessments', icon: ClipboardCheck },
      { to: '/learning-path', label: 'Learning Path', icon: Route },
      { to: '/resources', label: 'Resources', icon: Library },
      { to: '/schedule', label: 'Study Schedule', icon: CalendarDays },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/performance', label: 'Performance', icon: BarChart3 },
      { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
      { to: '/experiments', label: 'Experiments', icon: FlaskConical },
    ],
  },
  {
    label: 'Account',
    items: [{ to: '/settings', label: 'Settings', icon: Settings }],
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export function titleForPath(pathname: string): string {
  const match = ALL_NAV_ITEMS.filter((i) => pathname === i.to || pathname.startsWith(`${i.to}/`)).sort((a, b) => b.to.length - a.to.length)[0];
  return match?.label ?? 'Smart Learning Path';
}
