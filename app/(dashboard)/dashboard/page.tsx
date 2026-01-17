// ==================================================
// 대시보드 메인 페이지
// 사이드바 형태로 사이트 선택
// ==================================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useMqtt } from '@/hooks/useMqtt';
import { siteApi, gatewayApi, logApi, deviceApi } from '@/lib/api';
import Hls from 'hls.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Thermometer,
  Droplets,
  Wind,
  Lightbulb,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  Layers,
  Power,
  Snowflake,
  Fan,
  Zap,
  Settings,
  BarChart3,
  Video,
  X,
  Loader2,
} from 'lucide-react';

// 센서 타입 정규화
const normalizeSensorType = (dtype: string): string => {
  const type = dtype.toLowerCase();

  if (type.includes('water_temp') || type === 'water_temperature') return 'water_temp';
  if (type.includes('air_temp') || type === 'tmp' || type === '온도' || type === 'temperature') return 'temperature';
  if (type.includes('temp')) return 'temperature';
  if (type.includes('humid') || type === 'hum' || type === '습도') return 'humidity';
  if (type.includes('co2') || type === 'carbon') return 'co2';
  if (type.includes('ph')) return 'ph';
  if (type.includes('ec') || type.includes('conductivity')) return 'ec';
  if (type.includes('light') || type.includes('lux') || type === '조도') return 'light';
  if (type.includes('level') || type === '수위') return 'water_level';

  return type;
};

// 센서 타입별 설정
const SENSOR_CONFIG: Record<string, { icon: any; unit: string; color: string; label: string }> = {
  temperature: { icon: Thermometer, unit: '°C', color: 'text-red-500', label: '기온' },
  water_temp: { icon: Thermometer, unit: '°C', color: 'text-orange-500', label: '수온' },
  humidity: { icon: Droplets, unit: '%', color: 'text-blue-500', label: '습도' },
  co2: { icon: Wind, unit: 'ppm', color: 'text-green-500', label: 'CO2' },
  light: { icon: Lightbulb, unit: 'lux', color: 'text-yellow-500', label: '조도' },
  ph: { icon: Activity, unit: 'pH', color: 'text-purple-500', label: 'pH' },
  ec: { icon: Activity, unit: 'mS/cm', color: 'text-indigo-500', label: 'EC' },
  water_level: { icon: Droplets, unit: 'm', color: 'text-cyan-500', label: '수위' },
};

// 컨트롤러 타입별 설정
const CONTROLLER_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  led: { icon: Lightbulb, color: 'text-yellow-500', bgColor: 'bg-yellow-100', label: 'LED' },
  pump: { icon: Droplets, color: 'text-blue-500', bgColor: 'bg-blue-100', label: 'PUMP' },
  water: { icon: Droplets, color: 'text-cyan-500', bgColor: 'bg-cyan-100', label: 'WATER' },
  ac: { icon: Snowflake, color: 'text-indigo-500', bgColor: 'bg-indigo-100', label: 'AC' },
  heater: { icon: Thermometer, color: 'text-red-500', bgColor: 'bg-red-100', label: 'HEATER' },
  freezer: { icon: Snowflake, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'FREEZER' },
  humid: { icon: Wind, color: 'text-teal-500', bgColor: 'bg-teal-100', label: 'HUMID' },
  ventilator: { icon: Fan, color: 'text-green-500', bgColor: 'bg-green-100', label: 'VENTILATOR' },
  co2: { icon: Wind, color: 'text-emerald-500', bgColor: 'bg-emerald-100', label: 'CO2' },
  doser: { icon: Zap, color: 'text-purple-500', bgColor: 'bg-purple-100', label: 'DOSER' },
  switch: { icon: Power, color: 'text-gray-500', bgColor: 'bg-gray-100', label: 'SWITCH' },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const farmId = user?.currentLocation || '';

  const [sites, setSites] = useState<any[]>([]);
  const [sensorGateways, setSensorGateways] = useState<any[]>([]);
  const [controllerGateways, setControllerGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [cameraModal, setCameraModal] = useState<{ open: boolean; url: string; name: string }>({
    open: false,
    url: '',
    name: '',
  });
  const [graphModal, setGraphModal] = useState<{ open: boolean; gateway: any; name: string }>({
    open: false,
    gateway: null,
    name: '',
  });
  const [controlling, setControlling] = useState<string | null>(null);

  // 장치 제어
  const handleControl = async (gateway: any, device: any, newState: boolean) => {
    const controlKey = `${device.did}-switch`;
    setControlling(controlKey);

    try {
      const dtype = device.dtype?.toLowerCase() || 'switch';
      const controlData = {
        gid: gateway.gid,
        did: device.did,
        num: device.num,
        command: newState,
        dtype: device.dtype,
      };

      switch (dtype) {
        case 'led':
          await deviceApi.ledControl(farmId, controlData);
          break;
        case 'pump':
          await deviceApi.pumpControl(farmId, controlData);
          break;
        case 'ac':
          await deviceApi.acControl(farmId, controlData);
          break;
        default:
          await deviceApi.switchControl(farmId, controlData);
      }

      // UI 즉시 업데이트
      setControllerGateways((prev) =>
        prev.map((gw) => ({
          ...gw,
          deviceList: gw.deviceList.map((d: any) =>
            d.did === device.did ? { ...d, status: newState ? 1 : 0 } : d
          ),
        }))
      );
    } catch (error) {
      console.error('장치 제어 실패:', error);
      alert('장치 제어에 실패했습니다.');
    } finally {
      setControlling(null);
    }
  };

  // 자동/수동 모드 전환
  const handleModeChange = async (gateway: any, device: any, auto: boolean) => {
    const controlKey = `${device.did}-mode`;
    setControlling(controlKey);

    try {
      await deviceApi.setAutoMode(farmId, {
        gid: gateway.gid,
        did: device.did,
        num: device.num,
        auto,
      });

      // UI 업데이트
      setControllerGateways((prev) =>
        prev.map((gw) => ({
          ...gw,
          deviceList: gw.deviceList.map((d: any) =>
            d.did === device.did ? { ...d, mode: auto ? 'auto' : 'manual' } : d
          ),
        }))
      );
    } catch (error) {
      console.error('모드 변경 실패:', error);
      alert('모드 변경에 실패했습니다.');
    } finally {
      setControlling(null);
    }
  };

  // MQTT 연결
  const { isConnected } = useMqtt({
    farmId,
    onSensorData: useCallback((gatewayId: string, data: any) => {
      setSensorGateways((prev) =>
        prev.map((gw) => {
          if (gw.gid !== gatewayId) return gw;
          return {
            ...gw,
            last_update: data.res_time * 1000,
            deviceList: gw.deviceList.map((device: any) =>
              normalizeSensorType(device.dtype) === data.sensor_type
                ? { ...device, status: data.sensor_val, res_date: data.res_time * 1000 }
                : device
            ),
          };
        })
      );
      setLastUpdate(new Date());
    }, []),
    onControllerUpdate: useCallback((gatewayId: string, data: any) => {
      setControllerGateways((prev) =>
        prev.map((gw) => {
          if (gw.gid !== gatewayId) return gw;
          return {
            ...gw,
            deviceList: gw.deviceList.map((device: any) =>
              device.num === data.ctr_ch
                ? { ...device, status: data.switch_state === 'true' ? 1 : 0 }
                : device
            ),
          };
        })
      );
      setLastUpdate(new Date());
    }, []),
  });

  // 데이터 로드
  const loadData = async () => {
    if (!farmId) return;

    setLoading(true);
    try {
      const [sitesRes, sensorRes, controllerRes] = await Promise.all([
        siteApi.getSites(farmId),
        gatewayApi.getSensorGateways(farmId),
        gatewayApi.getControllerGateways(farmId),
      ]);

      const siteList = sitesRes.site || [];
      setSites(siteList);
      setSensorGateways(sensorRes.gateways || []);
      setControllerGateways(controllerRes.gateways || []);

      if (siteList.length > 0 && !selectedSite) {
        setSelectedSite(siteList[0].sid);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [farmId]);

  // 사이트별 센서 요약
  const getSiteSensorSummary = (siteId: string) => {
    const siteGateways = sensorGateways.filter((gw) => gw.sid === siteId);
    const summary: Record<string, { values: number[]; count: number }> = {};

    siteGateways.forEach((gw) => {
      gw.deviceList?.forEach((device: any) => {
        const type = normalizeSensorType(device.dtype);
        if (!summary[type]) summary[type] = { values: [], count: 0 };
        if (device.status !== undefined && device.status !== null) {
          summary[type].values.push(device.status);
          summary[type].count++;
        }
      });
    });

    return summary;
  };

  // 사이트별 컨트롤러 요약
  const getSiteControllerSummary = (siteId: string) => {
    const siteGateways = controllerGateways.filter((gw) => gw.sid === siteId);
    let total = 0, on = 0;

    siteGateways.forEach((gw) => {
      gw.deviceList?.forEach((device: any) => {
        total++;
        if (device.status === 1) on++;
      });
    });

    return { total, on };
  };

  const getAverage = (summary: Record<string, { values: number[]; count: number }>, type: string): number | null => {
    const data = summary[type];
    if (!data || data.values.length === 0) return null;
    return data.values.reduce((a, b) => a + b, 0) / data.values.length;
  };

  // 전체 요약
  const totalSensorSummary = sensorGateways.reduce((acc, gw) => {
    gw.deviceList?.forEach((device: any) => {
      const type = normalizeSensorType(device.dtype);
      if (!acc[type]) acc[type] = { values: [], count: 0 };
      if (device.status !== undefined && device.status !== null) {
        acc[type].values.push(device.status);
        acc[type].count++;
      }
    });
    return acc;
  }, {} as Record<string, { values: number[]; count: number }>);

  const totalControllerSummary = {
    total: controllerGateways.reduce((acc, gw) => acc + (gw.deviceList?.length || 0), 0),
    on: controllerGateways.reduce(
      (acc, gw) => acc + (gw.deviceList?.filter((d: any) => d.status === 1).length || 0),
      0
    ),
  };

  // 선택된 사이트 정보
  const selectedSiteSensors = sensorGateways.filter((gw) => gw.sid === selectedSite);
  const selectedSiteControllers = controllerGateways.filter((gw) => gw.sid === selectedSite);
  const selectedSiteInfo = sites.find((s) => s.sid === selectedSite);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-12 h-12"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* 사이드바: 사이트 목록 */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Sites
          </h3>
          <div className="space-y-1">
            {sites.map((site) => {
              const isSelected = site.sid === selectedSite;
              const summary = getSiteSensorSummary(site.sid);
              const temp = getAverage(summary, 'temperature');
              const humid = getAverage(summary, 'humidity');

              return (
                <button
                  key={site.sid}
                  onClick={() => setSelectedSite(site.sid)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{site.name}</div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                    {temp !== null ? `${temp.toFixed(1)}°C` : '--'} / {humid !== null ? `${humid.toFixed(0)}%` : '--'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
            <p className="text-gray-500 text-sm mt-1">{farmId.toUpperCase()} 농장 현황</p>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs ${
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isConnected ? '연결됨' : '끊김'}</span>
            </div>

            <button onClick={loadData} className="btn btn-secondary flex items-center space-x-2 text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>새로고침</span>
            </button>
          </div>
        </div>

        {/* 전체 요약 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card py-4">
            <p className="text-xs text-gray-500 mb-1">전체 기온</p>
            <p className="text-2xl font-bold text-red-500">
              {getAverage(totalSensorSummary, 'temperature')?.toFixed(1) ?? '--'}
              <span className="text-sm text-gray-400 ml-1">°C</span>
            </p>
          </div>
          <div className="card py-4">
            <p className="text-xs text-gray-500 mb-1">전체 습도</p>
            <p className="text-2xl font-bold text-blue-500">
              {getAverage(totalSensorSummary, 'humidity')?.toFixed(1) ?? '--'}
              <span className="text-sm text-gray-400 ml-1">%</span>
            </p>
          </div>
          <div className="card py-4">
            <p className="text-xs text-gray-500 mb-1">전체 CO2</p>
            <p className="text-2xl font-bold text-green-500">
              {getAverage(totalSensorSummary, 'co2')?.toFixed(0) ?? '--'}
              <span className="text-sm text-gray-400 ml-1">ppm</span>
            </p>
          </div>
          <div className="card py-4">
            <p className="text-xs text-gray-500 mb-1">컨트롤러</p>
            <p className="text-2xl font-bold text-gray-700">
              {totalControllerSummary.on}
              <span className="text-sm text-gray-400 ml-1">/{totalControllerSummary.total}</span>
            </p>
          </div>
        </div>

        {/* 선택된 사이트 상세 */}
        {selectedSite && selectedSiteInfo && (
          <>
            {/* 사이트 헤더 */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="font-bold text-blue-600 text-lg">{selectedSiteInfo.name}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedSiteInfo.name} - {selectedSiteInfo.stype || 'WORKING'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      센서 {selectedSiteSensors.length}개 / 컨트롤러 {selectedSiteControllers.length}개 게이트웨이
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* CAM 버튼 */}
                  {selectedSiteInfo.camera && (
                    <button
                      onClick={() => setCameraModal({ open: true, url: selectedSiteInfo.camera, name: selectedSiteInfo.name })}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Video className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">CAM</span>
                    </button>
                  )}
                  <span className="badge badge-success">정상</span>
                </div>
              </div>

              {/* 사이트 센서 요약 */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {(() => {
                  const summary = getSiteSensorSummary(selectedSite);
                  return Object.entries(summary).map(([type, data]) => {
                    const config = SENSOR_CONFIG[type];
                    const Icon = config?.icon || Activity;
                    const avg = data.values.length > 0
                      ? data.values.reduce((a, b) => a + b, 0) / data.values.length
                      : null;

                    return (
                      <div key={type} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon className={`w-4 h-4 ${config?.color || 'text-gray-500'}`} />
                          <span className="text-xs text-gray-500">{config?.label || type}</span>
                        </div>
                        <p className={`text-xl font-bold ${config?.color || 'text-gray-700'}`}>
                          {avg !== null ? (type === 'co2' ? avg.toFixed(0) : avg.toFixed(1)) : '--'}
                          <span className="text-xs text-gray-400 ml-1">{config?.unit || ''}</span>
                        </p>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* 센서 게이트웨이 */}
            {selectedSiteSensors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <Layers className="w-4 h-4 mr-2" />
                  센서 게이트웨이
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {selectedSiteSensors.map((gateway) => (
                    <div key={gateway.gid} className="card">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{gateway.name || gateway.gname || gateway.gid?.slice(0, 8) || 'Gateway'}</h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setGraphModal({
                              open: true,
                              gateway,
                              name: gateway.name || gateway.gname || gateway.gid?.slice(0, 8) || 'Gateway'
                            })}
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          >
                            See graph
                          </button>
                          <span className="text-xs text-gray-400">
                            {gateway.last_update
                              ? new Date(gateway.last_update).toLocaleTimeString('ko-KR')
                              : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {gateway.deviceList?.map((device: any) => {
                          const normalizedType = normalizeSensorType(device.dtype);
                          const config = SENSOR_CONFIG[normalizedType];
                          const Icon = config?.icon || Activity;

                          return (
                            <div key={device.did} className="bg-gray-50 rounded-lg p-2">
                              <div className="flex items-center space-x-1 mb-1">
                                <Icon className={`w-3 h-3 ${config?.color || 'text-gray-500'}`} />
                                <span className="text-xs text-gray-500 truncate">{config?.label || device.dtype}</span>
                              </div>
                              <p className={`text-lg font-bold ${config?.color || 'text-gray-700'}`}>
                                {device.status !== undefined && device.status !== null
                                  ? typeof device.status === 'number'
                                    ? device.status.toFixed(normalizedType === 'co2' ? 0 : 1)
                                    : device.status
                                  : '--'}
                                <span className="text-xs text-gray-400 ml-1">{config?.unit || ''}</span>
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 컨트롤러 게이트웨이 */}
            {selectedSiteControllers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <Power className="w-4 h-4 mr-2" />
                  컨트롤러 게이트웨이
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {selectedSiteControllers.map((gateway) => (
                    <div key={gateway.gid} className="card">
                      {/* 게이트웨이 헤더 */}
                      <div className="border-b border-gray-100 pb-2 mb-3">
                        <h4 className="font-semibold text-gray-900 uppercase text-sm">
                          {gateway.name || gateway.gname || gateway.gid?.slice(0, 8) || 'Gateway'}
                        </h4>
                      </div>

                      {/* 장치 목록 */}
                      <div className="space-y-3">
                        {gateway.deviceList?.map((device: any) => {
                          const dtype = device.dtype?.toLowerCase() || 'switch';
                          const config = CONTROLLER_CONFIG[dtype] || CONTROLLER_CONFIG.switch;
                          const Icon = config.icon;
                          const isOn = device.status === 1;
                          const isAuto = device.mode === 'auto';
                          const isSwitchControlling = controlling === `${device.did}-switch`;
                          const isModeControlling = controlling === `${device.did}-mode`;

                          return (
                            <div key={device.did} className="bg-gray-50 rounded-lg p-3">
                              {/* 상단: 아이콘, 라벨, 토글 */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Icon className={`w-5 h-5 ${config.color}`} />
                                  <span className="font-medium text-gray-800 text-sm">
                                    {config.label}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {/* ON/OFF 토글 */}
                                  <button
                                    onClick={() => handleControl(gateway, device, !isOn)}
                                    disabled={isSwitchControlling}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${
                                      isOn ? 'bg-green-400' : 'bg-gray-300'
                                    } ${isSwitchControlling ? 'opacity-50' : 'cursor-pointer hover:opacity-80'}`}
                                  >
                                    {isSwitchControlling ? (
                                      <Loader2 className="w-3 h-3 text-white absolute top-1 left-1/2 -translate-x-1/2 animate-spin" />
                                    ) : (
                                      <span
                                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                          isOn ? 'translate-x-5' : 'translate-x-0.5'
                                        }`}
                                      />
                                    )}
                                  </button>
                                  {/* Auto/Manual 토글 */}
                                  <button
                                    onClick={() => handleModeChange(gateway, device, !isAuto)}
                                    disabled={isModeControlling}
                                    className={`text-xs w-14 py-0.5 rounded ${
                                      isAuto
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-200 text-gray-600'
                                    } ${isModeControlling ? 'opacity-50' : 'hover:opacity-80 cursor-pointer'}`}
                                  >
                                    {isModeControlling ? '...' : isAuto ? 'Auto' : 'Manual'}
                                  </button>
                                </div>
                              </div>

                              {/* 하단: Settings, Graph 버튼 */}
                              <div className="flex space-x-2">
                                <button className="flex-1 px-2 py-1 text-xs text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors">
                                  Settings
                                </button>
                                <button className="flex-1 px-2 py-1 text-xs text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-100 transition-colors">
                                  Graph
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 마지막 업데이트 */}
        {lastUpdate && (
          <p className="text-center text-sm text-gray-400">
            마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
          </p>
        )}
      </div>

      {/* 카메라 모달 */}
      {cameraModal.open && (
        <CameraModal
          url={cameraModal.url}
          name={cameraModal.name}
          onClose={() => setCameraModal({ open: false, url: '', name: '' })}
        />
      )}

      {/* 그래프 모달 */}
      {graphModal.open && graphModal.gateway && (
        <SensorGraphModal
          gateway={graphModal.gateway}
          name={graphModal.name}
          farmId={farmId}
          onClose={() => setGraphModal({ open: false, gateway: null, name: '' })}
        />
      )}
    </div>
  );
}

// 카메라 모달 컴포넌트
function CameraModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-white rounded-lg overflow-hidden max-w-4xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 비디오 영역 */}
        <div className="bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            autoPlay
            muted
            playsInline
          />
        </div>
      </div>
    </div>
  );
}

// 기간 옵션
const PERIOD_OPTIONS = [
  { label: 'Today', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '10 Days', days: 10 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

// 센서 타입별 차트 색상
const CHART_COLORS: Record<string, string> = {
  temperature: '#ef4444',
  humidity: '#3b82f6',
  co2: '#22c55e',
  water_temp: '#f97316',
  ph: '#a855f7',
  ec: '#6366f1',
  light: '#eab308',
  water_level: '#06b6d4',
};

// 센서 그래프 모달 컴포넌트
function SensorGraphModal({
  gateway,
  name,
  farmId,
  onClose,
}: {
  gateway: any;
  name: string;
  farmId: string;
  onClose: () => void;
}) {
  const [period, setPeriod] = useState(3);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [sensorTypes, setSensorTypes] = useState<string[]>([]);

  // 센서 로그 데이터 로드
  useEffect(() => {
    const loadSensorLogs = async () => {
      if (!gateway?.deviceList || gateway.deviceList.length === 0) return;

      setLoading(true);
      try {
        const endTime = Date.now();
        const startTime = endTime - (period * 24 * 60 * 60 * 1000);

        // 각 센서 디바이스별로 로그 가져오기
        console.log('센서 로그 요청:', { startTime, endTime, gatewayId: gateway.gid });
        const deviceLogs = await Promise.all(
          gateway.deviceList.map(async (device: any) => {
            try {
              const response = await logApi.getSensorLogs({
                farmId,
                gatewayId: gateway.gid,
                deviceId: device.did,
                startTime,
                endTime,
              });
              console.log(`센서 로그 응답 (${device.did}):`, response);
              // 응답 형식: { status: 'success', result: { data: [...] } }
              const logs = response.result?.data || response.result || response.data || response;
              return {
                device,
                logs: Array.isArray(logs) ? logs : [],
              };
            } catch (error) {
              console.error(`센서 로그 로드 실패 (${device.did}):`, error);
              return { device, logs: [] };
            }
          })
        );

        // 데이터 변환 및 병합
        const dataMap = new Map<number, any>();
        const types = new Set<string>();

        // 기간에 따른 그룹핑 간격 (밀리초)
        const groupInterval = period <= 1 ? 600000 : // Today: 10분
                              period <= 3 ? 1800000 : // 3 Days: 30분
                              period <= 7 ? 3600000 : // 7 Days: 1시간
                              period <= 30 ? 21600000 : // 30 Days: 6시간
                              43200000; // 90 Days: 12시간

        deviceLogs.forEach(({ device, logs }) => {
          const normalizedType = normalizeSensorType(device.dtype);
          types.add(normalizedType);

          logs.forEach((log: any) => {
            // receiveTime은 이미 밀리초 단위
            const timestamp = log.receiveTime || (log.res_time ? log.res_time * 1000 : null) || log.timestamp || Date.now();
            const groupedTimestamp = Math.floor(timestamp / groupInterval) * groupInterval;

            if (!dataMap.has(groupedTimestamp)) {
              dataMap.set(groupedTimestamp, { timestamp: groupedTimestamp, counts: {} });
            }

            const entry = dataMap.get(groupedTimestamp);
            const value = log.value ?? log.sensor_val ?? log.sensorVal ?? log.status;
            if (value !== undefined && value !== null) {
              // 같은 시간대의 값은 평균 계산을 위해 합계와 카운트 저장
              if (entry[normalizedType] !== undefined) {
                entry[normalizedType] += Number(value);
                entry.counts[normalizedType] = (entry.counts[normalizedType] || 1) + 1;
              } else {
                entry[normalizedType] = Number(value);
                entry.counts[normalizedType] = 1;
              }
            }
          });
        });

        // 평균 계산
        dataMap.forEach((entry) => {
          Object.keys(entry.counts || {}).forEach((type) => {
            if (entry.counts[type] > 1) {
              entry[type] = entry[type] / entry.counts[type];
            }
          });
          delete entry.counts;
        });

        // 시간순 정렬
        const sortedData = Array.from(dataMap.values())
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((entry) => ({
            ...entry,
            time: new Date(entry.timestamp).toLocaleString('ko-KR', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }));

        setChartData(sortedData);
        setSensorTypes(Array.from(types));
      } catch (error) {
        console.error('센서 로그 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSensorLogs();
  }, [gateway, farmId, period]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-white rounded-lg overflow-hidden max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">{name} - Sensor Graph</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 기간 선택 */}
        <div className="flex items-center justify-center space-x-2 p-4 border-b border-gray-100">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.days}
              onClick={() => setPeriod(option.days)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                period === option.days
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 범례 */}
        <div className="flex items-center justify-center flex-wrap gap-4 px-4 py-2 border-b border-gray-100">
          {sensorTypes.map((type) => {
            const config = SENSOR_CONFIG[type];
            return (
              <div key={type} className="flex items-center space-x-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[type] || '#888' }}
                />
                <span className="text-xs text-gray-600">
                  {config?.label || type} ({config?.unit || ''})
                </span>
              </div>
            );
          })}
        </div>

        {/* 차트 영역 */}
        <div className="flex-1 p-4 min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="spinner w-8 h-8"></div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              데이터가 없습니다
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend />
                {sensorTypes.map((type) => {
                  const config = SENSOR_CONFIG[type];
                  return (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey={type}
                      name={`${config?.label || type} (${config?.unit || ''})`}
                      stroke={CHART_COLORS[type] || '#888'}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
