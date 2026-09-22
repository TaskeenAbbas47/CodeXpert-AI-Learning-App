import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
// Going up one level (..) to find context
import { useTheme } from '../context/ThemeContext';

type Generator<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>> = 
  (colors: any) => T;

export const useThemeStyles = <T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  styleGenerator: Generator<T>
) => {
  const { colors, isDark } = useTheme();

  const styles = useMemo(() => {
    return styleGenerator(colors);
  }, [colors, styleGenerator]);

  return { styles, colors, isDark };
};