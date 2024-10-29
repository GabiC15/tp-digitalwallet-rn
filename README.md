# Digital Wallet

## Intrucciones de uso

1. Levantar el proyecto con `node server.js` para el backend y `npm run android` para el frontend.
2. Iniciar sesión en la app con el usuario "johndoe" y contraseña "password".
3. Generar un qr mediante con el path http://localhost:3000/generate-qr?amount=20 (el param amount es para indicar el monto de la transacción).
4. Clickear en la app "Scan QR Code" y escanear el codigo QR (puede verse desde la consola del backend).
5. Se indicará que el pago fue exitoso y en el Home se mostrará la transacción en una card.
