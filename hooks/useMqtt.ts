// ==================================================
// MQTT 연동 훅
// 센서 및 컨트롤러 실시간 데이터 수신
// ==================================================

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import mqtt, { MqttClient, IClientOptions } from 'mqtt';

// MQTT 브로커 설정
const MQTT_HOST = process.env.NEXT_PUBLIC_MQTT_HOST || 'wss://hamqtt.nthing.link:8084/mqtt';
const MQTT_ENABLED = process.env.NEXT_PUBLIC_MQTT_ENABLED !== 'false'; // 기본값: 활성화

/**
 * MQTT 메시지 타입
 */
interface MqttMessage {
  topic: string;
  gatewayId: string;
  type: 'sensor' | 'controller';
  action: 'sensors' | 'ack' | 'update' | 'status';
  data: any;
}

/**
 * 센서 데이터 메시지
 */
interface SensorMessage {
  sensor_type: string;
  sensor_val: number;
  res_time: number;
}

/**
 * 컨트롤러 상태 메시지
 */
interface ControllerUpdateMessage {
  ctr_ch: number;
  switch_state: 'true' | 'false';
}

/**
 * 컨트롤러 상태 정보 메시지
 */
interface ControllerStatusMessage {
  firmware_version: string;
  res_time: number;
  target_ch_num: number;
}

/**
 * MQTT 훅 옵션
 */
interface UseMqttOptions {
  farmId: string;
  onSensorData?: (gatewayId: string, data: SensorMessage) => void;
  onControllerUpdate?: (gatewayId: string, data: ControllerUpdateMessage) => void;
  onControllerStatus?: (gatewayId: string, data: ControllerStatusMessage) => void;
  onAck?: (gatewayId: string, data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * MQTT 연결 및 데이터 수신 훅
 * 
 * @example
 * ```tsx
 * const { isConnected, connectionStatus } = useMqtt({
 *   farmId: 'seoul',
 *   onSensorData: (gatewayId, data) => {
 *     console.log(`센서 데이터 수신: ${gatewayId}`, data);
 *   },
 *   onControllerUpdate: (gatewayId, data) => {
 *     console.log(`컨트롤러 상태 변경: ${gatewayId}`, data);
 *   },
 * });
 * ```
 */
export function useMqtt(options: UseMqttOptions) {
  const {
    farmId,
    onSensorData,
    onControllerUpdate,
    onControllerStatus,
    onAck,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const clientRef = useRef<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // 토픽 목록 생성
  const getTopics = useCallback((location: string) => [
    `${location}/sensor_gateway/+/res/sensors`,      // 센서 데이터
    `${location}/sensor_gateway/+/res/ack`,          // 센서 응답
    `${location}/controller_gateway/+/res/update`,   // 컨트롤러 상태 변경
    `${location}/controller_gateway/+/res/status`,   // 컨트롤러 상태 정보
    `${location}/controller_gateway/+/res/ack`,      // 컨트롤러 응답
  ], []);

  // 메시지 파싱
  const parseMessage = useCallback((topic: string, payload: Buffer): MqttMessage | null => {
    try {
      const parts = topic.split('/');
      // 토픽 형식: {location}/{gateway_type}/{gateway_id}/res/{action}
      const gatewayType = parts[1]; // sensor_gateway 또는 controller_gateway
      const gatewayId = parts[2];
      const action = parts[4];

      const data = JSON.parse(payload.toString());

      return {
        topic,
        gatewayId,
        type: gatewayType.includes('sensor') ? 'sensor' : 'controller',
        action: action as MqttMessage['action'],
        data,
      };
    } catch (error) {
      console.error('MQTT 메시지 파싱 실패:', error);
      return null;
    }
  }, []);

  // 메시지 핸들러
  const handleMessage = useCallback((topic: string, payload: Buffer) => {
    const message = parseMessage(topic, payload);
    if (!message) return;

    const { type, action, gatewayId, data } = message;

    if (type === 'sensor') {
      if (action === 'sensors' && onSensorData) {
        onSensorData(gatewayId, data);
      } else if (action === 'ack' && onAck) {
        onAck(gatewayId, data);
      }
    } else if (type === 'controller') {
      if (action === 'update' && onControllerUpdate) {
        onControllerUpdate(gatewayId, data);
      } else if (action === 'status' && onControllerStatus) {
        onControllerStatus(gatewayId, data);
      } else if (action === 'ack' && onAck) {
        onAck(gatewayId, data);
      }
    }
  }, [parseMessage, onSensorData, onControllerUpdate, onControllerStatus, onAck]);

  // MQTT 연결
  useEffect(() => {
    if (!farmId) return;

    // MQTT 비활성화 시 연결하지 않음
    if (!MQTT_ENABLED) {
      console.log('MQTT 비활성화됨 (NEXT_PUBLIC_MQTT_ENABLED=false)');
      return;
    }

    setConnectionStatus('connecting');

    // MQTT 클라이언트 옵션
    const mqttOptions: IClientOptions = {
      clientId: `cubeos-web-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      protocolVersion: 4,  // MQTT 3.1.1
      // WebSocket 옵션
      wsOptions: {
        protocols: ['mqtt'],  // Sec-WebSocket-Protocol 헤더
      },
    };

    // MQTT 연결
    const client = mqtt.connect(MQTT_HOST, mqttOptions);
    clientRef.current = client;

    // 연결 성공
    client.on('connect', () => {
      console.log(`MQTT 연결 성공: ${farmId}`);
      setIsConnected(true);
      setConnectionStatus('connected');

      // 토픽 구독
      const topics = getTopics(farmId);
      client.subscribe(topics, { qos: 0 }, (err) => {
        if (err) {
          console.error('MQTT 구독 실패:', err);
        } else {
          console.log('MQTT 토픽 구독 완료:', topics);
        }
      });

      onConnect?.();
    });

    // 연결 종료
    client.on('close', () => {
      console.log('MQTT 연결 종료');
      setIsConnected(false);
      setConnectionStatus('disconnected');
      onDisconnect?.();
    });

    // 재연결
    client.on('reconnect', () => {
      console.log('MQTT 재연결 시도 중...');
      setConnectionStatus('connecting');
    });

    // 에러
    client.on('error', (err) => {
      console.error('MQTT 에러:', err);
      setConnectionStatus('error');
      onError?.(err);
    });

    // 메시지 수신
    client.on('message', handleMessage);

    // 클린업
    return () => {
      if (client.connected) {
        client.end();
      }
    };
  }, [farmId, getTopics, handleMessage, onConnect, onDisconnect, onError]);

  return {
    isConnected,
    connectionStatus,
    client: clientRef.current,
  };
}

export default useMqtt;
