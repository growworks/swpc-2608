/** 전역 토스트 — Toast 컴포넌트가 수신하는 커스텀 이벤트 디스패치 */
export function showToast(message: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('swpc:toast', { detail: message }))
}
