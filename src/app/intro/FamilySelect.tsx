'use client'

/** 패밀리 사이트 선택 — 새 탭 이동 (데모 onchange 이관) */
export function FamilySelect() {
  return (
    <select
      aria-label="패밀리 사이트 선택"
      defaultValue=""
      onChange={(e) => {
        if (e.target.value) window.open(e.target.value, '_blank', 'noopener,noreferrer')
      }}
    >
      <option value="">패밀리사이트 선택</option>
      <option value="http://www.cwc.or.kr/">CWC 교원투데이</option>
      <option value="https://www.moe.go.kr/">교육부</option>
      <option value="https://www.nts.go.kr/">국세청</option>
      <option value="https://www.hometax.go.kr/">공익법인 공시 포털</option>
    </select>
  )
}
