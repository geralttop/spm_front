"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, UserCard } from "@/shared/ui";
import { authApi } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import { useSearchUsersQuery, useProfileQuery } from "@/shared/lib/hooks/queries";
import { Search, X, User } from "lucide-react";

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setHasSearched(false);
  };

  const handleUserClick = (userId: number) => {
    router.push(`/user/${userId}`);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-main mb-2">
              {t("search.title")}
            </h1>
            <p className="text-text-muted">
              {t("search.description")}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t("search.placeholder")}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Button 
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
              >
                {isSearching ? "..." : t("search.button")}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {isSearching && (
              <div className="text-center py-8 text-text-muted">
                {t("search.searching")}
              </div>
            )}

            {!isSearching && hasSearched && filteredResults.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("search.noResults")}</p>
                <p className="text-sm mt-2">{t("search.tryDifferent")}</p>
              </div>
            )}

            {!isSearching && filteredResults.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-text-main">
                  {t("search.results")} ({filteredResults.length})
                </h2>
                
                {filteredResults.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onClick={() => handleUserClick(user.id)}
                    actionButton={
                      <Button variant="outline" size="sm">
                        {t("search.viewProfile")}
                      </Button>
                    }
                  />
                ))}
              </div>
            )}

            {!hasSearched && (
              <div className="text-center py-12 text-text-muted">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">{t("search.startSearching")}</p>
                <p className="text-sm">{t("search.enterUsername")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
