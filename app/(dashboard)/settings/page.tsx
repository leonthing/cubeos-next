// ==================================================
// 설정 페이지
// 사이트 관리, 게이트웨이 관리, 계정 설정
// ==================================================

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { siteApi, gatewayApi, authApi, firmwareApi } from '@/lib/api';
import {
  Settings,
  Building2,
  Cpu,
  User,
  Bell,
  Shield,
  Save,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Wifi,
  WifiOff,
  Zap,
  Lightbulb,
  Gauge,
  Upload,
  Download,
  HardDrive,
} from 'lucide-react';

// 탭 타입
type SettingsTab = 'sites' | 'gateways' | 'account' | 'notifications';

const TABS = [
  { id: 'sites', label: '사이트 관리', icon: Building2 },
  { id: 'gateways', label: '게이트웨이', icon: Cpu },
  { id: 'account', label: '계정 설정', icon: User },
  { id: 'notifications', label: '알림 설정', icon: Bell },
] as const;

// 사이트 타입 옵션
const SITE_TYPES = [
  'GROWING',
  'GERMINATION',
  'ENTRANCE',
  'WORKING',
  'PANTRY',
  'TOILET',
  'REST',
  'LABORATORY',
  'OUTSIDE',
] as const;

export default function SettingsPage() {
  const { user } = useAuthStore();
  const farmId = user?.currentLocation || '';

  // 상태
  const [activeTab, setActiveTab] = useState<SettingsTab>('sites');
  const [sites, setSites] = useState<any[]>([]);
  const [sensorGateways, setSensorGateways] = useState<any[]>([]);
  const [controllerGateways, setControllerGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 비밀번호 변경 폼
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // 사이트 편집 모달
  const [editingSite, setEditingSite] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ sname: '', stype: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 게이트웨이 관련 상태
  const [selectedGateway, setSelectedGateway] = useState<any | null>(null);
  const [gatewayAction, setGatewayAction] = useState<'blink' | 'calibrate' | 'delete' | null>(null);
  const [showGatewayDeleteConfirm, setShowGatewayDeleteConfirm] = useState(false);

  // 펌웨어 관련 상태
  const [showFirmwareModal, setShowFirmwareModal] = useState(false);
  const [firmwares, setFirmwares] = useState<any[]>([]);
  const [firmwareLoading, setFirmwareLoading] = useState(false);
  const [firmwareUploading, setFirmwareUploading] = useState(false);
  const [firmwareUpdating, setFirmwareUpdating] = useState(false);
  const [firmwareForm, setFirmwareForm] = useState({
    file: null as File | null,
    ftype: '',
    version: '',
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

      setSites(sitesRes.site || []);
      setSensorGateways(sensorRes.gateways || []);
      setControllerGateways(controllerRes.gateways || []);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [farmId]);

  // 메시지 자동 숨김
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // 알람 토글
  const handleAlarmToggle = async (site: any) => {
    setSaving(true);
    try {
      await siteApi.updateAlarm(farmId, {
        sid: site.sid,
        alarm: !site.alarmEnabled,
      });

      setSites((prev) =>
        prev.map((s) =>
          s.sid === site.sid ? { ...s, alarmEnabled: !s.alarmEnabled } : s
        )
      );

      // 편집 모달이 열려있으면 해당 사이트도 업데이트
      if (editingSite?.sid === site.sid) {
        setEditingSite({ ...editingSite, alarmEnabled: !site.alarmEnabled });
      }

      setMessage({ type: 'success', text: '알람 설정이 변경되었습니다.' });
    } catch (error) {
      console.error('알람 설정 실패:', error);
      setMessage({ type: 'error', text: '알람 설정 변경에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  // 사이트 편집 모달 열기
  const openEditModal = (site: any) => {
    setEditingSite(site);
    setEditForm({ sname: site.sname || '', stype: site.stype || '' });
  };

  // 사이트 저장
  const handleSaveSite = async () => {
    const trimmedName = (editForm.sname || '').trim();
    if (!editingSite || !trimmedName) return;

    setSaving(true);
    try {
      await siteApi.updateSite(farmId, {
        sid: editingSite.sid,
        sname: trimmedName,
        stype: editForm.stype || undefined,
      });

      setSites((prev) =>
        prev.map((s) =>
          s.sid === editingSite.sid ? { ...s, sname: trimmedName, stype: editForm.stype } : s
        )
      );

      setMessage({ type: 'success', text: '사이트 정보가 저장되었습니다.' });
      setEditingSite(null);
    } catch (error) {
      console.error('사이트 저장 실패:', error);
      setMessage({ type: 'error', text: '사이트 저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  // 사이트 삭제
  const handleDeleteSite = async () => {
    if (!editingSite) return;

    setDeleting(true);
    try {
      await siteApi.deleteSite(farmId, editingSite.sid);

      setSites((prev) => prev.filter((s) => s.sid !== editingSite.sid));

      setMessage({ type: 'success', text: '사이트가 삭제되었습니다.' });
      setShowDeleteConfirm(false);
      setEditingSite(null);
    } catch (error) {
      console.error('사이트 삭제 실패:', error);
      setMessage({ type: 'error', text: '사이트 삭제에 실패했습니다.' });
    } finally {
      setDeleting(false);
    }
  };

  // 게이트웨이 Blink
  const handleBlinkGateway = async () => {
    if (!selectedGateway) return;

    setGatewayAction('blink');
    try {
      await gatewayApi.blinkGateway(farmId, selectedGateway.gid);
      setMessage({ type: 'success', text: '게이트웨이 LED가 깜빡입니다.' });
    } catch (error) {
      console.error('Blink 실패:', error);
      setMessage({ type: 'error', text: 'Blink 명령 실패' });
    } finally {
      setGatewayAction(null);
    }
  };

  // 게이트웨이 캘리브레이션
  const handleCalibrateGateway = async () => {
    if (!selectedGateway) return;

    setGatewayAction('calibrate');
    try {
      await gatewayApi.calibrateSensor(farmId, selectedGateway.gid);
      setMessage({ type: 'success', text: '캘리브레이션이 시작되었습니다.' });
    } catch (error) {
      console.error('캘리브레이션 실패:', error);
      setMessage({ type: 'error', text: '캘리브레이션 실패' });
    } finally {
      setGatewayAction(null);
    }
  };

  // 게이트웨이 삭제
  const handleDeleteGateway = async () => {
    if (!selectedGateway) return;

    setGatewayAction('delete');
    try {
      await gatewayApi.deleteGateway(farmId, selectedGateway.gid);

      // 목록에서 제거
      const isSensor = selectedGateway.gtype === 'sensor' || sensorGateways.some((g: any) => g.gid === selectedGateway.gid);
      if (isSensor) {
        setSensorGateways((prev) => prev.filter((g: any) => g.gid !== selectedGateway.gid));
      } else {
        setControllerGateways((prev) => prev.filter((g: any) => g.gid !== selectedGateway.gid));
      }

      setMessage({ type: 'success', text: '게이트웨이가 삭제되었습니다.' });
      setShowGatewayDeleteConfirm(false);
      setSelectedGateway(null);
    } catch (error) {
      console.error('게이트웨이 삭제 실패:', error);
      setMessage({ type: 'error', text: '게이트웨이 삭제 실패' });
    } finally {
      setGatewayAction(null);
    }
  };

  // 펌웨어 목록 로드
  const loadFirmwares = async () => {
    setFirmwareLoading(true);
    try {
      const res = await firmwareApi.getFirmwares();
      setFirmwares(res.firmwares || res || []);
    } catch (error) {
      console.error('펌웨어 목록 로드 실패:', error);
      setFirmwares([]);
    } finally {
      setFirmwareLoading(false);
    }
  };

  // 펌웨어 모달 열기
  const openFirmwareModal = () => {
    setShowFirmwareModal(true);
    loadFirmwares();
  };

  // 펌웨어 업데이트 (게이트웨이에 적용)
  const handleFirmwareUpdate = async () => {
    setFirmwareUpdating(true);
    try {
      await firmwareApi.updateFirmware();
      setMessage({ type: 'success', text: '펌웨어 업데이트가 시작되었습니다.' });
    } catch (error) {
      console.error('펌웨어 업데이트 실패:', error);
      setMessage({ type: 'error', text: '펌웨어 업데이트에 실패했습니다.' });
    } finally {
      setFirmwareUpdating(false);
    }
  };

  // 펌웨어 업로드
  const handleFirmwareUpload = async () => {
    if (!firmwareForm.file || !firmwareForm.ftype || !firmwareForm.version) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }

    setFirmwareUploading(true);
    try {
      await firmwareApi.uploadFirmware({
        file: firmwareForm.file,
        ftype: firmwareForm.ftype,
        version: firmwareForm.version,
      });
      setMessage({ type: 'success', text: '펌웨어가 업로드되었습니다.' });
      setFirmwareForm({ file: null, ftype: '', version: '' });
      loadFirmwares();
    } catch (error) {
      console.error('펌웨어 업로드 실패:', error);
      setMessage({ type: 'error', text: '펌웨어 업로드에 실패했습니다.' });
    } finally {
      setFirmwareUploading(false);
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 8자 이상이어야 합니다.' });
      return;
    }

    setSaving(true);
    try {
      await authApi.updatePassword({
        username: user?.email || '',
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      setMessage({ type: 'error', text: '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.' });
    } finally {
      setSaving(false);
    }
  };

  // 사이트 관리 탭
  const renderSitesTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900">사이트 목록</h3>
        <button className="btn btn-primary flex items-center space-x-2 text-sm lg:text-base">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">사이트 추가</span>
          <span className="sm:hidden">추가</span>
        </button>
      </div>

      <div className="space-y-3 lg:space-y-4">
        {sites.map((site) => (
          <div key={site.sid} className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{site.sname}</h4>
                  <p className="text-xs lg:text-sm text-gray-500">
                    타입: {site.stype || '-'} | ID: {site.sid}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4 pl-13 sm:pl-0">
                {/* 알람 토글 */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs lg:text-sm text-gray-500">알람</span>
                  <button
                    onClick={() => handleAlarmToggle(site)}
                    disabled={saving}
                    className={`relative w-11 lg:w-12 h-6 rounded-full transition-colors ${
                      site.alarmEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        site.alarmEnabled ? 'translate-x-5 lg:translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 액션 버튼 */}
                <button
                  onClick={() => openEditModal(site)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {sites.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            등록된 사이트가 없습니다.
          </div>
        )}
      </div>
    </div>
  );

  // 게이트웨이 관리 탭
  const renderGatewaysTab = () => {
    // 사이트 ID로 사이트 이름 찾기
    const getSiteName = (siteId: string) => {
      const site = sites.find((s: any) => s.sid === siteId);
      return site?.sname || siteId || '-';
    };

    // 게이트웨이 행 렌더링
    const GatewayRow = ({ gateway, gtype }: { gateway: any; gtype: 'sensor' | 'controller' }) => {
      const isSelected = selectedGateway?.gid === gateway.gid;
      const isOnline = gateway.status !== 'offline';

      return (
        <tr
          onClick={() => setSelectedGateway({ ...gateway, gtype })}
          className={`cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <td className="px-2 lg:px-4 py-2 lg:py-3">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
          </td>
          <td className="px-2 lg:px-4 py-2 lg:py-3 text-sm font-medium text-gray-900">
            {gateway.gname || '-'}
          </td>
          <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-500 font-mono">
            {gateway.gid || '-'}
          </td>
          <td className="px-2 lg:px-4 py-2 lg:py-3 text-sm text-gray-700">
            {getSiteName(gateway.sid)}
          </td>
        </tr>
      );
    };

    return (
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* 왼쪽: 게이트웨이 목록 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Gateways</h3>
            <button
              onClick={openFirmwareModal}
              className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Firmware Update</span>
            </button>
          </div>

          {/* 센서 게이트웨이 테이블 */}
          <div className="card overflow-hidden mb-4">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700">Sensors</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-2 lg:px-4 py-2 text-xs font-medium text-gray-500 uppercase w-16">STAT</th>
                    <th className="px-2 lg:px-4 py-2 text-xs font-medium text-gray-500 uppercase">GNAME</th>
                    <th className="px-2 lg:px-4 py-2 text-xs font-medium text-gray-500 uppercase">GID</th>
                    <th className="px-2 lg:px-4 py-2 text-xs font-medium text-gray-500 uppercase">SNAME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sensorGateways.map((gateway: any) => (
                    <GatewayRow key={gateway.gid} gateway={gateway} gtype="sensor" />
                  ))}
                </tbody>
              </table>
              {sensorGateways.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  센서 게이트웨이 없음
                </div>
              )}
            </div>
          </div>

          {/* 컨트롤러 게이트웨이 테이블 */}
          <div className="card overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700">Controllers</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-2 lg:px-4 py-2 text-xs font-medium text-gray-500 uppercase w-16">STAT</th>
                    <th className="px-2 lg:px-4 py-2 text-xs font-medium text-gray-500 uppercase">GNAME</th>
                    <th className="px-2 lg:px-4 py-2 text-xs font-medium text-gray-500 uppercase">GID</th>
                    <th className="px-2 lg:px-4 py-2 text-xs font-medium text-gray-500 uppercase">SNAME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {controllerGateways.map((gateway: any) => (
                    <GatewayRow key={gateway.gid} gateway={gateway} gtype="controller" />
                  ))}
                </tbody>
              </table>
              {controllerGateways.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  컨트롤러 게이트웨이 없음
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 선택된 게이트웨이 상세 정보 */}
        <div className="lg:w-80 flex-shrink-0">
          {selectedGateway ? (
            <div className="card">
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Wifi className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold text-gray-900">{selectedGateway.gname}</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedGateway.gtype === 'sensor' ? 'Sensor Gateway' : 'Controller Gateway'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGateway(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 펌웨어 정보 */}
              <div className="text-right text-xs text-gray-500 mb-4">
                <p>{selectedGateway.firmware || 'CUBE_WATER_FARM'}</p>
                <p className="font-mono">{selectedGateway.gid}</p>
              </div>

              {/* 상세 정보 테이블 */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 bg-gray-50 text-gray-600 font-medium">Firmware version</td>
                      <td className="px-3 py-2 text-gray-900">{selectedGateway.firmware || '-'}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 bg-gray-50 text-gray-600 font-medium">RSSI</td>
                      <td className="px-3 py-2 text-gray-900">{selectedGateway.rssi ?? '0'}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 bg-gray-50 text-gray-600 font-medium">Last update</td>
                      <td className="px-3 py-2 text-gray-900 text-xs">
                        {selectedGateway.lastUpdate
                          ? new Date(selectedGateway.lastUpdate).toLocaleString('ko-KR')
                          : '-'}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 bg-gray-50 text-gray-600 font-medium">Site Name</td>
                      <td className="px-3 py-2 text-gray-900">{getSiteName(selectedGateway.sid)}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 bg-gray-50 text-gray-600 font-medium">Position</td>
                      <td className="px-3 py-2 text-gray-900">{selectedGateway.position || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 캘리브레이션 버튼 (센서만) */}
              {selectedGateway.gtype === 'sensor' && (
                <button
                  onClick={handleCalibrateGateway}
                  disabled={gatewayAction === 'calibrate'}
                  className="w-full mb-4 btn bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center space-x-2"
                >
                  <Gauge className="w-4 h-4" />
                  <span>{gatewayAction === 'calibrate' ? '캘리브레이션 중...' : 'Calibration'}</span>
                </button>
              )}

              {/* 액션 버튼들 */}
              <div className="flex gap-2">
                <button
                  onClick={handleBlinkGateway}
                  disabled={gatewayAction === 'blink'}
                  className="flex-1 btn bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center space-x-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{gatewayAction === 'blink' ? '...' : 'Blink'}</span>
                </button>
                <button
                  onClick={() => setShowGatewayDeleteConfirm(true)}
                  className="flex-1 btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-500">
              <Cpu className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>게이트웨이를 선택하세요</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 계정 설정 탭
  const renderAccountTab = () => (
    <div className="max-w-xl">
      {/* 계정 정보 */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 정보</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">이메일</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">역할</span>
            <span className="badge badge-info">
              {user?.currentRole === 'master' && '전체 관리자'}
              {user?.currentRole === 'manager' && '농장 관리자'}
              {user?.currentRole === 'user' && '사용자'}
              {user?.currentRole === 'monitoring' && '모니터링'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">접근 가능 농장</span>
            <span className="text-gray-900">
              {user?.aud?.filter((a) => a.includes('cube-farm-')).length || 0}개
            </span>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* 현재 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              현재 비밀번호
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? '저장 중...' : '비밀번호 변경'}</span>
          </button>
        </form>
      </div>
    </div>
  );

  // 알림 설정 탭
  const renderNotificationsTab = () => (
    <div className="max-w-xl">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">센서 이상 알림</p>
              <p className="text-sm text-gray-500">센서 값이 설정 범위를 벗어나면 알림</p>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-green-500">
              <span className="absolute top-0.5 translate-x-6 w-5 h-5 bg-white rounded-full shadow" />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">장치 오프라인 알림</p>
              <p className="text-sm text-gray-500">게이트웨이 연결이 끊기면 알림</p>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-green-500">
              <span className="absolute top-0.5 translate-x-6 w-5 h-5 bg-white rounded-full shadow" />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">일일 리포트</p>
              <p className="text-sm text-gray-500">매일 농장 현황 요약 이메일</p>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-gray-300">
              <span className="absolute top-0.5 translate-x-0.5 w-5 h-5 bg-white rounded-full shadow" />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">시스템 공지</p>
              <p className="text-sm text-gray-500">업데이트 및 점검 안내</p>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-green-500">
              <span className="absolute top-0.5 translate-x-6 w-5 h-5 bg-white rounded-full shadow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">설정</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">시스템 및 계정 설정 관리</p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">새로고침</span>
        </button>
      </div>

      {/* 메시지 */}
      {message && (
        <div
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg mb-4 lg:mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm lg:text-base">{message.text}</span>
        </div>
      )}

      {/* 모바일: 가로 탭 / 데스크탑: 세로 사이드바 */}
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* 탭 네비게이션 */}
        <div className="lg:w-48 lg:flex-shrink-0 mb-4 lg:mb-0">
          {/* 모바일: 가로 스크롤 탭 */}
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 lg:gap-1 pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
            {TABS.map((tab) => {
              // 설정 탭은 manager 이상만
              if (
                (tab.id === 'sites' || tab.id === 'gateways') &&
                user?.currentRole !== 'master' &&
                user?.currentRole !== 'manager'
              ) {
                return null;
              }

              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 bg-gray-50 lg:bg-transparent'
                  }`}
                >
                  <Icon className={`w-4 lg:w-5 h-4 lg:h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium text-sm lg:text-base">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner w-8 h-8"></div>
            </div>
          ) : (
            <>
              {activeTab === 'sites' && renderSitesTab()}
              {activeTab === 'gateways' && renderGatewaysTab()}
              {activeTab === 'account' && renderAccountTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
            </>
          )}
        </div>
      </div>

      {/* 사이트 편집 모달 */}
      {editingSite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">사이트 편집</h3>
              <button
                onClick={() => setEditingSite(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-4 space-y-4">
              {/* 사이트 ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사이트 ID
                </label>
                <input
                  type="text"
                  value={editingSite.sid}
                  disabled
                  className="input bg-gray-50 text-gray-500"
                />
              </div>

              {/* 사이트 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사이트 이름
                </label>
                <input
                  type="text"
                  value={editForm.sname}
                  onChange={(e) => setEditForm({ ...editForm, sname: e.target.value })}
                  className="input"
                  placeholder="사이트 이름 입력"
                />
              </div>

              {/* 사이트 타입 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사이트 타입
                </label>
                <select
                  value={editForm.stype}
                  onChange={(e) => setEditForm({ ...editForm, stype: e.target.value })}
                  className="input"
                >
                  <option value="">선택안함</option>
                  {SITE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* 알람 설정 */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">알람 활성화</span>
                <button
                  onClick={() => handleAlarmToggle(editingSite)}
                  disabled={saving}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    editingSite.alarmEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      editingSite.alarmEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>삭제</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingSite(null)}
                  className="btn btn-secondary"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveSite}
                  disabled={saving || !(editForm.sname || '').trim()}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? '저장 중...' : '저장'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 사이트 삭제 확인 모달 */}
      {showDeleteConfirm && editingSite && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                사이트 삭제
              </h3>
              <p className="text-gray-500 mb-1">
                <span className="font-medium text-gray-900">{editingSite.sname}</span> 사이트를 삭제하시겠습니까?
              </p>
              <p className="text-sm text-red-500">
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors border-r border-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleDeleteSite}
                disabled={deleting}
                className="flex-1 py-3 text-red-600 font-medium hover:bg-red-50 transition-colors"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 게이트웨이 삭제 확인 모달 */}
      {showGatewayDeleteConfirm && selectedGateway && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                게이트웨이 삭제
              </h3>
              <p className="text-gray-500 mb-1">
                <span className="font-medium text-gray-900">{selectedGateway.gname}</span> 게이트웨이를 삭제하시겠습니까?
              </p>
              <p className="text-sm text-red-500">
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowGatewayDeleteConfirm(false)}
                disabled={gatewayAction === 'delete'}
                className="flex-1 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors border-r border-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleDeleteGateway}
                disabled={gatewayAction === 'delete'}
                className="flex-1 py-3 text-red-600 font-medium hover:bg-red-50 transition-colors"
              >
                {gatewayAction === 'delete' ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 펌웨어 업데이트 모달 */}
      {showFirmwareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">CUBE Firmware</h3>
              </div>
              <button
                onClick={() => setShowFirmwareModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Firmware Update 섹션 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Firmware Update</h4>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">FIRMWARE STATUS</span>
                  <button
                    onClick={loadFirmwares}
                    disabled={firmwareLoading}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {firmwareLoading ? 'Loading...' : 'REFRESH'}
                  </button>
                </div>

                {/* 펌웨어 목록 테이블 */}
                <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">FID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">VERSION</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">FILE SIZE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {firmwareLoading ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            로딩 중...
                          </td>
                        </tr>
                      ) : firmwares.length > 0 ? (
                        firmwares.map((fw: any, idx: number) => (
                          <tr key={fw.fid || idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-900 font-medium">{fw.fid || fw.ftype || '-'}</td>
                            <td className="px-4 py-2 text-gray-700">{fw.version || '-'}</td>
                            <td className="px-4 py-2 text-gray-500 text-right">{fw.fileSize?.toLocaleString() || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            펌웨어 정보 없음
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Update Firmware 버튼 */}
                <button
                  onClick={handleFirmwareUpdate}
                  disabled={firmwareUpdating || firmwares.length === 0}
                  className="w-full py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-lg transition-colors border border-blue-200"
                >
                  {firmwareUpdating ? 'Updating...' : 'Update Firmware'}
                </button>
              </div>

              {/* Firmware Upload 섹션 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Firmware Upload</h4>

                {/* 파일 선택 */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    FIRMWARE FILE
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer">
                      <span>파일 선택</span>
                      <input
                        type="file"
                        accept=".bin"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFirmwareForm({ ...firmwareForm, file });
                        }}
                      />
                    </label>
                    <span className="text-sm text-gray-500">
                      {firmwareForm.file?.name || '선택된 파일 없음'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload "f80_sys_mcuimgA.bin" at folder named "Release"
                  </p>
                </div>

                {/* 펌웨어 타입 */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    FIRMWARE TYPE
                  </label>
                  <select
                    value={firmwareForm.ftype}
                    onChange={(e) => setFirmwareForm({ ...firmwareForm, ftype: e.target.value })}
                    className="input"
                  >
                    <option value="">REQUIRED</option>
                    <option value="afs">afs - AIR FARM Sensor</option>
                    <option value="wfs">wfs - WATER FARM Sensor</option>
                    <option value="ofs">ofs - OUTDOOR FARM Sensor</option>
                    <option value="ctr_m">ctr_m - CONTROL Main</option>
                    <option value="ctr_s">ctr_s - CONTROL Sub</option>
                  </select>
                </div>

                {/* 펌웨어 버전 */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                    FIRMWARE VERSION
                  </label>
                  <input
                    type="text"
                    value={firmwareForm.version}
                    onChange={(e) => setFirmwareForm({ ...firmwareForm, version: e.target.value })}
                    placeholder="REQUIRED"
                    className="input"
                  />
                </div>

                {/* Upload 버튼 */}
                <button
                  onClick={handleFirmwareUpload}
                  disabled={firmwareUploading || !firmwareForm.file || !firmwareForm.ftype || !firmwareForm.version}
                  className="w-full py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium rounded-lg transition-colors border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {firmwareUploading ? 'Uploading...' : 'Upload & DB Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
