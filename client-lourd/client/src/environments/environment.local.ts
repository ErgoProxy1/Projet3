import {FIREBASE_CONFIG, IEnvironment} from './IEnvironment';

export const environment: IEnvironment = {
  production: false,
  socketUrl: 'http://localhost:20504',
  firebaseConfig: FIREBASE_CONFIG
};
