import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type StepperProps = {
  tabs: string[];
  activeStep: number;
  setActiveStep: (step: number) => void;
};

export function Stepper({ tabs, activeStep, setActiveStep }: StepperProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={styles.stepperRow}>
        {/* Progress Line Background */}
        <View style={[styles.line, { backgroundColor: theme.border, top: 32 }]} />
        
        {/* Active Progress Line */}
        <View 
          style={[
            styles.line, 
            { 
              backgroundColor: theme.tint, 
              top: 32, 
              width: `${(activeStep / (tabs.length - 1)) * 100}%` 
            }
          ]} 
        />

        {tabs.map((label, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <View key={index} style={styles.stepContainer}>
              <TouchableOpacity
                onPress={() => setActiveStep(index)}
                style={[
                  styles.circle,
                  { backgroundColor: isActive || isCompleted ? theme.tint : theme.border }
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.circleText,
                    { color: isActive || isCompleted ? '#ffffff' : theme.subtext }
                  ]}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  styles.label,
                  { color: isActive ? theme.tint : theme.subtext, fontWeight: isActive ? '600' : '400' }
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  stepperRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  line: {
    position: 'absolute',
    height: 2,
    left: '12.5%', // Center of first circle (1/4 of 1/4 step in a 4-step flow)
    right: '12.5%', // Center of last circle
    zIndex: 1,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    zIndex: 10,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  label: {
    marginTop: 8,
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
