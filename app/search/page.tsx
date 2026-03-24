"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, UserCard } from "@/shared/ui";
import { authApi } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import { useSearchUsersQuery, useProfileQuery } from "@/shared/lib/hooks/queries";
import { Search, X, User } from "lucide-react";
import { userProfilePath } from "@/shared/lib/user-profile-path";

export default function SearchPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { data: profile } = useProfileQuery();
  const currentUserId = profile ? Number(profile.userId) : null;

  const { data: searchResults = [], isLoading: isSearching } = useSearchUsersQuery(
    debouncedQuery,
    hasSearched
  );

  const filteredResults = searchResults.filter(user => user.id !== currentUserId);

  useEffect(() => {
    const initAuth = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        router.push("/auth");
      }
    };
    
    initAuth();
  }, [checkAuth, router]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setDebouncedQuery(searchQuery);
    setHasSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setHasSearched(false);
  };

  const handleUserClick = (username: string) => {
    router.push(userProfilePath(username));
  };

  return (
    <div className="min-h-[100dvh] bg-background py-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:py-6 lg:py-8">
      <div className="container mx-auto max-w-2xl px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="mb-2 text-xl font-bold text-text-main sm:text-2xl md:text-3xl">
              {t("search.title")}
            </h1>
            <p className="text-sm leading-snug text-text-muted sm:text-base sm:leading-normal">
              {t("search.description")}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted sm:h-5 sm:w-5"
                  aria-hidden
                />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("search.placeholder")}
                  autoComplete="off"
                  className="touch-target pl-10 pr-10 text-base sm:text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-text-muted transition-colors hover:bg-accent hover:text-text-main touch-target"
                    aria-label={t("search.clear")}
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>
              <Button
                type="button"
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="w-full shrink-0 touch-target sm:w-auto sm:min-w-[7rem]"
              >
                {isSearching ? "..." : t("search.button")}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {isSearching && (
              <div className="py-6 text-center text-text-muted sm:py-8">
                <div className="animate-pulse text-sm sm:text-base">{t("search.searching")}</div>
              </div>
            )}

            {!isSearching && hasSearched && filteredResults.length === 0 && (
              <div className="py-8 text-center text-text-muted sm:py-12">
                <User className="mx-auto mb-4 h-10 w-10 opacity-50 sm:h-12 sm:w-12" aria-hidden />
                <p className="text-base sm:text-lg">{t("search.noResults")}</p>
                <p className="mx-auto mt-2 max-w-md px-1 text-sm leading-relaxed">
                  {t("search.tryDifferent")}
                </p>
              </div>
            )}

            {!isSearching && filteredResults.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base font-semibold text-text-main sm:text-lg">
                  {t("search.results")} ({filteredResults.length})
                </h2>

                <div className="space-y-3">
                  {filteredResults.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onClick={() => handleUserClick(user.username)}
                      actionButton={
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          className="w-full min-h-[44px] touch-target sm:w-auto sm:min-h-9"
                        >
                          <span className="hidden sm:inline">{t("search.viewProfile")}</span>
                          <span className="sm:hidden">{t("search.view")}</span>
                        </Button>
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {!hasSearched && (
              <div className="py-10 text-center text-text-muted sm:py-16">
                <Search className="mx-auto mb-4 h-11 w-11 opacity-30 sm:h-16 sm:w-16" aria-hidden />
                <p className="mb-2 text-base sm:text-lg">{t("search.startSearching")}</p>
                <p className="max-w-md mx-auto text-sm leading-relaxed px-1">{t("search.enterUsername")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
