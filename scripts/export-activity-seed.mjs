/**
 * 데모(2026-08-19 개정본) index.html 의 ARTICLES → 활동소식 시드 JSON 추출.
 *
 *   node scripts/export-activity-seed.mjs [데모 index.html 경로] [출력 경로]
 *
 * 기본값은 아래 DEMO/OUT 상수. 산출물은 growworks-web-admin 의
 * seed-cwc-activity 스크립트가 읽어 S3 업로드 + DB insert 에 쓴다.
 *
 * 사진은 대표 1장(local) + 추가분(gallery)을 한 배열로 합친다 —
 * 운영 스키마에서 활동소식 field_2 가 image[] 이기 때문이다.
 * 캡션은 대표 사진의 alt 하나만 옮긴다(field_3). 2번째부터의 "… 2", "… 3" 표기는
 * 프론트(activityMeta)가 같은 규칙으로 자동 생성하므로 저장하지 않는다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

const DEMO =
  process.argv[2] ||
  'D:/work/우리매장연구소/프로젝트/2607. _학교협회/(학교)클라이언트_전달용/(학교)클라이언트_전달용/index.html'
const OUT = process.argv[3] || resolve(HERE, 'activity-seed.json')

const html = readFileSync(DEMO, 'utf8')
const demoRoot = dirname(DEMO)

/* ---- ARTICLES 배열 구간만 잘라낸다 ---- */
const start = html.indexOf('const ARTICLES=[')
const end = html.indexOf('const REPORTS=[', start)
if (start < 0 || end < 0) throw new Error('ARTICLES 배열을 찾지 못했습니다')
const seg = html.slice(start, end)

/* ---- 항목 단위로 분해 (`{id:'aNN'` 로 시작) ---- */
const chunks = seg.split(/\{id:'(a\d+)'/).slice(1)
const articles = []
for (let i = 0; i < chunks.length; i += 2) {
  const id = chunks[i]
  const body = chunks[i + 1]

  const pick = (key) => {
    const m = body.match(new RegExp(`${key}:'((?:[^'\\\\]|\\\\.)*)'`))
    return m ? m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\') : ''
  }

  /* 사진: local 1장 + gallery 의 [경로, 캡션] 쌍들 */
  const photos = []
  const local = pick('local')
  if (local) photos.push(local)
  const gal = body.match(/gallery:\[([\s\S]*?)\],?\s*\n\s*body:/)
  if (gal) {
    for (const m of gal[1].matchAll(/\['([^']+)','([^']*)'\]/g)) photos.push(m[1])
  }

  const bodyHtml = (body.match(/body:`([\s\S]*?)`\}/) || [])[1] || ''

  articles.push({
    id,
    topic: pick('cat'), // field_1 (구분 배지)
    title: pick('title'),
    date: pick('date') || null, // 'YYYY.MM.DD' | 'YYYY.MM' | null(미상)
    caption: pick('alt'), // field_3 (이미지 설명)
    contentHtml: bodyHtml.trim(),
    images: photos.map((p) => {
      const abs = join(demoRoot, p)
      if (!existsSync(abs)) throw new Error(`이미지 없음: ${abs}`)
      return abs
    }),
  })
}

/* ---- 검증 ---- */
if (!articles.length) throw new Error('추출된 항목이 없습니다')
const dated = articles.filter((a) => a.date)
const undated = articles.filter((a) => !a.date)
const photoCount = articles.reduce((n, a) => n + a.images.length, 0)

console.log(`활동소식 ${articles.length}건 · 사진 ${photoCount}장`)
console.log(`  날짜 있음 ${dated.length}건 / 날짜 미상 ${undated.length}건`)
if (undated.length) {
  console.log('  날짜 미상 목록 (조합 확인 후 date 를 채우면 함께 올라갑니다):')
  undated.forEach((a) => console.log(`    - ${a.id} ${a.title}`))
}

writeFileSync(OUT, JSON.stringify(articles, null, 2))
console.log(`출력: ${OUT}`)
