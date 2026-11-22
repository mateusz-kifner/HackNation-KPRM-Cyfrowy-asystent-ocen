import { Fragment } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbEntry = {
	label: string;
	href?: string;
};

export function PageBreadcrumb({ items }: { items: BreadcrumbEntry[] }) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((item, index) => {
					const isCurrent = index === items.length - 1;
					return (
						<Fragment key={`${item.label}-${index}`}>
							<BreadcrumbItem>
								{isCurrent || !item.href ? (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!isCurrent && <BreadcrumbSeparator />}
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
