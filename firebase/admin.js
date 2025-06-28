// firebase/admin.js
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// HARDCODED Firebase Admin credentials
const firebaseAdminConfig = {
  projectId: "interview-e5d3a",
  clientEmail: "firebase-adminsdk-fbsvc@interview-e5d3a.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCZEUmsD9uWUFFk\n75Fjb//iX8K/pEaQ8+BMrGLTrXsGP+RNwT9zMBaAzDoFFYqPOeveb66SSm44WyyK\n6fy4vD6FG3Tr99wLDDyyOcI6xiEj4V72eoFNiG8P/7OfKO9dLfsxAYRrQk1VeeNg\nQtGfJxfpyHzaFKqMpLIGBSd4e5cK46TgceKdluTKHlhVSMtHtbOTUS6XF6+JB0CX\n1UuXMjiVcBtiBkCHyGbchKwwtjYIF+obK3jtcjzxl/TE55s36KxIgeU02atcSqIH\njunjZoGZ1Awsi3rXjG7izF15vqi4GLZPfY/lzjApK2UBfG0wSYFzafo7Ssm5uqrR\nhfC8cEBxAgMBAAECggEAE8Tq1KExBYdBa/LmaTG0RSLZvpyoody4RyQrQ2xFgQzM\nH3VqYiXU0jUOTU0h7yurmLf96QEEnpy6nQUUJzE7iz986LkYygh+PQU+s7lBMHwm\nzVi3IzIQKMB9YidhpZGPFB4+YbKs1ZxUz0BHXfHTodXLYkiHBSaETki+IfknDI3K\nXWFDfSC+Sb638IFNLnZQTyqWtyThi9+oDPLJrtalLFcNJbNhA9WyUgBwI38R0Ujl\n6IWJ42DP0ddXGTd3sNSUWVexEY7md9jK/PiADDOV6q3yGiHu4iRJF6Bri1wOjCcj\ny3KsR0mZ9/wAw8J/16i+2zm3Y1585b/neaWOf7gRPQKBgQDPtJUw0TShzVGhBf9C\nvT7LDEP7CXLsAhCZcJvsVVZhWK9fXrl+5OhzbcuP397hLWopiVpiRcBJWhuNU0g4\nYst5tz7rrAZw/rP2VW1v/nVaqMijbBcwz0lSvZCPKfsDd/2ve/R633VjKYlAXuQL\n7k+zKdADCEYGsmlJZvTUZFiX4wKBgQC8qHNd5fGMPDEq8rOMzWvJBLNbxDeMyr7Y\nDOqOTIFHM/7NOsMz4jSe8sxcsDIoDSKfFhU0/ixite1jtPheS/9KUmRcxPZZ6IEF\nRGYZucOMwcQzL7FSfQgBR+YG9MpkkjV2RRHJJHQ0ZaYsWDdEP5a/13DveWlY34MQ\nxxgT4zCumwKBgDQk7NN9og4A4r5fKA9UPWByatqqK5zOg+ZRnAOABRiZUCXMPRt7\nUlQwO0uac3Tqlt1oqzVCt5xyr7oSL25gdx7Of1BhNpjFiN6N4dSc+E9TUlOcvlG1\nqH3KM3GNo4PiauDUaLM0SF8lvVxYtj28jWu4Uo2AVTw3LDGOVGbB7m/rAoGAYjSB\n0Xg4M9rFcWjjZEEugXaL8xICJK0JiSe4FZjnluwPEEAtit2OrMsQ7JLfmQ+1XQC+\ny1YgPsYbK9LxkwyWeNbI3a2923F3cAl56JxVmfjnrAmAkcL6HsiRij9098NQRx+P\nMZhjUT80sFK/eixrybNZW59k4ll/PYWWGAwktE8CgYEAmC9RtjlV/oPUi8XTFlKz\naxpHRpZvmEyTFNkIXxSDS0kh/Ica9Po9Wasn+x5M88a81VM2DNI+Q6gdn1BuQvY4\nmrFELgRKLqsL6qGuFWhomdHEGSjsMHhMDOu0vriCUHzzde7Nwu7QS72TT6T8ci/d\nKLI3h3nbzLDd/u/4vzF9ECo=\n-----END PRIVATE KEY-----\n"
};

console.log('✅ Firebase Admin initialized with hardcoded config');

// Initialize Firebase Admin app
const app = getApps().length === 0
  ? initializeApp({
      credential: cert(firebaseAdminConfig),
    })
  : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);