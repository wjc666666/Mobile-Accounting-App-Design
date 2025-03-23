import { NativeModules, Platform } from 'react-native';

const { AppLauncherModule } = NativeModules;

interface AppLauncherInterface {
  openAlipay(): Promise<boolean>;
  openWeChat(): Promise<boolean>;
}

// Mock implementation for iOS or when native module is not available
const mockAppLauncher: AppLauncherInterface = {
  openAlipay: async () => {
    console.warn('AppLauncher: Native module not available, openAlipay is mocked');
    return false;
  },
  openWeChat: async () => {
    console.warn('AppLauncher: Native module not available, openWeChat is mocked');
    return false;
  },
};

const AppLauncher: AppLauncherInterface = Platform.OS === 'android' && AppLauncherModule
  ? AppLauncherModule
  : mockAppLauncher;

export default AppLauncher; 