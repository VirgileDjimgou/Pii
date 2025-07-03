import { ref } from 'vue';
// @ts-ignore - MQTT types issue workaround
import mqtt from 'mqtt';

export function useMQTT() {
  const client = ref<mqtt.MqttClient | null>(null);
  const isConnected = ref(false);
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const error = ref<Error | null>(null);
  const subscriptions = ref<string[]>([]);
  const messages = ref<Record<string, any[]>>({});

  // Connect to MQTT broker
  const connect = (brokerUrl: string, options: mqtt.IClientOptions = {}) => {
    connectionStatus.value = 'connecting';
    
    try {
      client.value = mqtt.connect(brokerUrl, {
        ...options,
        reconnectPeriod: 1000, // Auto reconnect every second
      });

      client.value.on('connect', () => {
        isConnected.value = true;
        connectionStatus.value = 'connected';
        error.value = null;
      });

      client.value.on('error', (err: Error) => {
        error.value = err;
      });

      client.value.on('message', (topic: string, message: Buffer) => {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(message.toString());
          
          if (!messages.value[topic]) {
            messages.value[topic] = [];
          }
          
          messages.value[topic].push(parsed);
        } catch (e) {
          // If not JSON, store as string
          if (!messages.value[topic]) {
            messages.value[topic] = [];
          }
          
          messages.value[topic].push(message.toString());
        }
      });

      client.value.on('disconnect', () => {
        isConnected.value = false;
        connectionStatus.value = 'disconnected';
      });

    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      connectionStatus.value = 'disconnected';
    }
  };

  // Disconnect from MQTT broker
  const disconnect = () => {
    if (client.value && isConnected.value) {
      client.value.end();
      isConnected.value = false;
      connectionStatus.value = 'disconnected';
    }
  };

  // Subscribe to a topic
  const subscribe = (topic: string, qos: 0 | 1 | 2 = 0) => {
    if (!client.value || !isConnected.value) return;
    
    client.value.subscribe(topic, { qos }, (err: Error | null) => {
      if (!err) {
        subscriptions.value.push(topic);
      }
    });
  };

  // Unsubscribe from a topic
  const unsubscribe = (topic: string) => {
    if (!client.value || !isConnected.value) return;
    
    client.value.unsubscribe(topic, {}, (err: Error | null) => {
      if (!err) {
        subscriptions.value = subscriptions.value.filter(t => t !== topic);
      }
    });
  };

  // Publish a message to a topic
  const publish = (topic: string, message: any, qos: 0 | 1 | 2 = 0, retain: boolean = false) => {
    if (!client.value || !isConnected.value) return;
    
    const payload = typeof message === 'object' 
      ? JSON.stringify(message) 
      : message.toString();
    
    client.value.publish(topic, payload, { qos, retain });
  };

  // Clear messages for a topic
  const clearMessages = (topic?: string) => {
    if (topic) {
      messages.value[topic] = [];
    } else {
      messages.value = {};
    }
  };

  return {
    client,
    isConnected,
    connectionStatus,
    error,
    subscriptions,
    messages,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    publish,
    clearMessages
  };
}
