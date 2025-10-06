// This file initializes Sentry in the browser. Auto-loaded by @sentry/nextjs.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://28cae78e5f17c65e0c2275c71fcb8443@o4510137205260288.ingest.us.sentry.io/4510137207226368",
  debug: false,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart


