import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { 
  MD3LightTheme, 
  MD3DarkTheme, 
  PaperProvider, 
  adaptNavigationTheme 
} from 'react-native-paper';
import { 
  DarkTheme as NavigationDarkTheme, 
  DefaultTheme as NavigationDefaultTheme 
} from '@react-navigation/native';
import merge from 'deepmerge';
import { Colors } from '@/constants/theme';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = merge(MD3LightTheme, LightTheme);
const CombinedDarkTheme = merge(MD3DarkTheme, DarkTheme);

const customLightTheme = {
  ...CombinedDefaultTheme,
  colors: {
    ...CombinedDefaultTheme.colors,
    primary: Colors.light.primary,
    secondary: Colors.light.secondary,
    background: Colors.light.background,
    surface: Colors.light.card,
    surfaceVariant: Colors.light.inputBackground,
    error: Colors.light.error,
    onPrimary: Colors.light.textOnPrimary,
  },
};

const customDarkTheme = {
  ...CombinedDarkTheme,
  colors: {
    ...CombinedDarkTheme.colors,
    primary: Colors.dark.primary,
    secondary: Colors.dark.secondary,
    background: Colors.dark.background,
    surface: Colors.dark.card,
    surfaceVariant: Colors.dark.inputBackground,
    error: Colors.dark.error,
    onPrimary: Colors.dark.textOnPrimary,
  },
};

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(deviceColorScheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? customDarkTheme : customLightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};
