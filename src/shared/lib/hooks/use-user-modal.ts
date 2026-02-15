import { useState } from "react";
import { subscriptionsApi, type SubscriptionUser } from "@/shared/api";

export function useUserModal() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<SubscriptionUser[]>([]);
  const [loading, setLoading] = useState(false);

  const openModal = async (
    userId: number,
    type: "followers" | "following"
  ) => {
    setLoading(true);
    setShowModal(true);
    try {
      const data =
        type === "followers"
          ? await subscriptionsApi.getFollowers(userId)
          : await subscriptionsApi.getFollowing(userId);
      setUsers(data);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setUsers([]);
  };

  return {
    showModal,
    users,
    loading,
    openModal,
    closeModal,
  };
}
