export function userProfilePath(username: string): string {
    return `/user/${encodeURIComponent(username)}`;
}
