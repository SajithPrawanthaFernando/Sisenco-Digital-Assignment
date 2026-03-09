import { useState, useEffect, useCallback } from "react";
import api from "@/lib/utils";

export const useSettings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, categoriesRes] = await Promise.all([
        api.get("/auth/profile"),
        api.get("/settings/categories"),
      ]);

      setProfile(profileRes.data.user || profileRes.data);

      const fetchedCats = categoriesRes.data.categories || categoriesRes.data;
      if (Array.isArray(fetchedCats)) {
        setCategories(fetchedCats);
      } else {
        console.warn("Categories data is not an array:", fetchedCats);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching settings data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { profile, categories, loading, refresh: fetchData };
};
