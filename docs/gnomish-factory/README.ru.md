# Gnomish Factory: настройка и запуск на своей машине

English version: [README.md](README.md). Обзор и таблица стадий: [README проекта](../../README.ru.md#гномская-фабрика).

В `factory/` лежат:

| Путь                             | Что это                                                                                   |
|----------------------------------|-------------------------------------------------------------------------------------------|
| `gnomish`                        | скрипт-обёртка — единственный способ запускать фабрику здесь                              |
| `gnomish-up`                     | `serve` вместе с живым дашбордом и INFO-логом в одном терминале, через обёртку            |
| `gnomish.env`                    | собственные настройки обёртки: имя проекта, уровень логов, версия фабрики, `gnomish-up`   |
| `gnomish.local.env`              | необязательные личные переопределения `gnomish.env`, в git не попадает                    |
| `project.yaml.example.host`      | шаблон файла проекта фабрики `~/.gnomish/projects/time-zones/project.yaml`, привязка host |
| `project.yaml.example.container` | тот же шаблон для привязки `container`                                                    |
| `gnomish-<version>/`             | распакованный релиз фабрики, в git не попадает, кладётся вручную                          |
| `sandbox/`                       | Dockerfile контейнера, в котором работают гномы при привязке `container`                  |
| `build-sandbox`                  | собирает этот образ с версиями инструментов, зафиксированными в репозитории               |


## Настройка фабрики на своей машине

Делается один раз на машину, из корня вашего клона. Всё личное — настройки, секреты, логи, worktree — фабрика хранит в своём домашнем каталоге `~/.gnomish` (или `$GNOMISH_HOME`) вне клона, так что ничего вашего в git не попадает.

**1. Установите инструменты.**

- Java 25+ и Claude Code CLI (`claude`) в `PATH`; один раз войдите, запустив `claude`.
- git 2.56.0 или новее в `PATH`: со старым git фабрика не запускается (macOS: `brew install git`).
- OpenSpec CLI, установленный глобально, той версии, что зафиксирована в `package.json` (`1.13.2`). Гном работает в worktree вне этого клона (`~/.gnomish/projects/time-zones/worktrees/time-zones/<task>`), где `node_modules` нет до первого `pnpm install` в стадии:

  ```bash
  npm install -g @fission-ai/openspec@1.13.2   # или: brew install openspec
  ```

- `git push` в `origin` из этого клона без запроса пароля (SSH-ключ или credential helper). Ветку задачи `gnomish/<task-id>` фабрика пушит сама, вашими git-учётными данными, и пароль никогда не спрашивает: push, которому нужен ввод, просто падает.
- Для привязки host: инструменты проекта — Node.js >= 26, pnpm, `gh`, `jq` и Playwright Chromium для проверки BDD E2E в `implement` и `fix-code`:

  ```bash
  pnpm install
  pnpm --filter @time-zones/client exec playwright install chromium
  ```

- Для привязки container: запущенный Docker. Инструменты уже есть в образе (шаг 6).

**2. Распакуйте релиз фабрики** рядом с обёрткой (в git он не попадает). Версия задаётся в `GNOMISH_VERSION` в [`gnomish.env`](../../.gnomish/factory/gnomish.env); для обновления поменяйте её там и повторите:

```bash
cd .gnomish/factory
VERSION=0.1.0
BASE=https://github.com/oinsio/gnomish-factory/releases/download/v$VERSION
curl -fL -O "$BASE/gnomish-$VERSION.tar.gz" -O "$BASE/SHA256SUMS"
shasum -a 256 -c --ignore-missing SHA256SUMS   # Linux: sha256sum -c --ignore-missing SHA256SUMS
tar -xzf "gnomish-$VERSION.tar.gz"
gnomish-$VERSION/bin/gnomish --version         # печатает 0.1.0
cd -
```

**3. Зарегистрируйте клон и выберите, где работают гномы.** В незарегистрированном каталоге фабрика не запускается. Регистрация создаёт файл проекта `~/.gnomish/projects/time-zones/project.yaml`; затем допишите в него шаблон одной из двух привязок:

| Шаблон                                                                              | Где работают гномы                                                       | Когда выбирать                                      |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------------------------------|
| [`project.yaml.example.host`](../../.gnomish/factory/project.yaml.example.host)           | на этой машине, от вашего имени: ваши файлы, ваша сеть, без ограничений  | доверяете задачам и хотите самую простую настройку  |
| [`project.yaml.example.container`](../../.gnomish/factory/project.yaml.example.container) | во временном Docker-контейнере на задачу, сеть ограничена тремя хостами  | нужна изоляция от вашей машины                      |

```bash
.gnomish/factory/gnomish project add time-zones --dir="$PWD"
cat .gnomish/factory/project.yaml.example.host >> ~/.gnomish/projects/time-zones/project.yaml   # или .container
```

Настройки фабрики — привязка, образ песочницы, egress-список — живут в файле проекта. Обёртка ждёт имя проекта `time-zones` (`GNOMISH_PROJECT_NAME` в [`gnomish.env`](../../.gnomish/factory/gnomish.env)); если регистрируете под другим именем, задайте его в `.gnomish/factory/gnomish.local.env`.

**4. Положите токены.** Каждый секрет — файл в `~/.gnomish/projects/time-zones/secrets/`. Имя файла точно совпадает с именем переменной, внутри только само значение (без `KEY=` и кавычек), права 600 — файл, доступный другим, фабрика отвергает.

| Файл                      | Нужен                              | Что положить                                                                                                            | Кто использует                                                                          |
|---------------------------|------------------------------------|-------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| `GNOMISH_GITHUB_TOKEN`    | да, для `take` и `serve`           | токен GitHub для репозитория трекера (`tracker.github.repo` в [`config.yaml`](../../.gnomish/config.yaml)): Issues read/write | фабрика: берёт issues, переставляет метки `gnomish:*`, пишет комментарии                |
| `GH_TOKEN`                | желательно                         | fine-grained токен для того же репозитория: Contents и Pull requests read/write                                         | `gh` в стадии `deliver`, чтобы открыть pull request; экспортирует обёртка               |
| `CLAUDE_CODE_OAUTH_TOKEN` | container: да; host: необязательно | токен, который печатает `claude setup-token`                                                                            | агент и судьи; экспортирует обёртка. На хосте без него используется ваш вход в `claude` |

Без `GH_TOKEN` обёртка отдаёт `gh` токен трекера — тогда ему нужны ещё Contents и Pull requests, а у гнома заодно окажутся права на issues. Простому `run` без трекера `GNOMISH_GITHUB_TOKEN` не нужен.

```bash
secrets=~/.gnomish/projects/time-zones/secrets
mkdir -p -m 700 "$secrets"
for name in GNOMISH_GITHUB_TOKEN GH_TOKEN CLAUDE_CODE_OAUTH_TOKEN; do
    install -m 600 /dev/null "$secrets/$name"
done
claude setup-token                              # печатает токен для CLAUDE_CODE_OAUTH_TOKEN
$EDITOR "$secrets/GNOMISH_GITHUB_TOKEN"         # вставьте каждый токен в свой файл и сохраните
```

Токен, общий для всех проектов, можно один раз положить в `~/.gnomish/secrets/<ИМЯ>`: сначала ищется папка проекта, потом эта.

**5. Проверьте настройку.**

```bash
.gnomish/factory/gnomish project show time-zones   # привязка и все настройки с файлом и строкой, откуда они взяты
.gnomish/factory/gnomish board                     # доступ к трекеру с вашим токеном: три колонки, пустые или с задачами
```

Настройка не на своём месте или файл секрета со слишком широкими правами останавливают фабрику до любых действий; она перечисляет все проблемы сразу, каждую с исправлением.

**6. Только для привязки container: соберите образ** — см. [Запуск в Docker](#запуск-в-docker):

```bash
.gnomish/factory/build-sandbox
```

**7. Запустите.** `serve` и `take` работают только с тем, что есть в `main`, поэтому начинайте с актуальной `main`:

```bash
.gnomish/factory/gnomish run --task="Add a meeting planner view"   # одна задача, без трекера
.gnomish/factory/gnomish-up                                        # демон по issues с меткой gnomish:ready, с дашбордом
```

Команды, логи и метки — в разделе [Запуск](#запуск).

## Запуск

Обёртка добавляет `--dir` (этот проект), загружает [`gnomish.env`](../../.gnomish/factory/gnomish.env) и экспортирует `GH_TOKEN` и `CLAUDE_CODE_OAUTH_TOKEN` из папки секретов. Настройки фабрики берутся из `~/.gnomish/factory.yaml` (хост), затем из `~/.gnomish/projects/time-zones/project.yaml`, затем из флага (`--factory.git-network-timeout=10m`). Каждый следующий источник сильнее предыдущего. Исключение — ключи границы песочницы: их задаёт только `project.yaml`. Собственные настройки обёртки переопределяются в `gnomish.local.env` или в shell (`GNOMISH_LOG_LEVEL=DEBUG .gnomish/factory/gnomish ...`).

```bash
# Разовая задача без трекера: ветка gnomish/<task-id> в worktree, клон не трогается
.gnomish/factory/gnomish run --task="Add a meeting planner view"

# Задачи из GitHub issues: повесьте на issue метку gnomish:ready, затем
.gnomish/factory/gnomish take 42          # взять этот issue
.gnomish/factory/gnomish serve --drain    # отработать всю очередь ready и выйти

# Тот же демон, но с наблюдением: открывает дашборд в браузере и показывает INFO-лог
.gnomish/factory/gnomish-up               # флаги serve передаются как есть: --drain, --slots=2
.gnomish/factory/gnomish-up --no-open --no-logs

.gnomish/factory/gnomish status <task-id> # где задача и что с ней происходило
```

`serve` и `take` читают `tracker:` из ветки по умолчанию, а стадии — из базы задачи (`main`), поэтому изменения `.gnomish/` нужно закоммитить и влить в `main`, прежде чем они там заработают. `run` тоже запускайте с актуальной `main`: ветка задачи начинается от текущей `main`, а стадии, которые её сравнивают, берут базой родителя коммита `gnomish: task started`, поэтому невлитые коммиты другой ветки засчитаются как изменения задачи.

Без `--base` команда `run` читает `.gnomish/` из рабочей копии, так что незакоммиченные правки стадии действуют сразу. Завершённая задача оставляет ветку `gnomish/<task-id>`; вливайте её squash-merge, чтобы пораундовая история осталась в ветке. Логи: `~/.gnomish/projects/time-zones/logs/default.log`. Метки: `gnomish:ready` → `gnomish:working` → `gnomish:delivered`, или `gnomish:needs-human`, когда задача передана человеку.

## Запуск в Docker

С `factory.bindings.default: host` в `project.yaml` каждый процесс гнома работает на этой машине от вашего имени, с доступом к вашим файлам и без сетевых ограничений. Привязка `container` ([`project.yaml.example.container`](../../.gnomish/factory/project.yaml.example.container)) вместо этого запускает каждую задачу во временном Docker-контейнере за egress-фильтром, который пропускает только `api.anthropic.com`, `registry.npmjs.org` и `api.github.com`.

1. **Docker**, запущенный на этой машине.
2. **Образ** — собирается один раз и заново при каждой смене версий pnpm, openspec или Playwright в репозитории (тогда же поднимите тег `factory.sandbox.image` в `project.yaml`, `build-sandbox` читает его оттуда). В нём node из `.nvmrc`, pnpm, openspec, Claude Code CLI, `gh`, `jq` и Playwright Chromium тех версий, что зафиксированы в `package.json` и `pnpm-lock.yaml`:

   ```bash
   .gnomish/factory/build-sandbox
   ```

3. **`CLAUDE_CODE_OAUTH_TOKEN`** в папке секретов ([шаг 4](#настройка-фабрики-на-своей-машине)) или `ANTHROPIC_API_KEY` в shell — в контейнере нет keychain, поэтому вход с хоста туда не переносится.

## Переключение между хостом и Docker

Режим задаёт `factory.bindings.default` в `~/.gnomish/projects/time-zones/project.yaml`: `host` или `container`. Это ключ границы песочницы, поэтому задать его можно только в этом файле. Флаг `--factory.bindings.default=...` останавливает фабрику на старте. Чтобы переключиться, поправьте файл:

```yaml
factory:
  bindings:
    default: host        # или container
```

Что нужно каждому режиму, видно по двум шаблонам: `container` дополнительно задаёт образ, egress-список и лимиты ресурсов. Все стадии конвейера работают в одном режиме — фабрика отказывается смешивать `host` и `container` по стадиям.

Java 25 и релиз фабрики остаются на хосте: сама фабрика работает там и управляет контейнерами через Docker. Хост, который нужен инструменту, но запрещён фильтром, появляется строкой `egress denial:` в `gnomish status`; добавляйте его в `factory.sandbox.egress-allowlist` в `project.yaml`, только когда знаете, какой инструмент его запросил.

Полная документация — [руководства оператора](https://github.com/oinsio/gnomish-factory/tree/main/docs/guides) фабрики (`operator-guide.md` — трекер, `-run.md` — `run`, `-serve.md` — `serve`).
