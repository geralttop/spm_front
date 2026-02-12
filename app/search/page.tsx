"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { authApi, type SearchUserResult } from "@/shared/api";
import { useAuthStore } from "@/shared/lib/store";
import { useTranslation } from "@/shared/lib/hooks";
import { Search, X, User } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        router.push("/auth");
        return;
      }
      
      try {
        const profile = await authApi.getProfile();
        setCurrentUserId(Number(profile.userId));
      } catch (error) {
        console.error("Failed to get current user profile:", error);
      }
    };
    
    initAuth();
  }, [checkAuth, router]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const results = await authApi.searchUsers(searchQuery);
      // Фильтруем результаты, исключая текущего пользователя
      const filteredResults = results.filter(user => user.id !== currentUserId);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
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

            {!isSearching && hasSearched && searchResults.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("search.noResults")}</p>
                <p className="text-sm mt-2">{t("search.tryDifferent")}</p>
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-text-main">
                  {t("search.results")} ({searchResults.length})
                </h2>
                
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
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
                    
                    <div className="shrink-0">
                      <Button variant="outline" size="sm">
                        {t("search.viewProfile")}
                      </Button>
                    </div>
                  </div>
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