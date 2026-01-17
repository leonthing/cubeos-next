// ==================================================
// API 프록시 라우트
// CORS 문제를 우회하기 위한 서버사이드 프록시
// ==================================================

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.nthing.link:8080';

async function proxyRequest(request: NextRequest, path: string) {
  const url = `${API_BASE_URL}/${path}`;

  // 요청 헤더 복사
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // host와 일부 헤더는 제외
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // 요청 옵션
  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  // GET이 아닌 경우 body 추가
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      fetchOptions.body = await request.text();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      fetchOptions.body = await request.text();
    } else {
      fetchOptions.body = await request.arrayBuffer();
    }
  }

  try {
    console.log(`[Proxy] ${request.method} ${url}`);
    const response = await fetch(url, fetchOptions);
    console.log(`[Proxy] Response: ${response.status} ${response.statusText}`);

    // 응답 헤더 복사
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    // CORS 헤더 추가
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    const data = await response.arrayBuffer();

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const fullPath = searchParams ? `${path}?${searchParams}` : path;
  return proxyRequest(request, fullPath);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const fullPath = searchParams ? `${path}?${searchParams}` : path;
  return proxyRequest(request, fullPath);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  return proxyRequest(request, path);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Farm-Id',
    },
  });
}
