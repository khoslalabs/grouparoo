import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { Initializer, api, env } from "actionhero";
import { ApiKey, plugin, TeamMember } from "@grouparoo/core";
import domain from "domain";
const packageJSON = require("./../../package.json");

export class SentryInitializer extends Initializer {
  constructor() {
    super();
    this.name = packageJSON.name;
  }

  async initialize() {
    if (!process.env.SENTRY_DSN) return;
    if (!process.env.SENTRY_TRACE_SAMPLE_RATE) return;
    if (env === "test") return; // never enable sentry when NODE_ENV=test

    plugin.registerPlugin({
      name: packageJSON.name,
    });

    function beforeSend(event, hint) {
      const error = hint.originalException;

      // skip reporting some types of errors
      if (error?.code === "AUTHENTICATION_ERROR") return null;
      if (error?.code === "AUTHORIZATION_ERROR") return null;

      return event;
    }

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: env,
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACE_SAMPLE_RATE),
      release: packageJSON.version,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Postgres(),
      ],
      beforeSend: beforeSend,
    });

    // load the error reporter into actionhero
    api.exceptionHandlers.reporters.push((error: Error) => {
      Sentry.captureException(error);
    });

    // configure APM transaction tracing
    plugin.setApmWrap(async function apmWrap(
      name: string,
      type: string,
      data: any,
      run: Function
    ) {
      const traceDomain = domain.create();

      traceDomain.on("error", (error: Error) => {
        throw error;
      });

      return traceDomain.run(async () => {
        const transaction = Sentry.startTransaction({
          op: type,
          name,
          tags: { action: name },
        });

        Sentry.configureScope((scope) => scope.setSpan(transaction));

        const response = await run();

        Sentry.configureScope(function (scope) {
          if (data?.session?.teamMember) {
            const teamMember: TeamMember = data.session.teamMember;
            scope.setUser({ id: teamMember.id, email: teamMember.email });
          } else if (data?.session?.apiKey) {
            const apiKey: ApiKey = data.session.apiKey;
            scope.setUser({ id: apiKey.id });
          }
        });

        if (data.connection) {
          transaction.setHttpStatus(
            data.connection.rawConnection?.responseHttpCode
          );
        }

        transaction.finish();

        return response;
      });
    });
  }

  async stop() {
    try {
      await Sentry.close(2000);
    } catch (e) {}
  }
}
