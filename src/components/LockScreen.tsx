import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppLock } from '../hooks/useAppLock';

interface LockScreenProps {
  visible: boolean;
}

const LockScreen: React.FC<LockScreenProps> = ({ visible }) => {
  const { unlockWithBiometrics } = useAppLock();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      const success = await unlockWithBiometrics();
      if (!success) {
        Alert.alert('Unlock Failed', 'Unable to unlock the app. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'An error occurred while unlocking the app.');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Icon name="lock" size={80} color="#6366f1" />
          <Text style={styles.title}>App Locked</Text>
          <Text style={styles.subtitle}>
            Use biometrics or password to unlock
          </Text>
          
          <TouchableOpacity
            style={[styles.unlockButton, isUnlocking && styles.unlockButtonDisabled]}
            onPress={handleUnlock}
            disabled={isUnlocking}
          >
            {isUnlocking ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Icon name="fingerprint" size={24} color="#ffffff" />
                <Text style={styles.unlockButtonText}>Unlock</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 40,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  unlockButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  unlockButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LockScreen;

