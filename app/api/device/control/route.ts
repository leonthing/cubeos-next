// ==================================================
// 장치 제어 API 라우트
// CORS를 우회하기 위한 서버사이드 프록시
// ==================================================

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = 'https://api.nthing.link:8080';

// Basic Auth credentials (원본 CubeOS와 동일)
const AUTH_CONFIG = {
  username: 'cube-farm',
  password: 'nthing_dkaghdi00',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { farmId, endpoint, params } = body;

    // 파라미터를 URLSearchParams로 변환
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      urlParams.append(key, String(value));
    });

    // 인증 헤더 가져오기
    const farmIdHeader = request.headers.get('farm-id');

    const url = `${API_BASE_URL}/farm/${farmId}/device/${endpoint}`;
    console.log(`[Device Control] POST ${url}`);
    console.log(`[Device Control] Params:`, Object.fromEntries(urlParams));

    const response = await axios.post(url, urlParams.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(farmIdHeader && { 'Farm-Id': farmIdHeader }),
      },
      auth: AUTH_CONFIG,
      timeout: 30000,
    });

    console.log(`[Device Control] Response: ${response.status}`, response.data);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('[Device Control] Error:', error?.message || error);

    // Axios 에러 처리
    if (axios.isAxiosError(error)) {
      console.error('[Device Control] Axios error response:', error.response?.data);
      console.error('[Device Control] Axios error status:', error.response?.status);

      if (error.response) {
        return NextResponse.json(
          { error: 'API error', details: error.response.data },
          { status: error.response.status }
        );
      }

      return NextResponse.json(
        { error: 'Device control failed', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Device control failed', details: String(error) },
      { status: 500 }
    );
  }
}
