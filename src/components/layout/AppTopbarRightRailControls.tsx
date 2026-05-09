import { UserSearch } from "lucide-react";

export function AppTopbarMyViewToggle({
  isActive,
  memberName,
  onToggle,
}: {
  isActive: boolean;
  memberName: string | null;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label={isActive ? "Clear My View filter" : "Show My View filter"}
      aria-pressed={isActive}
      className={isActive ? "app-topbar-my-view-button is-active" : "app-topbar-my-view-button"}
      disabled={!memberName}
      onClick={onToggle}
      title={
        memberName
          ? isActive
            ? `Showing ${memberName}`
            : `Filter workspace to ${memberName}`
          : "No roster member matches the signed-in user"
      }
      type="button"
    >
      <UserSearch size={14} strokeWidth={2} />
    </button>
  );
}
