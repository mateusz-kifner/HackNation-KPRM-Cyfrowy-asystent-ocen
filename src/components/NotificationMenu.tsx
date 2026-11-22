import { useEffect, useState } from "react";
import { useMeNotifications } from "#/hooks/api/me/useMeNotifications";
import { useMeMarkNotificationRead } from "#/hooks/api/me/useMeMarkNotificationRead";
import { useMeMarkAllNotificationsRead } from "#/hooks/api/me/useMeMarkAllNotificationsRead";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { IconBell, IconCheck } from "@tabler/icons-react";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export default function NotificationMenu() {
	const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());
	useEffect(() => {
		try {
			const raw = localStorage.getItem("notifications-read");
			if (raw) {
				setLocalReadIds(new Set(JSON.parse(raw)));
			}
		} catch {}
	}, []);

	const persistReadIds = (ids: Set<string>) => {
		try {
			localStorage.setItem(
				"notifications-read",
				JSON.stringify(Array.from(ids)),
			);
		} catch {}
	};

	const { data, isLoading } = useMeNotifications();
	const markRead = useMeMarkNotificationRead();
	const markAll = useMeMarkAllNotificationsRead();

	const handleMarkRead = (id: string) => {
		const ids = new Set(localReadIds);
		ids.add(id);
		setLocalReadIds(ids);
		persistReadIds(ids);
		markRead.mutate({ id });
	};

	const handleMarkAllRead = () => {
		if (data?.items) {
			const ids = new Set(data.items.map((i) => i.id));
			setLocalReadIds(ids);
			persistReadIds(ids);
		}
		markAll.mutate();
	};

	const items = data?.items ?? [];
	const mergedItems = items.map((item) => ({
		...item,
		read: item.read || localReadIds.has(item.id),
	}));
	const unreadCount = mergedItems.filter((i) => !i.read).length;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="size-10 rounded-full p-0 relative">
					<IconBell className="size-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -right-1 -top-1 h-5 min-w-5 px-1"
						>
							{unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<DropdownMenuLabel className="flex items-center justify-between">
					Notifications
					{unreadCount > 0 && (
						<Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
							<IconCheck className="mr-1 size-4" /> Mark all read
						</Button>
					)}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<ScrollArea className="h-80">
					{isLoading ? (
						<div className="p-4 text-sm text-muted-foreground">Loading...</div>
					) : mergedItems.length === 0 ? (
						<div className="p-4 text-sm text-muted-foreground">
							No notifications
						</div>
					) : (
						mergedItems.map((n) => (
							<DropdownMenuItem
								key={n.id}
								className="flex flex-col items-start gap-1 p-3"
								onSelect={(e) => e.preventDefault()}
							>
								<div className="flex w-full items-center justify-between">
									<span className="font-medium">{n.title}</span>
									{!n.read && (
										<span className="h-2 w-2 rounded-full bg-primary" />
									)}
								</div>
								<p className="text-sm text-muted-foreground">{n.message}</p>
								<div className="mt-1 flex w-full items-center justify-between text-xs text-muted-foreground">
									<span>
										{formatDistanceToNow(new Date(n.createdAt), {
											addSuffix: true,
										})}
									</span>
									{!n.read && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleMarkRead(n.id)}
										>
											Mark read
										</Button>
									)}
								</div>
							</DropdownMenuItem>
						))
					)}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
