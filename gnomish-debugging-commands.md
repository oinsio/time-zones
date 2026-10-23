# Как отлаживали фабрику Gnomish в этом проекте

Сводка по логам 19 сессий Claude Code за 29–30 сентября 2026
(`~/.claude/projects/-Users-oinsio-Learning-localized-programming-projects-time-zones/*.jsonl`).

## Главный вывод

`gnomish run --interactive` (режим, где человек играет роль исполнителя или судьи)
**не запускался ни разу**. Все упоминания флага в логах — это чтение документации
(`README.md`, `docs/guides/operator-guide-run.md`, комментарий-шапка в обёртке
`.gnomish/factory/gnomish`) и вывод `UsageException`, где флаг просто перечислен
среди допустимых. Ассистент несколько раз рекомендовал этот режим пользователю,
но сам его не выполнял.

Стадии и workflow отлаживали «снаружи»: справкой-через-ошибку, `status` на
несуществующей задаче, реальным прогоном под `serve` через `gnomish-up` и
разбором логов и Docker-контейнеров.

## Подкоманды `gnomish`, которые реально запускались

### 1. `gnomish --help`, `gnomish run --help`, `gnomish resume --help`, `gnomish dashboard --help`

Запускались чаще всего. У CLI нет встроенной справки: `--help` отклоняется как
неизвестная опция, и парсер печатает `UsageException` со списком допустимых
флагов или подкоманд. Использовалось как дешёвый интроспектор:

- проверить, что джар собран и стартует, а обёртка `.gnomish/factory/gnomish`
  корректно прокидывает аргументы;
- узнать, какие опции принимает текущая сборка `run`:
  `--dir`, `--task`, `--task-file`, `--task-id`, `--from-stage`, `--interactive`,
  `--mode`, `--base`, `--resume`, `--discard-work`;
- убедиться, что подкоманды `resume` не существует (возобновление — это
  `run --resume`).

### 2. `gnomish status` и `gnomish status <несуществующий-id>`

Read-only команда. Без аргумента печатает таблицу по всем веткам `gnomish/*`
(task, shape, stage, attempts, outcome). С задачей читает `.gnomish-task/` из
ветки `gnomish/<task>` через `git show`: ничего не чекаутит, локальных веток не
создаёт, клон не мутирует.

Заведомо несуществующие id (`nonexistent`, `no-such-task`, `probe`, `x`)
давали намеренно: команда проходит весь путь загрузки Spring-контекста, чтения
`gnomish.env` / `gnomish.local.env`, регистрации проекта и разрешения секретов,
а затем гарантированно завершается кодом 6 («ветки нет»). Так проверяли обёртку,
окружение, регистрацию клона и таймауты, не запуская ни одной стадии.

Вариант: `FACTORY_GITNETWORKTIMEOUT=not-a-duration gnomish status no-such-task`
— проверка, что невалидная настройка отклоняется, а не игнорируется молча.

Коды выхода `status`: 2 — usage error (нет `--dir` или клон не зарегистрирован),
6 — нет такой ветки, 7 — ветка есть, но фабрика не может её прочитать
(shape `Corrupt` / `UnsupportedVersion` / `Unknown`), 1 — сломался сам инструмент.

### 3. `FACTORY_BINDINGS_DEFAULT=container gnomish run --task="..."`

Единственный запуск `run`, и тот с фиктивным текстом задачи. Цель: убедиться,
что биндинг `container` подхватывается из переменной окружения и валидация
пайплайна проходит. Реальная задача через `run` до конца не доходила.

## Скрипты обвязки в `.gnomish/factory/`

### 4. `gnomish-up`

Один терминал вместо трёх. В фоне:
`gnomish dashboard --watch --out=.gnomish/factory/logs/dashboard.html` и
`tail -F ~/.gnomish/logs/time-zones/gnomish.log`; на переднем плане
`gnomish serve --slots=1`. Ctrl-C останавливает все три: демон дренирует слоты,
затем гасятся дашборд и follower.

Именно через него шла реальная отладка стадий: демон брал issue с меткой
`gnomish:ready` (задача `github:oinsio/time-zones#18`), а ассистент читал
INFO-повествование из файла лога, потому что в консоль демона идут только
WARN и выше.

Свои флаги скрипта: `--no-open` (не открывать браузер), `--no-logs` (без
follower). Остальное передаётся в `gnomish serve` (`--slots=N`, `--drain`).

### 5. `build-sandbox`

Собирает образ `time-zones-gnomish-sandbox:N`. Дальше образ проверяли напрямую:

```bash
docker run --rm time-zones-gnomish-sandbox:1 sh -c \
  'id; for t in git curl jq gh node pnpm openspec claude; do ...; done; ls /opt/ms-playwright'
```

Проверялись наличие инструментов, пользователь и права, Playwright-браузеры,
сетевые переменные (`HTTP_PROXY` и т. п.).

## Что использовали помимо `gnomish` для разбора стадий

- **Лог фабрики** `~/.gnomish/logs/time-zones/gnomish.log`: срезы по времени
  (`sed -n '/HH:MM:SS/,$p'`), фильтрация стектрейсов и `ProviderDiscovery`,
  дедупликация повторяющихся строк.
- **Docker-инспекция бокса задачи** `gnomish-box-github-oinsio-time-zones-18`:
  `docker inspect` (OOMKilled, лимиты памяти / pids / cpu), `docker cp` рабочего
  `.git` и домашней директории из контейнера, проверка зомби-процессов и PID 1
  (`tini`) в тестовых контейнерах с `--pids-limit 64`.
- **Логи guard-контейнера** `gnomish-guard-github-oinsio-time-zones-18`:
  подсчёт `connect/disconnect`, поиск отказов egress (`403`, `denied`) по
  `registry.npmjs.org`, `api.anthropic.com`, `api.github.com`.
- **Уборка ресурсов задачи** по label
  `com.github.oinsio.gnomish.task=github-oinsio-time-zones-18`: контейнеры,
  volume `gnomish-vol-...`, сеть `gnomish-net-...`.
- **Проверка утечки секретов**: `ps aux | grep "docker exec"` показал токены в
  argv хостового процесса (фабрика передаёт их через `docker exec -e`).

Найденные дефекты фабрики записаны в `gnomish-factory-findings.md`.
