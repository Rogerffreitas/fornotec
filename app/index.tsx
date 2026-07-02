import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { colors } from "../components/theme";

export default function Index() {
  const { user } = useAuth();

  useEffect(() => {
    router.replace(user ? "/home" : "/login");
  }, [user]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
