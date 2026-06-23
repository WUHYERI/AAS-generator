export const API_BASE_URL = (
  // 백엔드는 개발 환경에서 IPv4 loopback(127.0.0.1)에 바인딩한다.
  // localhost가 IPv6(::1)로 먼저 해석되는 환경에서도 연결이 거절되지 않게 맞춘다.
  import.meta.env.VITE_AAS_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
