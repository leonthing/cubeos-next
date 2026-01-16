// ==================================================
// 센서 모니터링 페이지
// 사이트별 > 게이트웨이별 구조
// ==================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useMqtt } from '@/hooks/useMqtt';
import { siteApi, gatewayApi } from '@/lib/api';
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
  TrendingUp,
  Clock,
  Layers,
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
const SENSOR_CONFIG: Record<string, {
  icon: any;
  unit: string;
  color: string;
  bgColor: string;
  chartColor: string;
  label: string;
}> = {
  temperature: { icon: Thermometer, unit: '°C', color: 'text-red-500', bgColor: 'bg-red-100', chartColor: '#ef4444', label: '기온' },
  water_temp: { icon: Thermometer, unit: '°C', color: 'text-orange-500', bgColor: 'bg-orange-100', chartColor: '#f97316', label: '수온' },
  humidity: { icon: Droplets, unit: '%', color: 'text-blue-500', bgColor: 'bg-blue-100', chartColor: '#3b82f6', label: '습도' },
  co2: { icon: Wind, unit: 'ppm', color: 'text-green-500', bgColor: 'bg-green-100', chartColor: '#22c55e', label: 'CO2' },
  light: { icon: Lightbulb, unit: 'lux', color: 'text-yellow-500', bgColor: 'bg-yellow-100', chartColor: '#eab308', label: '조도' },
  ph: { icon: Activity, unit: 'pH', color: 'text-purple-500', bgColor: 'bg-purple-100', chartColor: '#a855f7', label: 'pH' },
  ec: { icon: Activity, unit: 'mS/cm', color: 'text-indigo-500', bgColor: 'bg-indigo-100', chartColor: '#6366f1', label: 'EC' },
  water_level: { icon: Droplets, unit: 'cm', color: 'text-cyan-500', bgColor: 'bg-cyan-100', chartColor: '#06b6d4', label: '수위' },
};

interface ChartDataPoint {
  time: string;
  timestamp: number;
  [key: string]: string | number;
}

export default function SensorsPage() {
  const { user } = useAuthStore();
  const farmId = user?.currentLocation || '';

  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [sensorGateways, setSensorGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // MQTT로 실시간 데이터 수신
  const { isConnected } = useMqtt({
    farmId,
    onSensorData: useCallback((gatewayId: string, data: any) => {
      const now = new Date();

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

      setLastUpdate(now);
    }, []),
  });

  // 데이터 로드
  const loadData = async () => {
    if (!farmId) return;

    setLoading(true);
    try {
      const [sitesRes, sensorRes] = await Promise.all([
        siteApi.getSites(farmId),
        gatewayApi.getSensorGateways(farmId),
      ]);

      const siteList = sitesRes.site || [];
      setSites(siteList);
      setSensorGateways(sensorRes.gateways || []);

      if (siteList.length > 0 && !selectedSite) {
        setSelectedSite(siteList[0].sid);
      }
    } catch (error) {
      console.error('센서 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [farmId]);

  // 선택된 사이트의 게이트웨이 필터링
  const filteredGateways = sensorGateways.filter((gw) => gw.sid === selectedSite);

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

  const getAverage = (summary: Record<string, { values: number[]; count: number }>, type: string): number | null => {
    const data = summary[type];
    if (!data || data.values.length === 0) return null;
    return data.values.reduce((a, b) => a + b, 0) / data.values.length;
  };

  // 선택된 사이트 정보
  const selectedSiteInfo = sites.find((s) => s.sid === selectedSite);
  const siteSummary = selectedSite ? getSiteSensorSummary(selectedSite) : {};

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
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">
                센서 모니터링
              </h1>
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {selectedSiteInfo?.name} - 실시간 센서 데이터
            </p>
          </div>

          <button onClick={loadData} className="btn btn-secondary flex items-center space-x-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>새로고침</span>
          </button>
        </div>

        {/* 사이트 센서 요약 - 알려진 센서 타입만 표시 */}
        {selectedSite && Object.keys(siteSummary).length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(siteSummary)
              .filter(([type]) => SENSOR_CONFIG[type]) // 알려진 센서 타입만
              .map(([type, data]) => {
                const config = SENSOR_CONFIG[type];
                const Icon = config.icon;
                const avg = data.values.length > 0
                  ? data.values.reduce((a, b) => a + b, 0) / data.values.length
                  : null;

                return (
                  <div key={type} className="card py-3 px-4 min-w-[120px]">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="text-xs text-gray-500">{config.label}</span>
                    </div>
                    <p className={`text-xl font-bold ${config.color}`}>
                      {avg !== null ? (type === 'co2' ? avg.toFixed(0) : avg.toFixed(1)) : '--'}
                      <span className="text-xs text-gray-400 ml-1">{config.unit}</span>
                    </p>
                  </div>
                );
              })}
          </div>
        )}

        {/* 게이트웨이 목록 */}
        {filteredGateways.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Layers className="w-5 h-5 mr-2" />
              센서 게이트웨이
            </h2>

            {filteredGateways.map((gateway) => {
              // 센서 타입별 그룹핑
              const sensorsByType = gateway.deviceList?.reduce((acc: any, device: any) => {
                const type = normalizeSensorType(device.dtype);
                if (!acc[type]) acc[type] = [];
                acc[type].push(device);
                return acc;
              }, {}) || {};

              return (
                <div key={gateway.gid} className="card">
                  {/* 게이트웨이 헤더 */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {gateway.name || gateway.gname || gateway.gid?.slice(0, 8) || 'Gateway'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {gateway.deviceList?.length || 0}개 센서
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {gateway.last_update
                        ? new Date(gateway.last_update).toLocaleTimeString('ko-KR')
                        : '-'}
                    </span>
                  </div>

                  {/* 센서 타입별 카드 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(sensorsByType).map(([type, devices]: [string, any]) => {
                      const config = SENSOR_CONFIG[type];
                      const Icon = config?.icon || Activity;
                      const values = devices.map((d: any) => d.status).filter((v: any) => v != null);
                      const avg = values.length > 0
                        ? values.reduce((a: number, b: number) => a + b, 0) / values.length
                        : null;
                      const min = values.length > 0 ? Math.min(...values) : null;
                      const max = values.length > 0 ? Math.max(...values) : null;

                      return (
                        <div key={type} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={`w-8 h-8 ${config?.bgColor || 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                                <Icon className={`w-4 h-4 ${config?.color || 'text-gray-500'}`} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{config?.label || type}</p>
                                <p className="text-xs text-gray-400">{devices.length}개</p>
                              </div>
                            </div>
                            <p className={`text-2xl font-bold ${config?.color || 'text-gray-700'}`}>
                              {avg !== null ? (type === 'co2' ? avg.toFixed(0) : avg.toFixed(1)) : '--'}
                              <span className="text-xs text-gray-400 ml-1">{config?.unit}</span>
                            </p>
                          </div>

                          {/* Min/Max 표시 */}
                          <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Min: {min?.toFixed(1) ?? '--'}</span>
                            <span>Max: {max?.toFixed(1) ?? '--'}</span>
                          </div>

                          {/* 개별 센서 */}
                          <div className="space-y-1">
                            {devices.map((device: any) => (
                              <div key={device.did} className="flex justify-between text-sm">
                                <span className="text-gray-600 truncate mr-2">{device.dname}</span>
                                <span className={`font-medium ${config?.color || 'text-gray-700'}`}>
                                  {device.status?.toFixed(type === 'co2' ? 0 : 1) ?? '--'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Thermometer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">이 사이트에 등록된 센서가 없습니다</p>
          </div>
        )}

        {/* 마지막 업데이트 */}
        {lastUpdate && (
          <p className="text-center text-sm text-gray-400 mt-8">
            마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
          </p>
        )}
      </div>
    </div>
  );
}
