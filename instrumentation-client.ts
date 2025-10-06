// Recommended client instrumentation entrypoint for Sentry with App Router
// https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://28cae78e5f17c65e0c2275c71fcb8443@o4510137205260288.ingest.us.sentry.io/4510137207226368",
  debug: false,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart


