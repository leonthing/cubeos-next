// ==================================================
// 컨트롤러 제어 페이지
// 사이트별 > 게이트웨이별 > 장치 타입별 구조
// ==================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useMqtt } from '@/hooks/useMqtt';
import { siteApi, gatewayApi, deviceApi } from '@/lib/api';
import { toast } from '@/lib/toastStore';
import { CONTROLLER_CONFIG } from '@/lib/constants';
import {
  Power,
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  BarChart3,
  Loader2,
  ChevronRight,
} from 'lucide-react';

export default function ControllersPage() {
  const { user } = useAuthStore();
  const farmId = user?.currentLocation || '';

  // 상태
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [controllerGateways, setControllerGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [controlling, setControlling] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // MQTT로 실시간 상태 업데이트
  const { isConnected } = useMqtt({
    farmId,
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

  // 초기 데이터 로드
  const loadData = async () => {
    if (!farmId) return;

    setLoading(true);
    try {
      // 사이트 목록 로드
      const sitesRes = await siteApi.getSites(farmId);
      const siteList = sitesRes.site || [];
      setSites(siteList);

      // 컨트롤러 게이트웨이 로드
      const response = await gatewayApi.getControllerGateways(farmId);
      setControllerGateways(response.gateways || []);

      // 첫 번째 사이트 선택
      if (siteList.length > 0 && !selectedSite) {
        setSelectedSite(siteList[0].sid);
      }
    } catch (error) {
      console.error('컨트롤러 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [farmId]);

  // 선택된 사이트의 게이트웨이 필터링
  const filteredGateways = controllerGateways.filter(
    (gw) => gw.sid === selectedSite
  );

  // 장치 제어
  const handleControl = async (gateway: any, device: any, newState: boolean) => {
    const controlKey = `${device.did}-switch`;
    setControlling(controlKey);

    try {
      const controlData = {
        gid: gateway.gid,
        did: device.did,
        num: device.num,
        command: newState,
        dtype: device.dtype,
      };

      // 원본 CubeOS와 동일하게 모든 장치에 switchControl 사용
      await deviceApi.switchControl(farmId, controlData);

      // 즉시 UI 업데이트
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
      toast.error('장치 제어에 실패했습니다.');
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
      toast.error('모드 변경에 실패했습니다.');
    } finally {
      setControlling(null);
    }
  };

  // 선택된 사이트의 장치 통계
  const getSiteStats = () => {
    const devices = filteredGateways.flatMap((gw) => gw.deviceList || []);
    return {
      total: devices.length,
      on: devices.filter((d: any) => d.status === 1).length,
      auto: devices.filter((d: any) => d.mode === 'auto').length,
    };
  };

  const stats = getSiteStats();

  // 선택된 사이트 정보
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
      <div className="w-48 bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Sites
          </h3>
          <div className="space-y-1">
            {sites.map((site) => {
              const isSelected = site.sid === selectedSite;
              const siteGateways = controllerGateways.filter((gw) => gw.sid === site.sid);
              const deviceCount = siteGateways.reduce(
                (sum, gw) => sum + (gw.deviceList?.length || 0),
                0
              );

              return (
                <button
                  key={site.sid}
                  onClick={() => setSelectedSite(site.sid)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{site.name}</span>
                  {deviceCount > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-blue-200' : 'bg-gray-200'
                    }`}>
                      {deviceCount}
                    </span>
                  )}
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
                Site {selectedSiteInfo?.name || ''}
              </h1>
              {/* MQTT 연결 상태 */}
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  isConnected
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {isConnected ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total}개 장치 · {stats.on}개 가동 중 · {stats.auto}개 자동
            </p>
          </div>

          <button
            onClick={loadData}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>새로고침</span>
          </button>
        </div>

        {/* 게이트웨이 목록 */}
        {filteredGateways.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Gateways</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGateways.map((gateway) => (
                <div key={gateway.gid} className="card">
                  {/* 게이트웨이 헤더 */}
                  <div className="border-b border-gray-100 pb-3 mb-4">
                    <h3 className="font-semibold text-gray-900 uppercase">
                      {gateway.name || gateway.gname || gateway.gid?.slice(0, 8) || 'Gateway'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {gateway.deviceList?.length || 0}개 장치
                    </p>
                  </div>

                  {/* 장치 목록 */}
                  <div className="space-y-4">
                    {gateway.deviceList?.map((device: any) => {
                      const dtype = device.dtype?.toLowerCase() || 'switch';
                      const config = CONTROLLER_CONFIG[dtype] || CONTROLLER_CONFIG.switch;
                      const Icon = config.icon;
                      const isOn = device.status === 1;
                      const isAuto = device.mode === 'auto';
                      const isSwitchControlling = controlling === `${device.did}-switch`;
                      const isModeControlling = controlling === `${device.did}-mode`;

                      return (
                        <div
                          key={device.did}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          {/* 장치 정보 */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${config.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {config.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {isAuto ? 'Auto' : 'Manual'}
                              </p>
                            </div>
                          </div>

                          {/* 컨트롤 영역 */}
                          <div className="flex items-center space-x-3">
                            {/* ON/OFF 토글 */}
                            <button
                              onClick={() => handleControl(gateway, device, !isOn)}
                              disabled={isSwitchControlling}
                              className={`relative w-12 h-6 rounded-full transition-colors ${
                                isOn ? 'bg-green-500' : 'bg-gray-300'
                              } ${isSwitchControlling ? 'opacity-50' : ''}`}
                            >
                              {isSwitchControlling ? (
                                <Loader2 className="w-4 h-4 text-white absolute top-1 left-1/2 -translate-x-1/2 animate-spin" />
                              ) : (
                                <span
                                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                    isOn ? 'translate-x-6' : 'translate-x-0.5'
                                  }`}
                                />
                              )}
                            </button>

                            {/* Settings 버튼 */}
                            <button
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Settings"
                            >
                              <Settings className="w-4 h-4" />
                            </button>

                            {/* Graph 버튼 */}
                            <button
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Graph"
                            >
                              <BarChart3 className="w-4 h-4" />
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
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Power className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">이 사이트에 등록된 컨트롤러가 없습니다</p>
          </div>
        )}

        {/* 마지막 업데이트 */}
        {lastUpdate && (
          <p className="text-center text-sm text-gray-400 mt-8">
            마지막 상태 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
          </p>
        )}
      </div>
    </div>
  );
}
