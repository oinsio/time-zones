# Glossary: Tools

Small utilities beside the world clock, each opened from its own header button once the user turns it on. Decisions: ADR-0020 (tools and the tool registry; handoff H1 of add-unix-time-converter-tool). See [README](README.md) for the entry format.

- **Tool** — a self-contained utility of the app that has its own page, such as the Unix time converter. *RU:* «Инструмент». *Code:* `ToolId`, `ToolDefinition`.
- **Tool registry** — the list of registered tools, in display order; the settings list them and the header shows a button for each enabled one. *Code:* `toolRegistry`, `resolveEnabledTools`.
- **Tools group** — the settings group with one icon-only toggle per registered tool; every tool is off at first. *RU:* «Инструменты». *Code:* `ToolsGroup`.
- **Enabled tools** — the tools the user turned on, kept in the preferences; an id that is not registered is kept and ignored. *Code:* `Preferences.enabledTools`, `TOGGLE_TOOL`, `useEnabledTools`.
- **Tool button** — the header button that opens the page of an enabled tool; its name is the tool's name. *Code:* `ToolButton`, `ToolButtons`, `HeaderIconButton`.
- **Tool page** — the third kind of page of the shell, beside the main page and the settings page: a focusable heading, a back button and the tool's content, loaded on demand. *Code:* `AppPage.TOOL`, `ToolPageFrame`, `ToolHost`, `useAppPage`.
- **Tool session** — the state of a tool page kept while the user moves between the tool page and the main page, until the tool is turned off or the app reloads. *Code:* `useToolSessions`, the `session` of a tool page.
