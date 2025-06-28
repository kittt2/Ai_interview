import Vapi from '@vapi-ai/web';

const vapi = new Vapi(import.meta.env.Vapitokenapi);

vapi.start(import.meta.env.VITE_VAPI_ASSI);

vapi.on('message', (message) => {
  if (message.type === 'transcript') {
    console.log(`${message.role}: ${message.transcript}`);
  }
});