import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import { Link, LinkProps } from "~/components/link";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/utils";

export function GoBackIcon({ to, className, ...rest }: LinkProps) {
  return (
    <Link
      {...rest}
      to={to}
      className={buttonVariants({
        size: "icon",
        variant: "ghost",
        className,
      })}
    >
      <ArrowLeftIcon className={cn("h-6 w-6")} />
    </Link>
  );
}
