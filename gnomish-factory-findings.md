# Замечания к Gnomish Factory

Проблемы, найденные при запуске фабрики на репозитории `time-zones`,
для передачи на исправление в `gnomish-factory`.

| # | Проблема | Серьёзность |
|---|---|---|
| 1 | [Harvest отклонён после повторного подключения сохранённого контейнера](#1-harvest-отклонён-после-повторного-подключения-сохранённого-контейнера) | высокая: задача падает в `awaitingHuman (INFRA)` |
| 2 | [Токены видны в аргументах `docker exec`](#2-токены-видны-в-аргументах-docker-exec) | высокая: утечка секретов |
| 3 | [`serve` и `dashboard` дублируют записи в `gnomish.log`](#3-serve-и-dashboard-дублируют-записи-в-gnomishlog) | низкая: шум в логе |
| 4 | [Дублированный ключ `type` в JSON состояния задачи](#4-дублированный-ключ-type-в-json-состояния-задачи) | низкая: невалидный по сути JSON |
| 5 | [Box исчерпывает лимит процессов, эскалация не называет причину](#5-box-исчерпывает-лимит-процессов-эскалация-не-называет-причину) | высокая: задача падает в `awaitingHuman (INFRA)` |
| 6 | [Окно чтения лога guard переполняется обычным трафиком](#6-окно-чтения-лога-guard-переполняется-обычным-трафиком) | средняя: запись об отказах egress может быть неполной |
| 7 | [Лимит подписки агента засчитывается как успешный раунд и сжигает попытку](#7-лимит-подписки-агента-засчитывается-как-успешный-раунд-и-сжигает-попытку) | высокая: задача эскалируется из-за квоты, а не из-за качества |
| 8 | [Sweep пишет `SKIPPED_NO_VERDICT` про контейнеры живой задачи](#8-sweep-пишет-skipped_no_verdict-про-контейнеры-живой-задачи) | низкая: шум в логе |
| 9 | [Судья без вердикта из-за лимита ходов сразу эскалирует задачу](#9-судья-без-вердикта-из-за-лимита-ходов-сразу-эскалирует-задачу) | высокая: готовая работа уходит к человеку как INFRA |
| 10 | [Промпт судьи не называет изменённые файлы](#10-промпт-судьи-не-называет-изменённые-файлы) | средняя: судья тратит ходы на поиск того, что проверять |
| 11 | [Лишние инструменты в `allowedTools` судьи отбрасываются молча](#11-лишние-инструменты-в-allowedtools-судьи-отбрасываются-молча) | низкая: конфигурация не делает того, что написано |
| 12 | [Возобновление после `attemptsExhausted` теряет замечания судьи](#12-возобновление-после-attemptsexhausted-теряет-замечания-судьи) | высокая: первый раунд после ответа человека заведомо пустой |
| 13 | [В box нет `origin/main`, проверки от базы ветки молча проходят](#13-в-box-нет-originmain-проверки-от-базы-ветки-молча-проходят) | высокая: проверка размера файлов в container-режиме ничего не проверяет |
| 14 | [Ответ человека в промпте судьи сужает проверку до одного замечания](#14-ответ-человека-в-промпте-судьи-сужает-проверку-до-одного-замечания) | средняя: Pass без полной проверки по критериям |
| 15 | [Судья в `-j` не видит git-ignored файлы гнома](#15-судья-в--j-не-видит-git-ignored-файлы-гнома) | высокая: стадия deliver в container-режиме не может пройти |
| 16 | [Подтверждение записи в трекер логируется как `event=RESUMED`](#16-подтверждение-записи-в-трекер-логируется-как-eventresumed) | низкая: лог вводит оператора в заблуждение |
| 17 | [Возобновлённая задача берёт `stage.yaml` со старта `serve`, а файлы правил — с текущего `main`](#17-возобновлённая-задача-берёт-stageyaml-со-старта-serve-а-файлы-правил--с-текущего-main) | высокая: смесь двух версий правил, падение `GF112` |

## 1. Harvest отклонён после повторного подключения сохранённого контейнера

Отчёт о сбое Gnomish Factory при возобновлении задачи на привязке `container`.
Задача: `github:oinsio/time-zones#14` («Add 'Locations' feature»).
Дата: 2026-09-30.

### Кратко

После эскалации фабрика оставляет контейнер задачи остановленным «для
инспекции». Затем она дописывает в ветку задачи на хосте служебные коммиты
жизненного цикла. При возобновлении контейнер подключается снова
(`reattached`), но эти коммиты в его рабочую копию не попадают. Первый же
harvest видит, что ветка в контейнере не является потомком ветки на хосте,
классифицирует это как «history was rewritten inside the environment
(non-fast-forward)» и роняет раунд. Задача уходит в
`awaitingHuman (INFRA)`. Гном к расхождению не причастен: он истории не
переписывал.

### Окружение

| Что | Значение |
|---|---|
| Фабрика | `gnomish.jar` v0.1.0-SNAPSHOT (сборка 2026-09-30 11:51), Java 27, Spring Boot 4.1.0 |
| Привязка | `FACTORY_BINDINGS_DEFAULT=container` (в `.gnomish/factory/gnomish.local.env`) |
| Образ | `time-zones-gnomish-sandbox:2`, runtime `runc` |
| Docker | 29.4.0 |
| git (хост) | 2.56.0 |
| Режим | `gnomish serve`, 1 слот |
| Контейнеры | `gnomish-box-github-oinsio-time-zones-14`, `gnomish-guard-github-oinsio-time-zones-14` |
| Лог | `~/.gnomish/logs/time-zones/gnomish.log` |

### Хронология (UTC+5, по `gnomish.log`)

1. **14:45:49.** Создан box `gnomish-box-github-oinsio-time-zones-14`.
2. **14:45–14:52.** Стадия `specify`, попытки 0 и 1. Оба раза судья отклонил
   результат. Раунды заканчиваются коммитами `gnomish: round specify#N`.
   Последний такой коммит, `878701c`, есть и в box, и на хосте.
3. **14:52:12.** `task finished: outcome=Escalated`.
4. **14:52:14.** `ContainerEnvironmentKeeper - kept container
   gnomish-box-github-oinsio-time-zones-14 stopped; its volume and network are
   retained for inspection`.
5. **14:52:15 и 14:52:21.** `TaskLifecycleCommitWriter` пишет **на хосте**
   `a442332 gnomish: task escalated` и `14fc7d7 gnomish: task write-confirmed`
   (оба меняют только `.gnomish-task/task.json`). Box в этот момент уже
   остановлен, и коммиты в него не попадают.
6. **15:51:13.** Человек вернул задачу в ready. `claim acquired`.
7. **15:51:14.** `BranchRepairLog - branch repair: shape=Parked
   owner=TERMINAL_TRANSITION action=resuming from the recorded position`.
8. **15:51:18.** `ContainerMaterializer - container environment
   github-oinsio-time-zones-14 reattached for branch
   gnomish/github-oinsio-time-zones-14`. Self-check проходит.
9. **15:51:19.2.** `round started`.
10. **15:51:19.3**, через 66 мс, до единого коммита гнома:
    `[GF024] mid-round harvest skipped: ... HarvestRefusedException: ...
    history was rewritten inside the environment (non-fast-forward)`.
    ```
    From ext::docker exec -i gnomish-box-github-oinsio-time-zones-14 %S /gnomish/work
     ! [rejected] gnomish/github-oinsio-time-zones-14 -> gnomish/github-oinsio-time-zones-14  (non-fast-forward)
    ```
11. **15:51:42–45.** Гном коммитит в box `d20a666` и `snapshot specify#0`
    (`54df20f`). Раунд завершается `subtype=success`.
12. **15:51:46.** `closeRound` → `EnvironmentRoundSnapshot.snapshot` →
    `harvest` снова получает `HarvestRefusedException`. Дальше
    `[GF112] executor threw`, `outcome=Escalated`, итог
    `awaitingHuman (INFRA)`.
13. **15:51:47–54.** Box снова оставлен остановленным. На хосте появляются
    `f1c8cca gnomish: task escalated` и `fbbfb9c gnomish: task write-confirmed`.

Стек второго отказа (сокращённо):

```
HarvestRefusedException: harvest refused for branch "gnomish/github-oinsio-time-zones-14": history was rewritten inside the environment (non-fast-forward)
  at ContainerHarvestFetch.classify(ContainerHarvestFetch.java:110)
  at ContainerHarvestFetch.fetch(ContainerHarvestFetch.java:74)
  at BoxGitLink.harvest(BoxGitLink.java:32)
  at ContainerTaskExecutionEnvironment.harvest(ContainerTaskExecutionEnvironment.java:141)
  at SelfCheckedEnvironment.harvest(SelfCheckedEnvironment.java:123)
  at EnvironmentRoundSnapshot.snapshot(EnvironmentRoundSnapshot.java:86)
  at SandboxRoundEnvironmentSource$SandboxRound.closeRound(SandboxRoundEnvironmentSource.java:141)
  at ExecutorRoundExecution.run(ExecutorRoundExecution.java:111)
  at CliStageExecutor.runRoundInEnvironment(CliStageExecutor.java:200)
  ...
  at TakeContainerEngineExecution.run(TakeContainerEngineExecution.java:113)
  at TakeContainerResumeRunner.lambda$resumeDecided$0(TakeContainerResumeRunner.java:108)
  at ResumeLawBinding.resolve(ResumeLawBinding.java:167)
  at ContainerResumeMechanics.resumeDecided(ContainerResumeMechanics.java:67)
  at TakeDecisionResume.resume(TakeDecisionResume.java:69)
  at TakeDispositionResume.resumeExisting(TakeDispositionResume.java:52)
  ...
```

### Состояние веток

Ветка задачи на хосте (`git log gnomish/github-oinsio-time-zones-14`):

```
fbbfb9c 10:51:53Z gnomish: task write-confirmed   ← после 2-го отказа
f1c8cca 10:51:47Z gnomish: task escalated         ← после 2-го отказа
14fc7d7 09:52:20Z gnomish: task write-confirmed   ← после 1-й эскалации, в box не попал
a442332 09:52:15Z gnomish: task escalated         ← после 1-й эскалации, в box не попал
878701c 09:52:09Z gnomish: round specify#1        ← последний общий коммит
```

Та же ветка в box (`docker cp <box>:/gnomish/work/.git`, reflog):

```
54df20f commit: gnomish: snapshot specify#0
d20a666 commit: Specify locations: correct ADR-0004 attribution in design
878701c commit: gnomish: round specify#1          ← последний общий коммит
...
a24e450 clone: from /gnomish/src
```

В reflog box нет ни одной записи `fetch`/`pull`/`reset` между `878701c` и
коммитами нового раунда. Значит, при reattach ветку box не обновили до
хостовой.

На момент шага 10 box был просто **позади** хоста (`878701c` — предок
`14fc7d7`), но harvest всё равно отказал. Обновление хостовой ветки на
`878701c` откатило бы её назад, и git ответил `[rejected] (non-fast-forward)`.
`ContainerHarvestFetch.classify` трактует любой такой отказ как «переписанную
историю», не различая «box позади» и «box разошёлся».

После шага 11 ветки уже по-настоящему разошлись: `d20a666` и `54df20f` есть
только в box, `f1c8cca` и `fbbfb9c` — только на хосте. Поэтому повторное
простое возобновление этой задачи упадёт так же.

### Как воспроизвести

1. Привязка `container`, stage с судьёй и лимитом попыток 2.
2. Задача, которую судья гарантированно отклоняет. Например, acceptance
   с заведомо невыполнимым критерием или executor `maxTurns: 1`.
3. Дождаться `outcome=Escalated` и строки `kept container ... stopped`.
   Убедиться, что на хосте в ветке задачи появились `task escalated`
   и `task write-confirmed`.
4. Вернуть задачу в ready, **без** `--discard-work`.
5. Ожидаемо в логе: `reattached` → `round started` → `[GF024]` в первые
   миллисекунды → `[GF112]` на закрытии раунда → `awaitingHuman (INFRA)`.

Минимальная проверка без агента: после шага 3 сравнить
`git rev-parse <branch>` на хосте и
`docker cp <box>:/gnomish/work/.git` + `git --git-dir=... rev-parse <branch>`.
Хэши отличаются, и хостовый впереди.

### Вероятная причина

Два места, оба в пути reattach/harvest:

1. **Reattach не синхронизирует ветку.** `ContainerMaterializer` при
   `reattached` (и/или `TakeContainerResumeRunner` /
   `ContainerResumeMechanics.resumeDecided`) не доставляет в box коммиты,
   записанные на хосте после остановки контейнера. Это коммиты
   `TaskLifecycleCommitWriter`, `BranchRepair` и любые другие хостовые.
   Свежесозданный box клонирует актуальную ветку, а переиспользованный
   остаётся на состоянии момента остановки.
2. **Коммиты жизненного цикла пишутся после keep.** Порядок на шагах 4–5:
   сначала `kept container ... stopped`, потом `task escalated`. Box
   гарантированно отстаёт на эти коммиты при любом возобновлении.
3. **Классификация слишком грубая.** `ContainerHarvestFetch.classify`
   (строка 110) не различает случаи «box позади хоста» (безопасно, harvest —
   no-op), «box впереди» (обычный fast-forward) и «истории разошлись»
   (реальная проблема). Сообщение «history was rewritten inside the
   environment» вводит в заблуждение: внутри ничего не переписывали.

### Варианты исправления

- **При reattach** обновлять ветку в box до хостовой перед стартом раунда:
  push хостовой ветки в box через тот же `ext::docker exec` канал и
  `git reset --hard` / `merge --ff-only` в `/gnomish/work`. Если box впереди
  хоста (например, остался несобранный коммит гнома), сначала сделать harvest,
  потом синхронизацию. Если истории разошлись — отказаться от reattach и
  пересоздать box от хостовой ветки, записав это в лог.
- **Или** не переиспользовать остановленный box для продолжения работы: он
  хранится для инспекции, а возобновление создаёт новый box от актуальной
  ветки (как при первом запуске и как для судей `-j`).
- **Или** писать коммиты жизненного цикла в box до остановки, чтобы хост и box
  не расходились. Но это не покрывает `BranchRepair` и ручные правки ветки.
- **В `ContainerHarvestFetch.classify`** считать «box — предок хоста»
  no-op'ом, а не отказом. Для настоящего расхождения выводить обе головы
  (`host=<sha> box=<sha> merge-base=<sha>`) и текст без слова «rewritten».
- **Тест**: escalate → keep → lifecycle-коммит на хосте → resume с reattach →
  раунд с коммитом гнома → harvest проходит, итоговая ветка содержит и
  lifecycle-коммиты, и коммит гнома.

### Последствия и обход

- Коммит гнома `d20a666` (правка атрибуции ADR-0004 в `design.md`) остался
  только в остановленном box и в ветку не попал.
- Задача #14 сейчас снова в `awaitingHuman (INFRA)`, и ветки разошлись.
- Обход: возобновлять с `--discard-work`, чтобы ветка и box пересоздались.
  Если остановленный box не удалится сам:
  `docker rm -f gnomish-box-github-oinsio-time-zones-14`.

### Повтор на #18 (2026-09-30, 22:55)

Воспроизвелось на образе `:3` и на пути возобновления INFRA-парковки.
Задача #18 остановилась с `cannotVerify` от судьи (п. 9), box оставлен
(`kept container ... stopped`), на хосте дописаны `85e75f0 task escalated`
и `bed7dc5 task write-confirmed`. После возврата в ready:
`reattached` → `round started` → через 70 мс `[GF024] ... history was
rewritten inside the environment (non-fast-forward)`. HEAD box —
`d587716 round implement#1`, предок хостовой головы, reflog box без
fetch/reset.

Для сравнения: в 22:12 та же задача возобновлялась после ESCALATION
(ответ человека), и там фабрика сделала `container environment ...
disposed` и создала box заново — сбоя не было. Похоже, путь
`resumeWithoutDecision` (INFRA) переиспользует сохранённый box, а путь с
решением человека — нет.

Заодно: после `cannotVerify` судьи возобновление запускает **новый раунд
гнома** (`attempt=2`), а не повторяет только судью, хотя работа гнома и все
командные проверки уже прошли.

Последствие видно на следующем запуске (23:00, свежий box): гном провёл
пустой раунд («I made no code changes this round»), судья с поднятым
лимитом вынес `Fail` по трём мелким замечаниям, и этот раунд оказался
последней попыткой — `attemptsExhausted`, эскалация. Попытка ушла не на
работу, а на повтор судьи, которому не хватило ходов. Если бы после
`cannotVerify` фабрика повторяла только судью, его замечания ушли бы гному
как обычный feedback, и попытка осталась бы на исправление.

### Попутное наблюдение (не причина сбоя)

Модель и инструкции стадии фабрика берёт из ветки задачи, а не из `main`.
Ветка #14 ответвлена от `8806757`, до PR #15, поэтому после возобновления
гном `specify` запустился на `claude-sonnet-5-5` со старыми
`instructions.md`, хотя в `main` уже `opus`. Для задачи, продолжающей
существующую ветку, изменения конфигурации стадий в `main` не действуют без
`--discard-work` или ребейза ветки. Это стоит либо задокументировать, либо
логировать при resume («stage config taken from task branch at <sha>,
differs from <base>»).

> **Уточнение.** В текущих исходниках `ResumeLawBinding` берёт закон стадий
> (инструкции и критерии) с **текущей вершины** базовой ветки (`main`), а не
> из ветки задачи. Наблюдение выше, вероятно, относится к более старой сборке.
> Стоит перепроверить на актуальной и, если всё так, оставить только
> предложение логировать, с какого `<sha>` взят закон при resume.

## 2. Токены видны в аргументах `docker exec`

Задача: `github:oinsio/time-zones#18`, стадия `specify`, попытка 0.
Дата: 2026-09-30. Привязка и версия фабрики те же, что в п. 1.

### Кратко

Секреты для агента фабрика передаёт в контейнер через `docker exec -e ИМЯ=значение`.
Значения попадают в argv хостового процесса `docker exec` и видны в `ps aux`
всё время, пока идёт раунд. Их может прочитать любой процесс и любой
пользователь на машине: на macOS `ps` показывает аргументы чужих процессов.
Там же лежат и не секретные переменные прокси и решений.

### Что видно

Вывод `ps aux` во время раунда, значения токенов заменены на `<REDACTED>`:

```
docker exec -w /gnomish/work -i \
  -e GH_TOKEN=<REDACTED> \
  -e HTTP_PROXY=http://gnomish-guard:8080 -e http_proxy=... -e https_proxy=... -e HTTPS_PROXY=... \
  -e GNOMISH_DECISION_FILE=.gnomish-task/decisions/specify-a0.json \
  -e CLAUDE_CODE_OAUTH_TOKEN=<REDACTED> \
  gnomish-box-github-oinsio-time-zones-18 claude -p --model opus ...
```

В открытом виде раскрыты два секрета:

- `GH_TOKEN`: fine-grained PAT GitHub (`github_pat_...`);
- `CLAUDE_CODE_OAUTH_TOKEN`: OAuth-токен Claude (`sk-ant-oat01-...`).

Оба значения целиком оказались в выводе инструментов сессии наблюдения, то
есть уже покинули пределы фабрики.

### Как воспроизвести

1. `gnomish serve` с привязкой `container`, `GH_TOKEN` и `CLAUDE_CODE_OAUTH_TOKEN`
   в env-passthrough.
2. Во время любого раунда агента выполнить на хосте
   `ps aux | grep 'docker exec'`.
3. Значения токенов видны в командной строке.

### Варианты исправления

- Передавать только имена: `docker exec -e GH_TOKEN -e CLAUDE_CODE_OAUTH_TOKEN ...`
  и выставлять значения в окружении дочернего процесса (`ProcessBuilder.environment()`).
  `docker` возьмёт значения из своего окружения, в argv они не попадут.
  Окружение процесса другим пользователям не видно.
- Или `--env-file` с временным файлом `0600`, который удаляется после
  старта exec. Этот вариант хуже: секрет на время ложится на диск.
- Или доставлять секреты в box при создании контейнера через файл/tmpfs, а
  не на каждый exec.
- Проверить остальные места, где фабрика собирает команды `docker`/`git`
  с секретами: `docker run`/`create` при материализации, `ext::docker exec`
  в harvest, запуск судей. Проверить и логи: не пишется ли где-то полная
  командная строка.
- **Тест**: собранный argv для `docker exec` не содержит значений
  переменных из env-passthrough, только их имена.

### Последствия и обход

- Оба токена отозвать и перевыпустить.
- До исправления: давать PAT минимальные права и короткий срок жизни, не
  запускать фабрику на машине с другими пользователями.

## 3. `serve` и `dashboard` дублируют записи в `gnomish.log`

Дата: 2026-09-30.

### Кратко

`gnomish-up` запускает два JVM-процесса одного `gnomish.jar`:
`dashboard --watch` и `serve`. Скрипт экспортирует `GNOMISH_LOG_DIR`, чтобы
демон и `tail -F` смотрели в один файл. Но файловый аппендер есть в обоих
процессах, поэтому `dashboard` тоже пишет в `~/.gnomish/logs/time-zones/gnomish.log`.
Stdout дашборда при этом уходит в `dashboard-render.log`.

### Что видно

Стартовый блок (`ProviderDiscoveryReport`, `GitVersionCheck`, `Started
FactoryApplication`) записан дважды, с разными таймингами. Это две разные JVM:

```
17:14:35,213 ... FactoryApplication - Started FactoryApplication in 0.652 seconds (process running for 0.877)
17:14:35,213 ... FactoryApplication - Started FactoryApplication in 0.614 seconds (process running for 0.807)
17:14:35,222 ... GitVersionCheck - git version 2.56.0 meets the floor 2.45.1
17:14:35,222 ... GitVersionCheck - git version 2.56.0 meets the floor 2.45.1
```

Записи по задачам после старта не дублируются, их пишет только `serve`.
Строки обоих процессов идут через `[main]`, и различить их нельзя: в формате
нет PID или имени команды.

### Варианты исправления

- Для `dashboard` отключить файловый аппендер или писать в отдельный файл
  (например, `dashboard.log`).
- Или добавить в паттерн лога PID/имя подкоманды (`serve`, `dashboard`),
  чтобы строки можно было различить.
- Два процесса, пишущие в один файл без координации, могут перемешивать
  строки. При ротации файла логгер в каждой JVM работает сам по себе, и они
  конфликтуют. Отдельный файл решает обе проблемы.

## 4. Дублированный ключ `type` в JSON состояния задачи

Дата: 2026-09-30. Найдено на ветках задач `#14` и `#18`.

### Кратко

В файлах `.gnomish-task/state.json` и `.gnomish-task/task.json`, которые
фабрика коммитит в ветку задачи, у полиморфных объектов ключ `type`
записан дважды подряд:

```json
"position":{"type":"atStage","type":"atStage","stage":"specify"}
```

### Где встречается

| Файл | Поле | Значение |
|---|---|---|
| `state.json` | `position` | `atStage` |
| `task.json` | `outcome` | `escalated` |
| `task.json` | `report` | `cannotExecute` |
| `task.json` | `lastEscalation` | `cannotExecute` |

Проверка: `git grep -o '"[a-zA-Z]*":{"type":"[a-zA-Z]*","type"' <branch> -- .gnomish-task/`.
Видимо, дубль есть у всех sealed-иерархий, которые сериализуются с
дискриминатором `type`.

### Вероятная причина

Классическая ошибка Jackson: `@JsonTypeInfo(use = NAME, property = "type")`
(по умолчанию `include = PROPERTY`) выписывает дискриминатор, и при этом у
типа есть собственное свойство `type`: record-компонент, геттер `type()` /
`getType()` или `@JsonProperty("type")`. Оно сериализуется второй раз.

### Чем плохо

- RFC 8259 требует, чтобы имена в объекте были уникальны (SHOULD). Поведение
  парсеров на дублях разное: большинство берёт последнее значение молча,
  строгие (Jackson с `STRICT_DUPLICATE_DETECTION`, часть валидаторов схем,
  некоторые линтеры) падают.
- Если значения когда-нибудь разойдутся (например, геттер вычисляет тип
  иначе, чем имя подтипа), результат чтения будет зависеть от парсера.
- Файлы лежат в git и читаются людьми и внешними инструментами (дашборд,
  скрипты), так что формат — фактически публичный.

### Варианты исправления

- Убрать собственное свойство `type` из сериализации (`@JsonIgnore` на
  геттере) и оставить только дискриминатор.
- Или объявить `include = EXISTING_PROPERTY`, чтобы Jackson использовал
  существующее свойство как дискриминатор и не писал второе.
- **Тест**: сериализация каждого подтипа `position`, `outcome`, `report`,
  `lastEscalation` проходит через парсер с `STRICT_DUPLICATE_DETECTION`, и
  round-trip восстанавливает исходный объект.

## 5. Box исчерпывает лимит процессов, эскалация не называет причину

Задача: `github:oinsio/time-zones#18`, стадия `implement`, попытка 1.
Дата: 2026-09-30.

### Кратко

Во время прогонов Stryker в box закончились PID (`--pids-limit 512`).
Сначала `spawn ps EAGAIN` получал Stryker. Потом процесс не смог
запустить уже сам `claude` CLI, и он завершился, не выдав событие `result`.
Фабрика эскалировала задачу как `cannotExecute` с причиной
`MissingResultEventException: stream-json carried no result event`, итог —
`awaitingHuman (INFRA)`. Ни в логе, ни в `task.json` нет ни слова о
нехватке процессов. Причину удалось восстановить только по транскрипту
сессии, скопированному из остановленного box.

### Хронология (UTC+5)

1. **18:23–18:41.** `implement`, попытка 0, sonnet. Раунд закончился на
   `error_max_turns`. Box тот же, что и у всех предыдущих стадий, работает
   с 17:15.
2. **18:43:02.** Попытка 1: первый прогон Stryker на 4 файла падает с
   `spawn ps EAGAIN` (`errno -11`). Stryker вызывает `ps` через `tree-kill`,
   чтобы убить дочерние процессы test runner'ов.
3. **18:43–18:44.** Гном пишет поддельный `ps` в `/tmp/shim` (читает
   `/proc/*/stat`, в одной из версий отдаёт фиктивный PID `99999999`) и
   перезапускает Stryker с `--concurrency 1` и `PATH=/tmp/shim:$PATH`.
   Работа продолжается.
4. **18:43–18:57.** За 14 минут гном запускает Stryker 15 раз.
5. **18:56:56.** Очередной прогон снова получает `spawn ps EAGAIN`.
6. **18:57:01.** Гном вызывает Bash (`ls /proc | grep -c '^[0-9]'`, затем
   снова Stryker). На этом транскрипт обрывается: результата у вызова нет.
7. **18:57:10.** `[GF006] round failed before close`, `[GF112] executor
   threw ... MissingResultEventException ... read 920089 bytes, 182
   event(s)`, `task finished: outcome=Escalated`.
8. Box остановлен: `Exited (137)`, `OOMKilled=false`. Коммиты гнома до
   18:51 (`a6ef225`) harvest'нуты. Работа после них, если была, осталась
   только в остановленном box.

### Вероятная причина

Три фактора складываются:

1. **В box нет init, который собирает зомби.** Фабрика запускает
   контейнер без `--init` (`DockerCommands.runContainer`), PID 1 —
   `sleep 2147483647` (`KEEP_ALIVE`). `sleep` не вызывает `wait()`, поэтому
   каждый осиротевший процесс после завершения остаётся зомби и
   продолжает занимать PID до конца жизни контейнера. А box живёт всю
   задачу: все стадии и попытки.
2. **В образе нет `ps`.** `node:*-bookworm-slim` не содержит `procps`.
   `tree-kill`, которым Stryker убивает дочерние процессы, запускает
   `ps -o pid --no-headers --ppid N` и без `ps` падает. Test runner'ы
   vitest, воркеры пула и сервисы esbuild не убиваются и остаются
   сиротами. Каждый прогон Stryker добавляет новых.
3. **Лимит 512 рассчитан на одну сборку, а не на час работы.** Утечка
   PID копится с 17:15 через все стадии, и сотня прогонов тестов и Stryker
   добивает лимит.

Число процессов в момент сбоя не зафиксировано: box остановлен, а вызов
`ls /proc` гнома результата не вернул. Механизм утечки подтверждён
экспериментом на том же образе: 5 раз `docker exec ... sh -c '(sleep 0.2 &)'`,
через секунду посчитать процессы в состоянии `Z`.

| Запуск | PID 1 | Зомби | `pids.current` |
|---|---|---|---|
| как у фабрики (`sleep`, без init) | `sleep` | 5 | 7 |
| с `--init` | `docker-init` | 0 | 3 |

### Что не так на стороне фабрики

- **Нет init в box.** Для контейнера, который живёт долго и в котором
  гоняют произвольные сборки, `--init` (tini) обязателен.
- **Эскалация неинформативна.** `MissingResultEventException` описывает
  симптом, а не причину. У фабрики были данные, чтобы назвать её: код
  выхода `docker exec`, stderr агента, последние события потока, число
  процессов в box (`/sys/fs/cgroup/pids.current` и `pids.max`,
  `pids.events` со счётчиком `max`). Причина уровня «box упёрся в
  pids-limit» — это инфраструктура, и её стоит отличать от падения агента.
- **Документация обещает другое.** `operator-guide-sandbox.md`, раздел
  «Resource limits»: «A build that exceeds a limit dies inside the box and
  surfaces as an ordinary quality failure with attempt mechanics». Здесь
  вместо quality failure с новой попыткой вышла эскалация INFRA: умер не
  build, а сам агент.

### Варианты исправления

- Запускать box с `--init`, либо дать образу init в `ENTRYPOINT` и
  проверять это в self-check.
- При `MissingResultEventException` собирать диагностику: код выхода,
  хвост stderr, `pids.current`/`pids.max`/`pids.events`, `memory.events`
  из cgroup box. Класть её в `report.cause` и в лог.
- Если cgroup сообщает, что лимит pids или memory был достигнут,
  классифицировать сбой как «resource limit» с понятным текстом и
  подсказкой (`factory.sandbox.limits.pids`).
- Добавить в self-check проверку, что в box есть `ps` (или хотя бы
  предупреждение: без него `tree-kill` и аналоги не работают).
- **Тест**: box без init, агент порождает осиротевшие процессы до
  исчерпания лимита → эскалация содержит `pids.max`/`pids.events` и
  класс «resource limit», а не голое «no result event».

## 6. Окно чтения лога guard переполняется обычным трафиком

Задача: `github:oinsio/time-zones#18`, стадия `implement`, попытка 0.
Дата: 2026-09-30.

### Кратко

В конце раунда фабрика написала:

```
WARN [GF122] egress guard log read for github-oinsio-time-zones-18 filled its 1000-line tail window; older lines of this window were dropped before parsing and are not in the findings (NFR-O1)
```

`operator-guide-sandbox.md` объясняет эту запись так: «Expect it after a
denial storm». Но отказов здесь не было. За 18 минут раунда (18:23:37–18:41:26)
guard записал **5285 строк**, и все они — разрешённый трафик:

| Что | Строк |
|---|---|
| `registry.npmjs.org` (упоминаний) | 2593 |
| `client connect` / `server connect` | 1330 / 1327 |
| `client disconnect` / `server disconnect` | 1314 / 1314 |
| `api.anthropic.com` | 48 |
| отказы | 0 |

Почти всё — `pnpm install` внутри box: у свежего box пустой store, и
каждый пакет — это отдельное соединение с `registry.npmjs.org`, по 4 строки
в логе на каждое.

### Чем плохо

- Окно в 1000 строк считает все строки guard, а не только отказы. Любой
  раунд с установкой зависимостей его переполняет. WARN становится
  постоянным, и на него перестанут обращать внимание.
- При этом отказы действительно могут теряться: если гном попробует
  сходить на запрещённый хост в начале раунда, а потом запустит
  `pnpm install`, отказ выпадет из окна. Запись об отказах из надёжной
  превращается в «нижнюю оценку» на каждом раунде `implement`.

### Варианты исправления

- Читать лог guard инкрементально по курсору (`egressCursor` в `state.json`
  уже есть), а не хвостом фиксированного размера.
- Или фильтровать строки об отказах на стороне guard: отдельный лог или
  уровень логирования, в котором разрешённые соединения не пишутся.
- Или по крайней мере считать окно в отказах, а не в строках.
- Поправить описание в `operator-guide-sandbox.md`: переполнение бывает и
  без denial storm.
- Отдельно, для песочницы: `pnpm install` в каждом новом box скачивает
  весь store через guard. Кэш store в образе или общий read-only volume
  убрали бы и этот трафик, и минуты ожидания.

Повторилось после возобновления #18 (20:24:08): новый box, раунд длиной
4 минуты, снова `[GF122]`.

## 7. Лимит подписки агента засчитывается как успешный раунд и сжигает попытку

Задача: `github:oinsio/time-zones#18`, стадия `implement`, попытка 1
(возобновление после п. 5). Дата: 2026-09-30.

### Кратко

Через 4 минуты после старта раунда агент упёрся в лимит подписки Claude.
CLI завершился событием `result` с `subtype=success` и текстом лимита вместо
итога работы. Фабрика приняла это за нормально законченный раунд, прогнала
проверки стадии, получила провал (задачи в `tasks.md` не закрыты) и
засчитала последнюю попытку. Итог: `awaitingHuman (ESCALATION)` с
`attemptsUsed=2`. По сути это инфраструктурный сбой (кончилась квота), а
обработан он как провал качества.

### Хронология (UTC+5, по `gnomish.log`)

1. **20:19:51.** `run started: position=AtStage[name=implement], attemptsUsed=1`.
2. **20:19:52.** `round started: model=claude-sonnet-5-5`.
3. **~20:20–20:24.** Гном закрывает задачи 6.1–6.4 (коммит `776f5ff`).
4. **20:24:08.** Раунд завершён:
   ```
   round finished: subtype=success, tokensByModel={claude-sonnet-5-5=TokenUsage[input=72, output=27547, cacheCreation=127928, cacheRead=3313796]}, summary=You've hit your session limit · resets 5:10pm (UTC)
   ```
5. **20:24:09.** Проверки: `pnpm install` → Pass; проверка открытых задач
   в `tasks.md` → Fail (17 открытых, начиная с 8.7).
6. **20:24:14.** `attempt finished: attemptsUsed=2`, `task finished: outcome=Escalated`.
7. **20:24:23.** `task summary: outcome=awaitingHuman (ESCALATION), stage=implement, attempts=2`.

### Чем плохо

- Попытка потрачена не на работу гнома, а на квоту. С `attemptLimit: 2`
  одного такого раунда хватает, чтобы задача ушла к человеку.
- Эскалация выглядит как провал качества («tasks still open»). Человек,
  читающий её, не видит настоящей причины, если не откроет лог.
- Бессмысленно тратятся проверки, а при их прохождении ещё и голос судьи.
- Если бы следующая попытка оставалась, она бы стартовала сразу и тоже
  упёрлась в лимит.

### Варианты исправления

- Распознавать исчерпание квоты по событию `result` агента: флаг
  `is_error`, признак rate limit / HTTP 429 в потоке, текст «hit your
  session limit» / «usage limit» как последний fallback.
- Классифицировать такой раунд как INFRA («agent quota exhausted»), не
  засчитывать попытку, не запускать проверки и судью. Harvest коммитов
  гнома делать как обычно, чтобы работа не терялась.
- Парковать задачу до времени сброса (`resets 5:10pm (UTC)` разбирается) и
  возобновлять автоматически. Или хотя бы паузить `serve` целиком: у
  следующей задачи из очереди та же квота.
- В сводке задачи и в комментарии на issue писать причину и время сброса.
- **Тест**: агент-заглушка отдаёт `result` с текстом лимита → попытка не
  засчитана, проверки не запускались, задача запаркована с причиной quota и
  временем возобновления.

### Попутно: исправление п. 5 работает

В новом box на образе с tini в 20:23 было 0 зомби, 21 процесс,
`pids.current=121` при `pids.max=2048`. Под нагрузкой Stryker проверить не
успели: раунд оборвался раньше.

## 8. Sweep пишет `SKIPPED_NO_VERDICT` про контейнеры живой задачи

Задача: `github:oinsio/time-zones#18`. Дата: 2026-09-30.

### Что видно

Через 4 минуты после создания box, посреди идущего раунда:

```
20:24:05 WARN [gnomish-sandbox-lifecycle-tick] [component=sweep] gnomish.sandbox.lifecycle - sweep SKIPPED_NO_VERDICT object=gnomish-guard-github-oinsio-time-zones-18 role=guard mode=tracked task=github-oinsio-time-zones-18 reason="no liveness verdict" age=PT4M16.855841078S
20:24:05 WARN ... sweep SKIPPED_NO_VERDICT object=gnomish-box-github-oinsio-time-zones-18 role=main-box mode=tracked ...
```

Контейнеры не тронуты, работа не пострадала. Но задача в этот момент
держит слот (`claim acquired` в 20:19:45), и вердикт «жива» у фабрики
должен быть.

### Вероятная причина (не проверена)

Sweep, видимо, работает и во втором JVM, `dashboard --watch` (см. п. 3), у
которого нет сведений о claim процесса `serve`. Либо sweep в `serve` не
получает liveness от реестра слотов. По логу это не различить: у строк нет
PID и имени подкоманды.

### Варианты исправления

- Для задачи, которую держит слот этого же процесса, выдавать вердикт
  «alive» и ничего не писать.
- Если sweep работает в `dashboard`, отключить его там или понизить
  `SKIPPED_NO_VERDICT` до DEBUG: пропуск — безопасное поведение, а WARN на
  каждом тике приучает не смотреть в предупреждения.

## 9. Судья без вердикта из-за лимита ходов сразу эскалирует задачу

Задача: `github:oinsio/time-zones#18`, стадия `implement`, попытка 1.
Дата: 2026-09-30.

### Кратко

Гном закончил стадию, все 10 командных проверок прошли. Судья (opus,
`maxTurns: 30`) израсходовал ходы, так и не дописав итоговое сообщение.
Фабрика не смогла извлечь вердикт, поставила проверке `CannotVerify` и сразу
эскалировала задачу как INFRA. Готовая работа ушла к человеку, хотя
проблема была только в бюджете судьи.

### Что видно (UTC+5)

```
22:34:00 check finished: command:... test:bdd -> Pass   (и все остальные command-проверки)
22:34:02 round started: model=claude-opus-5-5            (судья, box ...-18-j)
22:36:44 round finished: subtype=error_max_turns, tokensByModel={claude-opus-5-5=TokenUsage[input=60, output=11111, cacheCreation=158389, cacheRead=3124289]}, summary=
22:36:44 WARN [GF011] judge verdict could not be extracted (judge produced no final message); raw final message:
22:36:44 check finished: judge:stages/implement/acceptance.md -> CannotVerify
22:36:47 attempt finished: attemptsUsed=1
22:36:47 task finished: outcome=Escalated
22:36:58 task summary: outcome=awaitingHuman (INFRA), stage=implement, attempts=1
```

В `task.json`:

```json
{"type":"cannotVerify","check":"judge:stages/implement/acceptance.md","reason":"judge produced no final message","details":""}
```

Размер change: 187 файлов, +10 404 строк относительно `main`.

### Чем плохо

- Судья, не уложившийся в ходы, — предсказуемая и повторяемая ситуация, а
  не сбой инфраструктуры. Эскалация INFRA заставляет человека вмешаться,
  хотя фабрика могла бы справиться сама.
- `details` пустое. Из эскалации не видно, что причина в
  `error_max_turns`, хотя `subtype` был в потоке. Человеку приходится идти
  в лог.
- Повторное возобновление без изменения настроек упадёт так же: судья
  получит тот же бюджет на тот же объём.

### Варианты исправления

- При `error_max_turns` у судьи продолжить ту же сессию одним коротким
  ходом с требованием выдать вердикт по уже прочитанному (`--resume
  <sessionId>` с промптом «give the verdict JSON now»).
- Или повторить голос судьи один раз, прежде чем эскалировать.
- Писать в `details` подтип раунда и число использованных ходов:
  `judge ran out of turns (error_max_turns, maxTurns=30)`, с подсказкой
  поднять `verify[n].settings.maxTurns`.
- Предупреждать заранее: если размер diff заметно больше того, что судья
  успевает прочитать за `maxTurns`, писать WARN до запуска судьи.

### Попутно: токены судьи не попали в итог задачи

В `task summary` в 22:36:58 opus указан как `496/296656/906524/31067967`,
ровно как в сводке 20:24:23 до этого запуска. Раунд судьи
(`60/11111/158389/3124289`) в итог не вошёл. Sonnet сходится точно: прирост
равен сумме двух раундов гнома. Не проверено, теряются ли токены только у
судьи без вердикта или у любого судьи.

## 10. Промпт судьи не называет изменённые файлы

Дата: 2026-09-30. Найдено при разборе п. 9.

### Кратко

`JudgePromptBuilder` собирает промпт судьи из трёх частей: контекст задачи,
текст `acceptance.md` и формат вердикта. Судья при этом жёстко ограничен
`Read`/`Grep`/`Glob`, и git у него нет. Поэтому узнать, что изменилось в
ветке, он может только поиском по дереву, и на это уходят ходы. У фабрики
git есть, и diff она знает.

### Варианты исправления

- Добавлять в промпт судьи список файлов, изменённых относительно базы
  (`git diff --name-status <merge-base>`), как данные в тех же
  разделителях, что и контекст задачи.
- Опционально — `--stat` или diff целиком до порога по размеру.
- Документировать это в `operator-guide`, чтобы авторы `acceptance.md`
  могли на это опираться.

## 11. Лишние инструменты в `allowedTools` судьи отбрасываются молча

Дата: 2026-09-30.

### Кратко

`AgentInvocationOptions.renderForJudge` берёт пересечение настройки
`allowedTools` с жёстким набором `Read`, `Grep`, `Glob`. Всё остальное,
включая `Bash` и шаблоны вроде `Bash(git diff:*)`, выбрасывается без
ошибки и без предупреждения. `AgentSettingsValidator` проверяет только
форму значения (список строк). Оператор, который прописал судье
`Bash(git diff:*)`, не узнает, что настройка не действует.

Судья read-only по замыслу (FR12, NFR-S1), претензия только к молчанию.
По той же причине `disallowedTools: [Bash, Edit, Write, …]` в настройках
судьи ничего не делает, и конфигурация проекта вводит в заблуждение.

### Варианты исправления

- В `AgentSettingsValidator` на старте: `ConfigError` или хотя бы WARN
  для каждого элемента `allowedTools` судьи вне read-only набора, с
  текстом «judges are read-only; '<tool>' is ignored».
- Описать read-only набор судьи в `operator-guide`.
- Если нужен git для судьи, рассмотреть узкий read-only инструмент от
  фабрики (или п. 10), а не расширение `allowedTools`.

## 12. Возобновление после `attemptsExhausted` теряет замечания судьи

Дата: 2026-09-30, задача #18, стадия implement.

### Что произошло

- 23:04: судья `Fail` с тремя мелкими замечаниями, попытки исчерпаны,
  эскалация `attemptsExhausted`.
- Человек ответил «Continue» и вернул задачу в `gnomish:ready`. Ответ
  записан в `task.json` как decision (`18:07:18Z`).
- 23:07:20: старый box удалён, записан коммит `RESUMED`, `attemptsUsed=0`.
  Создан свежий box, так что п. 1 на этом пути не воспроизводится.
- 23:07–23:09: гном отработал 1 мин 40 с и ничего не изменил. Его итог:
  «The implementation of `add-locations-via-search` was already finished
  before this round, so I made no code changes and no commits.» Замечаний
  судьи он не видел: ни одно из трёх не исправлено, снапшот `implement#0`
  пустой.
- Дальше снова все командные проверки и судья. Если судья найдёт те же
  три проблемы, попытка сгорит впустую, и только следующий раунд получит
  их как обратную связь.

### Причина (по коду)

- `RoundExecution.priorFailures(state)` собирает обратную связь для гнома
  только из `state.attempts()`.
- `TakeDecisionResume.resume` для `AttemptsExhausted` вызывает
  `finalState.resetAttempts()`, а это `new TaskState(position, 0,
  List.of(), totals)`. Список попыток обнуляется вместе со счётчиком, и
  вместе с ним пропадают findings последнего судьи.
- Ответ человека попадает в контекст (`appendDecision`), но это только его
  текст, здесь «Continue». Без ответа (`latest == null`) гном не получает
  вообще ничего нового. Ни в одном из случаев findings судьи не
  передаются.
- Побочно: `.gnomish-task/attempts/implement/0/trace.jsonl` после сброса
  относится к новому раунду с тем же номером 0, так что трасса старой
  попытки 0 перезаписывается или смешивается.

### Вред

- Первый раунд после ответа человека заведомо пустой: полный прогон
  проверок (около 3 минут, включая BDD E2E) и судья на opus, чтобы заново
  получить то, что фабрика уже знала.
- Чтобы гном увидел замечания, человеку приходится копировать их в ответ
  вручную. Это неочевидно, и нигде это не описано.

### Варианты исправления

- Сбрасывать счётчик `attemptsUsed`, но сохранять findings последней
  неуспешной попытки (или всех) как обратную связь для первого раунда
  после возобновления.
- Либо при `attemptsExhausted` класть findings последнего судьи в
  `TaskContext` рядом с ответом человека, так же как `appendDecision`.
- Нумеровать попытки сквозь сбросы (или по эпохам), чтобы трассы не
  перезаписывались.

### Тест

Задача с `maxAttempts=1`, судья `Fail` с finding X, возобновление с
ответом «Continue» и без ответа: запрос к исполнителю в первом раунде после возобновления
содержит X.

## 13. В box нет `origin/main`, проверки от базы ветки молча проходят

Дата: 2026-09-30, задача #18, стадия implement.

### Что произошло

Судья в 23:12 указал на файлы больше жёсткого лимита в 300 строк:
`adapters/localStorageLocationRepository.test.ts` (401 строка) и
`controller/useLocations.test.tsx` (354 строки). Командная проверка
размера файлов перед ним прошла (`-> Pass`), хотя должна была их поймать.

### Причина

Клон в box (`/gnomish/work`) содержит одну ветку
`gnomish/github-oinsio-time-zones-18`. В нём нет ни remote, ни `main`, ни
`origin/main`. Проверка проекта начинается с

```sh
base=$(git merge-base HEAD origin/main);
```

`merge-base` падает с `fatal: Not a valid object name origin/main`, `base`
получается пустым. Дальше `git diff --name-only --diff-filter=AM "" --
packages/client/src` сравнивает рабочее дерево с индексом, а там пусто.
Список файлов пустой, и проверка проходит.

Вина делится:

- **Проект:** проверка не падает при пустой базе. Её надо чинить в любом
  случае.
- **Фабрика:** base ref задачи (`task-branch.base`) фабрике известен, но в
  box его нет. Об этом нигде не сказано: `operator-guide-sandbox` не
  упоминает, какие refs доступны внутри box. Скрипт, написанный для
  host-режима, молча ломается в container-режиме.

Затронуто в проекте:

- та же проверка размера в specify, fix-specs, implement и fix-code;
- fallback `since=$(git merge-base HEAD origin/main)` в проверках
  границ стадий (сейчас спасает то, что round-коммиты предыдущей стадии
  есть);
- инструкции implement, review-code, archive и deliver велят агенту
  выполнять `git diff … origin/main`. В box эти команды падают, и агент
  тратит ходы на обходные пути.

### Вред

- Проверка размера файлов в container-режиме ничего не проверяет. Это
  всплыло только у судьи на opus, после сброса попыток.
- Ошибку видно только по косвенному признаку: судья пишет то, что должна
  была поймать команда.

### Варианты исправления (фабрика)

- Класть в клон box ref базы, например `refs/remotes/origin/<base>` или
  `refs/gnomish/base`, и экспортировать `GNOMISH_BASE_REF` или
  `GNOMISH_BASE_SHA` в окружение проверок и агента.
- Документировать в `operator-guide-sandbox`, какие refs доступны в box, и
  предупредить, что `origin/*` там нет.

### Варианты исправления (проект)

- Падать, если база не найдена: `base=$(git merge-base HEAD origin/main)
  || { echo "no origin/main in this checkout"; exit 1; }`. Либо брать базу
  из переменной фабрики, когда она появится.
- До исправления в фабрике брать базу от первого коммита фабрики на
  ветке или считать размер по всем файлам `packages/client/src`.

## 14. Ответ человека в промпте судьи сужает проверку до одного замечания

Дата: 2026-09-30, задача #18, стадия implement.

### Что произошло

- 23:19: судья `Fail` с одним замечанием (`fallback: "none"` повторён
  литералом). Эскалация `attemptsExhausted`.
- Человек ответил текстом этого замечания (обход п. 12) и вернул задачу.
- 23:25: гном исправил замечание.
- 23:26:22–23:26:38: судья на opus отработал за **16 секунд** (1 386
  output-токенов; у полной проверки в 23:12 было 11 724) и вернул `Pass`.
  Его итог начинается со слов «The previous round's finding is fixed, and
  the checks below found nothing new». Про трассируемость он пишет «both
  files I opened», то есть открыл два файла из 187.

### Причина

`JudgePromptBuilder` кладёт в промпт судьи контекст задачи вместе с
decisions (`BriefingSections.renderDecisions`). Ответ человека, где
названо одно замечание, судья принимает за рамку проверки. Он проверяет
исправление и несколько grep-проверок, а не все критерии
`acceptance.md`, хотя тот требует «Check every criterion above before you
give a verdict».

В этом случае вреда не было: полная проверка в 23:19 нашла только это
замечание, а после неё менялись лишь две строки. В общем случае это
лазейка. Ответ человека вида «исправь X» превращает следующий вердикт в
проверку одного X, а всё, что гном сломал попутно, судья пропустит.

Связь с п. 12: обход п. 12 (копировать замечания в ответ) как раз и
создаёт этот эффект.

Decisions ещё и переживают стадию. В 23:57 судья fix-code (21 секунда)
начал свой итог с «the duplicated-literal fix you asked for is done» и
отдельным пунктом «Your request (duplicated `fallback: "none"`)». Он
проверял ответ человека, данный на стадии implement, хотя к fix-code тот
уже не относится. Ответ на эскалацию одной стадии становится рамкой для
судей всех следующих.

### Варианты исправления

- Разделять в промпте судьи цель задачи и decisions. Decisions — это
  указания исполнителю, а не рамка проверки. Либо не передавать их судье
  вовсе, либо предварять пометкой вроде «these are the human's
  instructions to the executor; they do not narrow your review».
- Исправить п. 12, чтобы человеку не приходилось пересказывать замечания
  судьи в ответе.

### Тест

Судья с decision «fix finding X only» и изменением, где X исправлен, а
критерий Y нарушен в другом файле: вердикт `Fail` с Y.

## 15. Судья в `-j` не видит git-ignored файлы гнома

Дата: 2026-09-30, задача #18, стадия deliver.

### Что произошло

- 23:58:17–23:58:57: гном открыл PR #21 и записал его тело в
  `pr-body.md` в корне (5 138 байт; файл в `.gitignore:59`, так задумано
  проектом).
- 23:58:58–23:59:00: все командные проверки прошли, в том числе проверка,
  что `pr-body.md` существует и совпадает с опубликованным телом PR. Эти
  проверки выполняются в box гнома.
- 23:59:01: фабрика создала **заново** окружение судьи
  `github-oinsio-time-zones-18-j` «for branch gnomish/…», то есть из
  коммитов ветки.
- 23:59:09: судья `Fail`: «`pr-body.md` does not exist in the repository
  root. I searched the whole tree and found no copy». Попытка сожжена.

### Причина

Окружение судьи — отдельный контейнер, собранный из ветки. Неотслеживаемые
и игнорируемые файлы рабочего дерева гнома в него не попадают. Командные
проверки при этом видят рабочее дерево гнома. Получается, что две части
одного verify смотрят на разное состояние, и нигде это не сказано: в
`operator-guide-sandbox` не описано, что именно попадает в `-j`.

В host-режиме судья, видимо, читает тот же worktree, так что стадия,
написанная и проверенная там, молча ломается при переходе в container.

### Вред

- Deliver в container-режиме не может пройти в принципе. Гном не может
  закоммитить `pr-body.md`: собственная проверка стадии запрещает любые
  изменения, кроме этого игнорируемого файла. Все попытки уйдут в `Fail`,
  а за ними последует эскалация.
- Судья тратит раунд, чтобы выяснить, что файла нет, а гном получает
  обратную связь, которую не может исполнить.

### Варианты исправления (фабрика)

- Материализовать окружение судьи из рабочего дерева гнома
  (снапшот `tar` или копия тома), а не из ветки. Либо переносить хотя бы
  неотслеживаемые файлы.
- Как минимум документировать, что судья видит только закоммиченное, и
  предупреждать при старте, если `acceptance.md` называет файл, который в
  ветке git-ignored.
- Добавить в промпт судьи содержимое выходов стадии (`outputs`), как
  данные в разделителях.

### Варианты обхода (проект)

- Держать тело PR в отслеживаемом файле (например, в `.gnomish-task/` или
  в каталоге архива) и разрешить его в проверке «no working-copy change».
- Либо перенести проверку тела PR из судьи в командную проверку: сравнение
  с опубликованным телом там уже есть.

### Тест

Стадия, чей executor пишет git-ignored файл `out.md`, а судья должен его
прочитать: в container-режиме судья видит `out.md`.

## 16. Подтверждение записи в трекер логируется как `event=RESUMED`

Дата: 2026-10-01 (события 2026-09-30 23:59), задача #18.

### Что произошло

```
23:59:38 task finished: outcome=Escalated
23:59:40 task lifecycle commit written for task …#18: event=ESCALATED
23:59:46 task lifecycle commit written for task …#18: event=RESUMED
23:59:48 task summary: outcome=awaitingHuman (ESCALATION), stage=deliver
```

Через 6 секунд после эскалации, без участия человека, в логе стоит
`event=RESUMED`. На ветке при этом коммит `gnomish: task
write-confirmed`. Выглядит так, будто задача сама возобновилась, и
оператор идёт разбираться.

### Причина

`GitTaskRepository.confirmTerminalWrite` (и его двойник
`TerminalWriteMarker`) коммитит с сообщением
`ServiceCommitMessages.trackerWriteConfirmed()`, но передаёт в
`commitWith` метку `TaskLifecycleEvent.RESUMED`. Javadoc объясняет, что
«That label records nothing … no reader parses it». Однако её читает
FR2-anchor строка лога, а по ней оператор и следит за задачей.

### Варианты исправления

- Завести отдельное значение `TaskLifecycleEvent.WRITE_CONFIRMED` (или
  `Optional` события) и логировать его.
- Либо в строке-якоре выводить сообщение коммита, а не событие.

## 17. Возобновлённая задача берёт `stage.yaml` со старта `serve`, а файлы правил — с текущего `main`

Дата: 2026-10-01, задача #18, стадия deliver.

### Что произошло

- `serve` запущен 2026-09-30 в 20:19. В `main` тогда был deliver с судьёй
  (`acceptance.md`).
- PR #22 (`46fd118`) убрал судью из `deliver/stage.yaml` и удалил
  `deliver/acceptance.md`.
- 00:12:20: возобновление #18 (ESCALATION, стадия deliver) сразу упало:

```
ERROR [GF112] executor threw for AttemptKey[…#18, stage=deliver, attempt=0]
UnreadableLawFileException: law file could not be read: stages/deliver/acceptance.md
  (no law file at '.gnomish/stages/deliver/acceptance.md' in 46fd118…)
  at PipelineLaw.controlFile
  at ExecutorPromptBuilder.describeJudge
```

- Задача ушла в `awaitingHuman (INFRA)`.

### Причина

- При возобновлении `TakeContainerEngineExecution` берёт
  `order.run().definition()`. Это `PipelineDefinition`, собранный один раз
  в `ServeCommand` при старте (`startupLaw.definition()`), и в нём ещё
  есть судья deliver.
- Файлы правил (`instructions`, `criteriaFile`) при этом читаются через
  `ResumeLawBinding` с **текущего** tip базы, то есть из `46fd118`, где
  `acceptance.md` уже нет.
- Свежий claim так не делает: `TakeFreshClaim` и
  `TakeContainerFreshClaim` перепривязывают определение через
  `order.withDefinition(bound.definition())`. У resume-путей такого шага
  нет.

Это расходится с документацией. `operator-guide-serve.md`, «Two
configuration tiers», говорит, что стадии, инструкции и критерии судьи
«binds per task from that task's own base, read from git objects at the
base's law commit». Для возобновлённой задачи это верно только
наполовину.

### Вред

- Удалить или переименовать файл правил нельзя, пока есть возобновляемые
  задачи: они падают с `GF112`.
- Тихий вариант хуже. Изменения `stage.yaml` (`maxTurns`, `attemptLimit`,
  список `verify`, `roundTimeout`) не доходят до возобновлённой задачи без
  перезапуска `serve`, а изменения `acceptance.md` и `instructions.md`
  доходят. На #18 так и было: PR #20 поднял `maxTurns` судьи implement
  до 80 и добавил в `acceptance.md` советы по экономии ходов. Судья после
  этого получил новые советы, но, судя по коду, прежние 30 ходов, потому
  что `serve` не перезапускался с 20:19.
- Оператор не может понять, какая версия правил действует: в логе нет
  строки с law-коммитом определения.

### Варианты исправления

- В resume-путях (`TakeContainerResumeRunner`, `TakeResumeRunner`)
  перепривязывать определение из `lawBinding` так же, как делает fresh
  claim: `order.withDefinition(bound.definition())`.
- Логировать при старте раунда law-коммит определения и файлов, чтобы
  расхождение было видно.
- До исправления документировать, что изменение `stage.yaml` требует
  перезапуска `serve` даже для возобновляемых задач.

### Тест

`serve` стартует с law A, где у стадии X есть судья. На базе появляется
law B без судьи и без его `criteriaFile`. Возобновление задачи на стадии
X идёт по B: судьи нет, `GF112` нет.
