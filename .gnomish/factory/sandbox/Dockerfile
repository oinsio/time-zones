# Образ песочницы для пайплайна time-zones: бокс, в котором выполняются все раунды гномов,
# голоса судьи и проверки команд, когда фабрика использует binding `container`
# (factory.bindings.default в ~/.gnomish/projects/time-zones/project.yaml).
# Собирайте его через .gnomish/factory/build-sandbox, а не вручную: скрипт берёт тег из
# project.yaml (factory.sandbox.image), версию Node из .nvmrc, а все версии инструментов ниже —
# из package.json и pnpm-lock.yaml, поэтому образ не может разойтись с тем, что зафиксировано в репозитории.
#
# Основан на эталонном рецепте фабрики (gnomish-factory: docs/examples/sandbox-image/),
# без JVM-инструментария, но с тем, что вызывают четыре стадии:
#   specify, archive  — openspec
#   implement         — pnpm, jq (хуки .claude/settings.json), Playwright Chromium (test:bdd)
#   deliver           — gh
#
# Контракт образа фабрики: git и curl в PATH; непривилегированный пользователь `gnome` с uid 1000,
# владеющий /gnomish/**; управляющие поверхности (политика агента, CA, настройки прокси)
# принадлежат root. У бокса нет маршрута ни к одному реестру, кроме как через egress guard,
# поэтому все инструменты запекаются здесь.
ARG NODE_VERSION=26
FROM node:${NODE_VERSION}-bookworm-slim

ARG PNPM_VERSION
ARG OPENSPEC_VERSION
ARG PLAYWRIGHT_VERSION
ARG AGENT_CLI_PACKAGE=@anthropic-ai/claude-code
ARG NPM_REGISTRY=https://registry.npmjs.org/
# Стабильный алиас egress guard в сети задачи; совпадает с тем, что использует сама фабрика.
ARG PROXY_HOST=gnomish-guard
ARG PROXY_PORT=8080

RUN test -n "$PNPM_VERSION" && test -n "$OPENSPEC_VERSION" && test -n "$PLAYWRIGHT_VERSION" \
 || { echo "PNPM_VERSION, OPENSPEC_VERSION and PLAYWRIGHT_VERSION are required - build with .gnomish/factory/build-sandbox" >&2; exit 1; }

# git + curl требует контракт; jq выполняется в хуках Claude Code; gh — из собственного
# apt-репозитория GitHub, в Debian он слишком старый для `gh pr list --json`. procps даёт `ps`,
# который нужен tree-kill (Stryker, vitest), чтобы останавливать дочерние процессы; без него
# каждый прогон оставляет сирот. tini — это PID 1 (см. ENTRYPOINT ниже).
RUN apt-get update \
 && apt-get install -y --no-install-recommends git curl ca-certificates jq gnupg procps tini \
 && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      > /etc/apt/sources.list.d/github-cli.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends gh \
 && rm -rf /var/lib/apt/lists/*

# Глобальные CLI тех версий, которые зафиксированы в репозитории. node_modules в worktree
# не существует, пока его не установит стадия implement, поэтому openspec должен быть глобальным.
RUN npm install -g --registry "$NPM_REGISTRY" \
      "pnpm@${PNPM_VERSION}" \
      "@fission-ai/openspec@${OPENSPEC_VERSION}" \
      "$AGENT_CLI_PACKAGE" \
 && npm cache clean --force

# Chromium для playwright-bdd ровно той версии, которую разрешает lockfile: сборка браузера
# привязана к одному релизу Playwright. Вне любого домашнего каталога и принадлежит root —
# в боксе доступен только для чтения.
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/ms-playwright
RUN npx -y "playwright@${PLAYWRIGHT_VERSION}" install --with-deps chromium \
 && rm -rf /var/lib/apt/lists/* /root/.npm \
 && chmod -R a+rX /opt/ms-playwright

# Шов для CA: файлам *.pem / *.crt, положенным в ca/, доверяют вся система и Node. Сейчас
# каталог пуст — guard пробрасывает TLS без изменений, пока фабрика не начнёт его перехватывать.
COPY ca/ /tmp/gnomish-ca/
RUN set -e; \
    for cert in /tmp/gnomish-ca/*.pem /tmp/gnomish-ca/*.crt; do \
      [ -f "$cert" ] || continue; \
      name="$(basename "$cert")"; \
      cp "$cert" "/usr/local/share/ca-certificates/${name%.*}.crt"; \
    done; \
    update-ca-certificates; \
    rm -rf /tmp/gnomish-ca

# Пользователь задачи. Образы node поставляются с пользователем `node` с uid 1000 — он
# переименовывается, а не дублируется.
RUN if getent passwd 1000 >/dev/null; then \
      old_user="$(getent passwd 1000 | cut -d: -f1)"; \
      usermod -l gnome -d /home/gnome -m "$old_user"; \
      groupmod -n gnome "$(getent group "$(id -g gnome)" | cut -d: -f1)"; \
    else \
      useradd -m -u 1000 gnome; \
    fi \
 && mkdir -p /gnomish/work /gnomish/scratch \
 && chown -R gnome:gnome /gnomish

# Поверхность политики агента: managed settings имеют приоритет над всем, что гном запишет
# в свой домашний каталог.
RUN mkdir -p /etc/claude-code \
 && printf '{}\n' > /etc/claude-code/managed-settings.json \
 && chown -R root:root /etc/claude-code \
 && chmod 0755 /etc/claude-code && chmod 0644 /etc/claude-code/managed-settings.json

# Guard — единственный путь наружу, поэтому прокси получает каждый инструмент — кроме loopback,
# через который vite preview и Playwright общаются во время test:bdd. Телеметрия и автообновление
# CLI агента проявлялись бы только как отказы egress, поэтому они отключены.
ENV HTTP_PROXY=http://${PROXY_HOST}:${PROXY_PORT} \
    HTTPS_PROXY=http://${PROXY_HOST}:${PROXY_PORT} \
    http_proxy=http://${PROXY_HOST}:${PROXY_PORT} \
    https_proxy=http://${PROXY_HOST}:${PROXY_PORT} \
    NO_PROXY=localhost,127.0.0.1,::1 \
    no_proxy=localhost,127.0.0.1,::1 \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 \
    DISABLE_AUTOUPDATER=1 \
    CI=1

# Фабрика запускает бокс с голой keep-alive командой и без --init, поэтому без этой строки
# PID 1 становится keep-alive `sleep`, который никогда не подбирает завершённые процессы: каждый
# осиротевший процесс остаётся зомби и занимает PID до гибели бокса, и бокс, живущий всю задачу,
# упирается в --pids-limit. tini подбирает их.
ENTRYPOINT ["/usr/bin/tini", "--", "docker-entrypoint.sh"]

USER gnome
WORKDIR /gnomish/work
