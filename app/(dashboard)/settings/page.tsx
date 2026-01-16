// ==================================================
// 설정 페이지
// 사이트 관리, 게이트웨이 관리, 계정 설정
// ==================================================

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { siteApi, gatewayApi, authApi } from '@/lib/api';
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
} from 'lucide-react';

// 탭 타입
type SettingsTab = 'sites' | 'gateways' | 'account' | 'notifications';

const TABS = [
  { id: 'sites', label: '사이트 관리', icon: Building2 },
  { id: 'gateways', label: '게이트웨이', icon: Cpu },
  { id: 'account', label: '계정 설정', icon: User },
  { id: 'notifications', label: '알림 설정', icon: Bell },
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

      setMessage({ type: 'success', text: '알람 설정이 변경되었습니다.' });
    } catch (error) {
      console.error('알람 설정 실패:', error);
      setMessage({ type: 'error', text: '알람 설정 변경에 실패했습니다.' });
    } finally {
      setSaving(false);
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">사이트 목록</h3>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>사이트 추가</span>
        </button>
      </div>

      <div className="space-y-4">
        {sites.map((site) => (
          <div key={site.sid} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{site.sname}</h4>
                  <p className="text-sm text-gray-500">
                    타입: {site.stype || '-'} | ID: {site.sid}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* 알람 토글 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">알람</span>
                  <button
                    onClick={() => handleAlarmToggle(site)}
                    disabled={saving}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      site.alarmEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        site.alarmEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* 액션 버튼 */}
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
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
  const renderGatewaysTab = () => (
    <div>
      {/* 센서 게이트웨이 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">센서 게이트웨이</h3>
        <div className="space-y-4">
          {sensorGateways.map((gateway) => (
            <div key={gateway.gid} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{gateway.gname}</h4>
                    <p className="text-sm text-gray-500">
                      ID: {gateway.gid} | 장치: {gateway.deviceList?.length || 0}개
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="badge badge-success">연결됨</span>
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {sensorGateways.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              등록된 센서 게이트웨이가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 컨트롤러 게이트웨이 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">컨트롤러 게이트웨이</h3>
        <div className="space-y-4">
          {controllerGateways.map((gateway) => (
            <div key={gateway.gid} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{gateway.gname}</h4>
                    <p className="text-sm text-gray-500">
                      ID: {gateway.gid} | 장치: {gateway.deviceList?.length || 0}개
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="badge badge-success">연결됨</span>
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {controllerGateways.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              등록된 컨트롤러 게이트웨이가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <p className="text-gray-500 mt-1">시스템 및 계정 설정 관리</p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>새로고침</span>
        </button>
      </div>

      {/* 메시지 */}
      {message && (
        <div
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex gap-8">
        {/* 사이드 탭 */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{tab.label}</span>
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
    </div>
  );
}
