# Time Zones

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[![en](https://img.shields.io/badge/lang-en-blue.svg)](README.md)
[![ru](https://img.shields.io/badge/lang-ru-red.svg)](README.ru.md)

Кроссплатформенное PWA для мировых часов, перевода времени между часовыми поясами и планирования встреч. Только клиент, offline-first — без аккаунта и сервера, данные остаются на устройстве.

**Приложение:** <https://oinsio.github.io/time-zones/> — устанавливается на домашний экран, после первого визита работает офлайн.

## Содержание

- [Скриншоты](#скриншоты)
- [Возможности MVP](#возможности-mvp)
- [Локализация](#локализация)
- [Технологии](#технологии)
- [Разработка](#разработка)
- [Деплой](#деплой)
- [Гномская фабрика](#гномская-фабрика)
- [Лицензия](#лицензия)

## Скриншоты

Вид «Карточки» на телефоне и планшете. Подробности: [docs/design](docs/design/README.md).

<table>
  <tr>
    <td align="center"><img src="docs/design/screens/phone-light.png" alt="Телефон, светлая тема" width="300"></td>
    <td align="center"><img src="docs/design/screens/phone-dark.png" alt="Телефон, тёмная тема" width="300"></td>
  </tr>
  <tr>
    <td align="center">Светлая тема</td>
    <td align="center">Тёмная тема</td>
  </tr>
</table>

<img src="docs/design/screens/tablet-light.png" alt="Планшет, светлая тема" width="720">

## Возможности MVP

1. **Локации** — добавление и удаление локаций через поиск по городу, стране или аббревиатуре часового пояса (`EST`, `IST`). Каждая локация хранится по IANA-идентификатору (`"Europe/Moscow"`), а не по «сырому» смещению от UTC.
2. **Сохранение** — список локаций сохраняется на устройстве и восстанавливается при следующем визите, полностью офлайн.
3. **Домашняя локация** — одну локацию можно отметить как домашнюю; у каждой локации показывается разница с ней (`+3h`, `−5:30h`). Без домашней разница считается от времени устройства, которое всегда показано как «Здесь».
4. **Сравнение дня и ночи** — каждая локация — это карточка с её временем и слайдером, раскрашенным по местному времени суток (ночь / утро / рабочие часы / вечер), с отмеченной границей суток.
5. **Выбор времени** — потяните слайдер или введите время в любой локации; все остальные пересчитываются.
6. **Выбор даты** — выберите дату; смещения от UTC и летнее время вычисляются для выбранной даты, а не для сегодняшней.
7. **12/24-часовой формат** — переключение между 12- и 24-часовым форматом.

## Локализация

Русский и английский поддерживаются с самого начала. Система локалей рассчитана на добавление новых языков без изменения кода:

- **Автообнаружение файлов локалей** — каждый `src/locales/<code>.json` подхватывается автоматически. В каждом файле есть блок `_meta` (`code`, `name`, `nativeName`, `baseLanguage`, `emoji`); `_meta.code` должен совпадать с именем файла.
- **Добавление языка** — положите новый файл локали с полным набором ключей; язык появится в переключателе.
- **Шуточные диалекты** — тематические локали переопределяют только часть ключей своего `baseLanguage`, а всё остальное, включая правила множественного числа, берут из него.
- **Определение языка** — при первом визите используется язык браузера (`en-US` → `en`); дальше выбор пользователя сохраняется локально.

## Технологии

- React 18, TypeScript, Vite, Tailwind CSS
- Temporal API (`temporal-polyfill`) для всей работы с датой и временем
- i18next + react-i18next
- PWA через `vite-plugin-pwa` (Workbox)
- Тестирование: Vitest, vitest-cucumber (BDD unit), playwright-bdd (BDD E2E), axe-core, Stryker (мутационное)

## Разработка

Нужны Node.js >= 26 (точная мажорная версия — в `.nvmrc`) и pnpm >= 9.

```bash
pnpm install
pnpm dev          # dev-сервер
pnpm build        # production-сборка
pnpm --filter @time-zones/client preview   # раздать production-сборку (с service worker)
pnpm preflight    # lint + typecheck + тесты
```

Приложение во всех режимах (dev, preview, production) раздаётся по пути `/time-zones/`, поэтому открывайте `http://localhost:<port>/time-zones/`. Базовый путь задан в одном месте — [`packages/client/app.config.ts`](packages/client/app.config.ts).

### Замена логотипа

Все иконки (favicon, Apple touch icon, иконки манифеста 192/512 px и maskable) генерируются при сборке из одного изображения. Чтобы сменить логотип, замените [`packages/client/assets/app-icon-source.jpg`](packages/client/assets/app-icon-source.jpg) квадратным изображением (не меньше 512×512 px) и запустите `pnpm build` — больше ничего менять не нужно. Отступы и фон maskable-иконки задаются в [`packages/client/pwa-assets.config.ts`](packages/client/pwa-assets.config.ts).

Фичи разрабатываются через [OpenSpec](openspec/): `/opsx:propose` → `/opsx:apply` → `/opsx:archive`.

## Деплой

- Каждый pull request запускает [CI](.github/workflows/ci.yml): lint, typecheck, unit-тесты, production-сборку, бюджет начального JS (150 KB gzip), проверку, что сборка не изменила исходники, и smoke E2E.
- Каждый push в `main` запускает те же проверки и, только если они прошли, [деплоит](.github/workflows/deploy.yml) сборку на GitHub Pages. Упавшая проверка оставляет в работе предыдущую версию; откат — это revert в `main`.

## Гномская фабрика

[Gnomish Factory](https://github.com/oinsio/gnomish-factory) прогоняет AI-агентов («гномов») через конвейер декларативных стадий, которые лежат в этом репозитории. Каждая стадия заканчивается автоматическими проверками и LLM-судьёй; стадия, которая раз за разом не проходит, передаётся человеку, а не уходит дальше. Вся настройка лежит в [`.gnomish/`](.gnomish/):

| Путь             | Что это                                                                                                          |
|------------------|------------------------------------------------------------------------------------------------------------------|
| `config.yaml`    | трекер (GitHub issues репозитория `oinsio/time-zones`), лимит попыток, WIP-лимит, метки                          |
| `pipeline.yaml`  | порядок стадий                                                                                                   |
| `stages/<name>/` | одна стадия: `stage.yaml` (исполнитель, проверки), `instructions.md` (задание), `acceptance.md` (критерии судьи) |
| `factory/`       | всё, что запускает фабрику; лежит рядом с конвейером, но не является его частью — см. ниже                       |

В `factory/` лежат:

| Путь                             | Что это                                                                                   |
|----------------------------------|-------------------------------------------------------------------------------------------|
| `gnomish`                        | скрипт-обёртка — единственный способ запускать фабрику здесь                              |
| `gnomish-up`                     | `serve` вместе с живым дашбордом и INFO-логом в одном терминале, через обёртку            |
| `gnomish.env`                    | собственные настройки обёртки: имя проекта, уровень логов, Java, `gnomish-up`             |
| `gnomish.local.env`              | необязательные личные переопределения `gnomish.env`, в git не попадает                    |
| `project.yaml.example.host`      | шаблон файла проекта фабрики `~/.gnomish/projects/time-zones/project.yaml`, привязка host |
| `project.yaml.example.container` | тот же шаблон для привязки `container`                                                    |
| `gnomish.jar`                    | сборка фабрики, в git не попадает, кладётся вручную                                       |
| `sandbox/`                       | Dockerfile контейнера, в котором работают гномы при привязке `container`                  |
| `build-sandbox`                  | собирает этот образ с версиями инструментов, зафиксированными в репозитории               |

Конвейер ([`pipeline.yaml`](.gnomish/pipeline.yaml)) проводит задачу от идеи до pull request за восемь стадий. Ревьюеры и судьи, которые рассуживают ревьюера и исправляющего, работают на Opus; пишущие стадии — на Sonnet.

| # | Стадия         | Что делает гном                                                                                                                             | Принимается, когда                                                                                                                    |
|---|----------------|---------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| 1 | `specify`      | превращает задачу ровно в один OpenSpec change в `openspec/changes/` — та же процедура, что `/opsx:propose`                                 | один активный change, `openspec validate --changes --strict`, разделы proposal и id FR/M из [`.claude/rules/`](.claude/rules/), судья |
| 2 | `review-specs` | проверяет change на актуальность, полноту и согласованность и пишет замечания в `review-specs.md`, больше ничего не меняя                   | разделы отчёта, корректные замечания `R<n>` в статусе `open`, другие файлы не тронуты, судья                                          |
| 3 | `fix-specs`    | исправляет или обоснованно отклоняет каждое замечание, правя только файлы change                                                            | нет замечаний в `open`, у каждого есть резолюция, ничего вне change, строгая валидация, судья                                         |
| 4 | `implement`    | реализует change в `packages/client` по TDD (`/opsx:apply`) и отмечает все задачи                                                           | все задачи отмечены, лимит 300 строк, шаги CI: lint, typecheck, test, build, размер бандла, BDD E2E; судья                            |
| 5 | `review-code`  | проверяет реализацию (задачи, требования, мутационное тестирование по изменённым файлам) и пишет замечания в `review-code.md`, не меняя код | тот же формат отчёта, что у `review-specs`, другие файлы не тронуты, судья                                                            |
| 6 | `fix-code`     | исправляет по TDD замечания, которые стоит исправить, остальные обоснованно отклоняет                                                       | нет замечаний в `open`, задачи остаются отмеченными, снова шаги CI, судья                                                             |
| 7 | `archive`      | архивирует change в `openspec/changes/archive/YYYY/MM/` и вливает его дельты спецификаций в `openspec/specs/`                               | нет активного change, архив сгруппирован по году и месяцу, `openspec validate --specs --strict`, судья                                |
| 8 | `deliver`      | открывает (или обновляет) pull request в `main` и дублирует его описание в `pr-body.md`                                                     | открыт PR в `main` с осмысленным заголовком, описание ссылается на issue и совпадает с `pr-body.md`, судья                            |

Каждая стадия переходит к следующей автоматически (`advancement: auto`); после `autonomy.attemptLimit` (2) неудачных попыток задача передаётся человеку. Проверки сравнивают ветку с `origin/main`, поэтому сам `.gnomish/` должен быть в `main`, прежде чем фабрика возьмётся за задачи — см. [Запуск](#запуск).

### Настройка фабрики на своей машине

Делается один раз на машину, из корня вашего клона. Всё личное — настройки, секреты, логи, worktree — фабрика хранит в своём домашнем каталоге `~/.gnomish` (или `$GNOMISH_HOME`) вне клона, так что ничего вашего в git не попадает.

**1. Установите инструменты.**

- Java 25+ и Claude Code CLI (`claude`) в `PATH`; один раз войдите, запустив `claude`.
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

**2. Соберите jar фабрики** в клоне [gnomish-factory](https://github.com/oinsio/gnomish-factory) и скопируйте его сюда (в git он не попадает). Повторяйте после каждого обновления фабрики:

```bash
./gradlew :bootstrap:bootJar   # в клоне gnomish-factory
cp bootstrap/build/libs/bootstrap-0.1.0-SNAPSHOT.jar <time-zones>/.gnomish/factory/gnomish.jar
```

**3. Зарегистрируйте клон и выберите, где работают гномы.** В незарегистрированном каталоге фабрика не запускается. Регистрация создаёт файл проекта `~/.gnomish/projects/time-zones/project.yaml`; затем допишите в него шаблон одной из двух привязок:

| Шаблон                                                                              | Где работают гномы                                                       | Когда выбирать                                      |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------------------------------|
| [`project.yaml.example.host`](.gnomish/factory/project.yaml.example.host)           | на этой машине, от вашего имени: ваши файлы, ваша сеть, без ограничений  | доверяете задачам и хотите самую простую настройку  |
| [`project.yaml.example.container`](.gnomish/factory/project.yaml.example.container) | во временном Docker-контейнере на задачу, сеть ограничена тремя хостами  | нужна изоляция от вашей машины                      |

```bash
.gnomish/factory/gnomish project add time-zones --dir="$PWD"
cat .gnomish/factory/project.yaml.example.host >> ~/.gnomish/projects/time-zones/project.yaml   # или .container
```

Настройки фабрики — привязка, образ песочницы, egress-список — живут в файле проекта. Обёртка ждёт имя проекта `time-zones` (`GNOMISH_PROJECT_NAME` в [`gnomish.env`](.gnomish/factory/gnomish.env)); если регистрируете под другим именем, задайте его в `.gnomish/factory/gnomish.local.env`.

**4. Положите токены.** Каждый секрет — файл в `~/.gnomish/projects/time-zones/secrets/`. Имя файла точно совпадает с именем переменной, внутри только само значение (без `KEY=` и кавычек), права 600 — файл, доступный другим, фабрика отвергает.

| Файл                      | Нужен                                   | Что положить                                                                                                                    | Кто использует                                                                                         |
|---------------------------|-----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| `GNOMISH_GITHUB_TOKEN`    | да, для `take` и `serve`                | токен GitHub для репозитория трекера (`tracker.github.repo` в [`config.yaml`](.gnomish/config.yaml)): Issues read/write          | фабрика: берёт issues, переставляет метки `gnomish:*`, пишет комментарии                               |
| `GH_TOKEN`                | желательно                              | fine-grained токен для того же репозитория: Contents и Pull requests read/write                                                 | `gh` в стадии `deliver`, чтобы открыть pull request; экспортирует обёртка                              |
| `CLAUDE_CODE_OAUTH_TOKEN` | container: да; host: необязательно      | токен, который печатает `claude setup-token`                                                                                    | агент и судьи; экспортирует обёртка. На хосте без него используется ваш вход в `claude`               |

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

### Запуск

Обёртка добавляет `--dir` (этот проект), загружает [`gnomish.env`](.gnomish/factory/gnomish.env) и экспортирует `GH_TOKEN` и `CLAUDE_CODE_OAUTH_TOKEN` из папки секретов. Настройки фабрики берутся из `~/.gnomish/factory.yaml` (хост), затем из `~/.gnomish/projects/time-zones/project.yaml`, затем из флага (`--factory.git-network-timeout=10m`). Каждый следующий источник сильнее предыдущего. Исключение — ключи границы песочницы: их задаёт только `project.yaml`. Собственные настройки обёртки переопределяются в `gnomish.local.env` или в shell (`GNOMISH_LOG_LEVEL=DEBUG .gnomish/factory/gnomish ...`).

```bash
# Разовая задача без трекера: ветка gnomish/<task-id> в worktree, клон не трогается
.gnomish/factory/gnomish run --task="Add a meeting planner view"

# То же, но гнома и судью играете вы — пробный прогон стадии, которую вы правите
.gnomish/factory/gnomish run --task="..." --mode=in-place --interactive

# Задачи из GitHub issues: повесьте на issue метку gnomish:ready, затем
.gnomish/factory/gnomish take 42          # взять этот issue
.gnomish/factory/gnomish serve --drain    # отработать всю очередь ready и выйти

# Тот же демон, но с наблюдением: открывает дашборд в браузере и показывает INFO-лог
.gnomish/factory/gnomish-up               # флаги serve передаются как есть: --drain, --slots=2
.gnomish/factory/gnomish-up --no-open --no-logs

.gnomish/factory/gnomish status <task-id> # где задача и что с ней происходило
```

`serve` и `take` читают `tracker:` из ветки по умолчанию, а стадии — из базы задачи (`main`), поэтому изменения `.gnomish/` нужно закоммитить и влить в `main`, прежде чем они там заработают. `run` тоже запускайте с актуальной `main`: `fix-specs`, `implement` и `fix-code` сравнивают ветку с `origin/main`, и невлитые коммиты другой ветки засчитаются как изменения задачи.

Без `--base` команда `run` читает `.gnomish/` из рабочей копии, так что незакоммиченные правки стадии действуют сразу. Завершённая задача оставляет ветку `gnomish/<task-id>`; вливайте её squash-merge, чтобы пораундовая история осталась в ветке. Логи: `~/.gnomish/projects/time-zones/logs/default.log`. Метки: `gnomish:ready` → `gnomish:working` → `gnomish:delivered`, или `gnomish:needs-human`, когда задача передана человеку.

### Запуск в Docker

С `factory.bindings.default: host` в `project.yaml` каждый процесс гнома работает на этой машине от вашего имени, с доступом к вашим файлам и без сетевых ограничений. Привязка `container` ([`project.yaml.example.container`](.gnomish/factory/project.yaml.example.container)) вместо этого запускает каждую задачу во временном Docker-контейнере за egress-фильтром, который пропускает только `api.anthropic.com`, `registry.npmjs.org` и `api.github.com`.

1. **Docker**, запущенный на этой машине.
2. **Образ** — собирается один раз и заново при каждой смене версий pnpm, openspec или Playwright в репозитории (тогда же поднимите тег `factory.sandbox.image` в `project.yaml`, `build-sandbox` читает его оттуда). В нём node из `.nvmrc`, pnpm, openspec, Claude Code CLI, `gh`, `jq` и Playwright Chromium тех версий, что зафиксированы в `package.json` и `pnpm-lock.yaml`:

   ```bash
   .gnomish/factory/build-sandbox
   ```

3. **`CLAUDE_CODE_OAUTH_TOKEN`** в папке секретов ([шаг 4](#настройка-фабрики-на-своей-машине)) или `ANTHROPIC_API_KEY` в shell — в контейнере нет keychain, поэтому вход с хоста туда не переносится.

### Переключение между хостом и Docker

Режим задаёт `factory.bindings.default` в `~/.gnomish/projects/time-zones/project.yaml`: `host` или `container`. Это ключ границы песочницы, поэтому задать его можно только в этом файле. Флаг `--factory.bindings.default=...` останавливает фабрику на старте. Чтобы переключиться, поправьте файл:

```yaml
factory:
  bindings:
    default: host        # или container
```

Что нужно каждому режиму, видно по двум шаблонам: `container` дополнительно задаёт образ, egress-список и лимиты ресурсов. Все стадии конвейера работают в одном режиме — фабрика отказывается смешивать `host` и `container` по стадиям.

Java 25 и jar остаются на хосте: сама фабрика работает там и управляет контейнерами через Docker. Хост, который нужен инструменту, но запрещён фильтром, появляется строкой `egress denial:` в `gnomish status`; добавляйте его в `factory.sandbox.egress-allowlist` в `project.yaml`, только когда знаете, какой инструмент его запросил.

Полная документация — [руководства оператора](https://github.com/oinsio/gnomish-factory/tree/main/docs/guides) фабрики (`operator-guide.md` — трекер, `-run.md` — `run`, `-serve.md` — `serve`).

## Лицензия

[Apache License 2.0](LICENSE)
