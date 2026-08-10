import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'

/**
 * OpenNext Cloudflare 어댑터 설정 (skinnfood 와 동일 패턴).
 * 목록 페이지 ISR(revalidate)과 fetch 캐시(300초)를 위해 R2 증분 캐시를 사용한다.
 * wrangler.jsonc 의 r2_buckets 바인딩(NEXT_INC_CACHE_R2_BUCKET)이 필요하다.
 */
const config = defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
})

// CF Workers Builds의 Build command가 `npm run build`(= opennextjs-cloudflare build)이므로,
// 내부 Next.js 빌드는 `build:next`(= next build)를 호출하게 해 재귀를 방지한다.
config.buildCommand = 'npm run build:next'

export default config
