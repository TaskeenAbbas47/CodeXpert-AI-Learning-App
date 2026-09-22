// hooks/useBackWithAnim.tsx
import { useEffect } from "react";
import { BackHandler } from "react-native";
import { useNavigation } from "@react-navigation/native";

export const useBackWithAnim = (
  playAnim: () => Promise<void>,
  target: string
) => {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      playAnim().then(() => {
        navigation.navigate(target as never);
      });
      return true;
    });

    return () => backHandler.remove();
  }, [navigation, playAnim, target]);

  const handleBackPress = () => {
    playAnim().then(() => {
      navigation.navigate(target as never);
    });
  };

  return { handleBackPress };
};
