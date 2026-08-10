'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/* 카카오맵 SDK 전역 (타입 패키지 없이 필요한 표면만 선언) */
declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (cb: () => void) => void
        LatLng: new (lat: number, lng: number) => unknown
        Map: new (el: HTMLElement, opts: { center: unknown; level: number }) => unknown
        Marker: new (opts: { map: unknown; position: unknown; title?: string }) => unknown
        services: {
          Geocoder: new () => {
            addressSearch: (
              query: string,
              cb: (result: Array<{ x: string; y: string }>, status: string) => void,
            ) => void
          }
          Status: { OK: string }
        }
      }
    }
  }
}

const SCRIPT_ID = 'kakao-maps-sdk'

/**
 * 카카오맵 JS SDK 지도.
 * 주소를 지오코딩해 마커를 찍으므로 settings 주소가 바뀌면 지도도 따라간다.
 * SDK 로드/지오코딩 실패(도메인 미등록·네트워크) 시 플레이스홀더가 그대로 남는다.
 *
 * 래퍼 클래스는 화면마다 다르다 — 학교 오시는 길은 .map-box, 대문 Contact 는 .map-placeholder
 * (데모의 흑백→호버 컬러 필터가 실지도에도 그대로 적용된다).
 * `fallback` 을 주면 준비 전/실패 시 그 마크업을 그대로 보여준다(대문의 장식용 핀).
 */
export function KakaoMap({
  appKey,
  address,
  title,
  className = 'map-box',
  ariaLabel,
  fallback,
}: {
  appKey: string
  address: string
  title: string
  className?: string
  ariaLabel?: string
  fallback?: ReactNode
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const ready = state === 'ready'

  useEffect(() => {
    let alive = true

    const init = () => {
      const kakao = window.kakao
      const el = boxRef.current
      if (!kakao || !el) return
      kakao.maps.load(() => {
        if (!alive || !boxRef.current) return
        try {
          const geocoder = new kakao.maps.services.Geocoder()
          geocoder.addressSearch(address, (result, status) => {
            if (!alive || !boxRef.current) return
            if (status !== kakao.maps.services.Status.OK || !result[0]) {
              setState('error')
              return
            }
            const center = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x))
            const map = new kakao.maps.Map(boxRef.current, { center, level: 3 })
            new kakao.maps.Marker({ map, position: center, title })
            setState('ready')
          })
        } catch {
          setState('error')
        }
      })
    }

    if (window.kakao?.maps) {
      init()
      return () => {
        alive = false
      }
    }

    /* 스크립트는 1회만 주입 (라우트 재방문 대비) */
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    const onError = () => {
      /* 도메인 미등록(401)·네트워크 차단이면 스크립트 로드가 실패한다 */
      if (alive) setState('error')
    }
    if (existing) {
      existing.addEventListener('load', init)
      existing.addEventListener('error', onError)
      return () => {
        alive = false
        existing.removeEventListener('load', init)
        existing.removeEventListener('error', onError)
      }
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    /* autoload=false: kakao.maps.load 콜백으로 초기화 시점을 제어 · services: 주소 지오코딩 */
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`
    script.async = true
    script.addEventListener('load', init)
    script.addEventListener('error', onError)
    document.head.appendChild(script)

    return () => {
      alive = false
      script.removeEventListener('load', init)
      script.removeEventListener('error', onError)
    }
  }, [appKey, address, title])

  return (
    <div className={className} style={{ position: 'relative' }} aria-label={ariaLabel}>
      {/* 지도 레이어 — 준비되면 플레이스홀더를 덮는다 */}
      <div
        ref={boxRef}
        style={{ position: 'absolute', inset: 0, visibility: ready ? 'visible' : 'hidden' }}
        role="img"
        aria-label={`${title} 위치 지도`}
      />
      {!ready &&
        (fallback ?? (
          <>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3E76A8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            <span>
              {state === 'error'
                ? '지도를 표시할 수 없습니다. 아래 버튼으로 위치를 확인해 주세요.'
                : '지도를 불러오는 중입니다.'}
            </span>
          </>
        ))}
    </div>
  )
}
