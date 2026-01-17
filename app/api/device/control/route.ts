// ==================================================
// 장치 제어 API 라우트
// CORS를 우회하기 위한 서버사이드 프록시
// ==================================================

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.nthing.link:8080';

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
    const authHeader = request.headers.get('authorization');
    const farmIdHeader = request.headers.get('farm-id');

    const url = `${API_BASE_URL}/farm/${farmId}/device/${endpoint}`;
    console.log(`[Device Control] POST ${url}`);
    console.log(`[Device Control] Params:`, Object.fromEntries(urlParams));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(authHeader && { 'Authorization': authHeader }),
        ...(farmIdHeader && { 'Farm-Id': farmIdHeader }),
      },
      body: urlParams.toString(),
    });

    const data = await response.text();
    console.log(`[Device Control] Response: ${response.status}`, data);

    // JSON 파싱 시도
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { raw: data };
    }

    return NextResponse.json(jsonData, { status: response.status });
  } catch (error) {
    console.error('[Device Control] Error:', error);
    return NextResponse.json(
      { error: 'Device control failed', details: String(error) },
      { status: 500 }
    );
  }
}
