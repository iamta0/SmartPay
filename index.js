
import { registerRootComponent } from 'expo';

// Add error logging
console.log('Starting app...');

try {
  const App = require('./App').default;
  console.log('App loaded successfully');
  registerRootComponent(App);
} catch (error) {
  console.error('Failed to load App:', error);
  throw error;
}