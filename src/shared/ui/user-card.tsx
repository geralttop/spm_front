import { User as UserIcon } from "lucide-react";
import { Button } from "./button";
import type { SearchUserResult } from "@/shared/api";

interface UserCardProps {
  user: SearchUserResult;
  onClick: () => void;
  actionButton?: React.ReactNode;
}

export function UserCard({ user, onClick, actionButton }: UserCardProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors cursor-pointer"
    >
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-text-main truncate">
          {user.username}
        </h3>
        <p className="text-sm text-text-muted truncate">
          {user.email}
        </p>
        {user.bio && (
          <p className="text-xs text-text-muted mt-1 line-clamp-2">
            {user.bio}
          </p>
        )}
      </div>
      
      {actionButton && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          {actionButton}
        </div>
      )}
    </div>
  );
}
