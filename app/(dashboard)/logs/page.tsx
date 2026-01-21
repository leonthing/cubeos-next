// ==================================================
// 로그 조회 페이지
// 센서, 제어, 알림 로그 조회 및 다운로드
// ==================================================

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { logApi } from '@/lib/api';
import { toast } from '@/lib/toastStore';
import { format, subDays } from 'date-fns';
import {
  FileText,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Thermometer,
  Power,
  Bell,
  Calendar,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

// 로그 타입
type LogType = 'sensor' | 'control' | 'alert';

// 로그 타입 설정
const LOG_TYPES = [
  { id: 'sensor', label: '센서 로그', icon: Thermometer },
  { id: 'control', label: '제어 로그', icon: Power },
  { id: 'alert', label: '알림 로그', icon: Bell },
] as const;

export default function LogsPage() {
  const { user } = useAuthStore();
  const farmId = user?.currentLocation || '';

  // 상태
  const [logType, setLogType] = useState<LogType>('sensor');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 필터 상태
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [deviceId, setDeviceId] = useState('');

  // 로그 로드
  const loadLogs = async () => {
    if (!farmId) return;

    setLoading(true);
    try {
      let response;

      switch (logType) {
        case 'sensor':
          response = await logApi.getSensorLogsPage({
            farmId,
            deviceId: deviceId || undefined,
            startDate,
            endDate,
            page,
            size: 20,
          });
          break;
        case 'control':
          response = await logApi.getControlLogs({
            farmId,
            startDate,
            endDate,
            page,
            size: 20,
          });
          break;
        case 'alert':
          response = await logApi.getAlertLogs({
            page,
            size: 20,
          });
          break;
      }

      if (response) {
        setLogs(response.content || response.data || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || response.total || 0);
      }
    } catch (error) {
      console.error('로그 로드 실패:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [farmId, logType, page]);

  // 검색 핸들러
  const handleSearch = () => {
    setPage(0);
    loadLogs();
  };

  // 다운로드 핸들러
  const handleDownload = async () => {
    if (logType !== 'sensor' || !deviceId) {
      toast.warning('센서 로그 다운로드는 장치 ID가 필요합니다.');
      return;
    }

    setDownloading(true);
    try {
      const blob = await logApi.downloadSensorLog({
        deviceId,
        startDate,
        endDate,
      });

      // 파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sensor_log_${deviceId}_${startDate}_${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('다운로드 실패:', error);
      toast.error('로그 다운로드에 실패했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  // 로그 타입 변경
  const handleLogTypeChange = (type: LogType) => {
    setLogType(type);
    setPage(0);
    setLogs([]);
  };

  // 센서 로그 테이블
  const renderSensorLogs = () => (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">장치</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">값</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {logs.map((log, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm text-gray-900">
              {log.timestamp
                ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')
                : log.res_date || '-'}
            </td>
            <td className="px-4 py-3 text-sm text-gray-700">{log.dname || log.device_name || '-'}</td>
            <td className="px-4 py-3 text-sm text-gray-700">
              <span className="badge badge-info">{log.dtype || log.sensor_type || '-'}</span>
            </td>
            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
              {log.sensor_val ?? log.value ?? '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // 제어 로그 테이블
  const renderControlLogs = () => (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">장치</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결과</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {logs.map((log, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm text-gray-900">
              {log.timestamp
                ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')
                : log.created_at || '-'}
            </td>
            <td className="px-4 py-3 text-sm text-gray-700">{log.dname || log.device_name || '-'}</td>
            <td className="px-4 py-3 text-sm text-gray-700">
              <span className={`badge ${log.action === 'ON' || log.action === 'on' ? 'badge-success' : 'badge-info'}`}>
                {log.action || '-'}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-700">{log.username || log.user || '-'}</td>
            <td className="px-4 py-3 text-sm">
              <span className={`badge ${log.success ? 'badge-success' : 'badge-danger'}`}>
                {log.success ? '성공' : '실패'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // 알림 로그 테이블
  const renderAlertLogs = () => (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">메시지</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {logs.map((log, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm text-gray-900">
              {log.timestamp
                ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')
                : log.created_at || '-'}
            </td>
            <td className="px-4 py-3 text-sm">
              <span className={`badge ${
                log.level === 'error' || log.level === 'critical'
                  ? 'badge-danger'
                  : log.level === 'warning'
                  ? 'badge-warning'
                  : 'badge-info'
              }`}>
                {log.level || log.type || '-'}
              </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-700">{log.message || '-'}</td>
            <td className="px-4 py-3 text-sm">
              <span className={`badge ${log.resolved ? 'badge-success' : 'badge-warning'}`}>
                {log.resolved ? '해결됨' : '미해결'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">로그</h1>
          <p className="text-gray-500 mt-1">시스템 로그 조회 및 다운로드</p>
        </div>
      </div>

      {/* 로그 타입 탭 */}
      <div className="flex space-x-2 mb-6">
        {LOG_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => handleLogTypeChange(type.id as LogType)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                logType === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* 필터 */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* 시작일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작일
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* 종료일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료일
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* 장치 ID (센서 로그만) */}
          {logType === 'sensor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                장치 ID
              </label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="옵션"
                className="input w-40"
              />
            </div>
          )}

          {/* 검색 버튼 */}
          <button
            onClick={handleSearch}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>검색</span>
          </button>

          {/* 새로고침 */}
          <button
            onClick={loadLogs}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>새로고침</span>
          </button>

          {/* 다운로드 (센서 로그만) */}
          {logType === 'sensor' && (
            <button
              onClick={handleDownload}
              disabled={downloading || !deviceId}
              className="btn btn-secondary flex items-center space-x-2 ml-auto"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? '다운로드 중...' : 'CSV 다운로드'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 로그 테이블 */}
      <div className="card overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">
              {LOG_TYPES.find((t) => t.id === logType)?.label}
            </span>
            <span className="text-sm text-gray-500">
              (총 {totalElements.toLocaleString()}건)
            </span>
          </div>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="spinner w-8 h-8"></div>
          </div>
        )}

        {/* 테이블 */}
        {!loading && logs.length > 0 && (
          <div className="overflow-x-auto">
            {logType === 'sensor' && renderSensorLogs()}
            {logType === 'control' && renderControlLogs()}
            {logType === 'alert' && renderAlertLogs()}
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p>조회된 로그가 없습니다</p>
            <p className="text-sm mt-1">검색 조건을 변경해보세요</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {page + 1} / {totalPages} 페이지
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn btn-secondary p-2 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn btn-secondary p-2 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
