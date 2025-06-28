import Vapi from '@vapi-ai/web';

const vapi = new Vapi(import.meta.env.VITE_VAPI_API_KEY);

vapi.start(import.meta.env.VITE_VAPI_ASSISTANT_ID);

vapi.on('message', (message) => {
  if (message.type === 'transcript') {
    console.log(`${message.role}: ${message.transcript}`);
  }
});