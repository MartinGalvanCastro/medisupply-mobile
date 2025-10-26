import { Image } from '@/components/ui/image';
import { StyleSheet, View } from 'react-native';

interface AuthLogoProps {
  height?: number;
}

export const AuthLogo = ({ height = 289 }: AuthLogoProps) => {
  return (
    <View style={[styles.logoContainer, { height }]}>
      <Image
        source={require('../../../assets/images/logo-auth.png')}
        alt="Logo"
        size="full"
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    width: '100%',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    marginBottom: 24,
  },
  logo: {
    width: '100%',
    height: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
