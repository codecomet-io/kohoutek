import { c as create_ssr_component, d as add_attribute, e as escape, f as null_to_empty, v as validate_component, h as createEventDispatcher, i as each } from "../../chunks/index2.js";
import { checkmarkCircle, alertCircle } from "ionicons/icons";
function parseDate(date) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toString() === "Invalid Date" ? "" : dateObj.toString();
}
function parseTime(date) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toString() === "Invalid Date" ? "" : dateObj.toLocaleTimeString();
}
function parseLapsed(ms) {
  let ago = Math.floor(ms / 1e3);
  let part = 0;
  if (ago < 2) {
    return "a moment";
  }
  if (ago < 5) {
    return "moments";
  }
  if (ago < 60) {
    return ago + " seconds";
  }
  if (ago < 120) {
    return "a minute";
  }
  if (ago < 3600) {
    while (ago >= 60) {
      ago -= 60;
      part += 1;
    }
    return part + " minutes";
  }
  if (ago < 7200) {
    return "an hour";
  }
  if (ago < 86400) {
    while (ago >= 3600) {
      ago -= 3600;
      part += 1;
    }
    return part + " hours";
  }
  if (ago < 172800) {
    return "a day";
  }
  if (ago < 604800) {
    while (ago >= 172800) {
      ago -= 172800;
      part += 1;
    }
    return part + " days";
  }
  if (ago < 1209600) {
    return "a week";
  }
  if (ago < 2592e3) {
    while (ago >= 604800) {
      ago -= 604800;
      part += 1;
    }
    return part + " weeks";
  }
  if (ago < 5184e3) {
    return "a month";
  }
  if (ago < 31536e3) {
    while (ago >= 2592e3) {
      ago -= 2592e3;
      part += 1;
    }
    return part + " months";
  }
  if (ago < 141912e4) {
    return "more than year";
  }
  return "";
}
const StatusIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let color;
  let { status: status2 } = $$props;
  let { size = void 0 } = $$props;
  const statusColorMap = {
    success: "success",
    error: "danger",
    canceled: "medium"
  };
  if ($$props.status === void 0 && $$bindings.status && status2 !== void 0)
    $$bindings.status(status2);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  color = statusColorMap[status2];
  return `<ion-icon${add_attribute("icon", status2 === "success" ? checkmarkCircle : alertCircle, 0)}${add_attribute("color", color, 0)}${add_attribute("size", size, 0)}></ion-icon>`;
});
const ChunkyLabel_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: "ion-card-subtitle.svelte-1jw4ykv{margin-bottom:0}ion-card-subtitle.mixed-case.svelte-1jw4ykv{text-transform:none}",
  map: null
};
const ChunkyLabel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { allcaps = true } = $$props;
  if ($$props.allcaps === void 0 && $$bindings.allcaps && allcaps !== void 0)
    $$bindings.allcaps(allcaps);
  $$result.css.add(css$2);
  return `<ion-card-subtitle class="${escape(null_to_empty(allcaps ? "" : "mixed-case"), true) + " svelte-1jw4ykv"}">${slots.default ? slots.default({}) : ``}</ion-card-subtitle>`;
});
const Ago = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { date } = $$props;
  let dateObj;
  let lapsed;
  if ($$props.date === void 0 && $$bindings.date && date !== void 0)
    $$bindings.date(date);
  {
    {
      dateObj = typeof date === "string" ? new Date(date) : date;
      lapsed = parseLapsed(Date.now() - dateObj.getTime());
    }
  }
  return `<span${add_attribute("title", parseDate(dateObj), 0)}>${escape(!lapsed ? "never" : lapsed + " ago")}</span>`;
});
const PipelineHeader_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: 'ion-header.svelte-1m4f76r ion-toolbar.svelte-1m4f76r{padding:var(--ion-padding, 16px)}.title-container.svelte-1m4f76r.svelte-1m4f76r{display:flex;align-items:center}h1.svelte-1m4f76r.svelte-1m4f76r{margin-top:0;margin-bottom:0;margin-left:0.25em}.subtitle.svelte-1m4f76r.svelte-1m4f76r{margin-top:7px;margin-bottom:0}.corp-site-link.svelte-1m4f76r.svelte-1m4f76r{display:flex;height:2rem;align-items:center;color:#1c1e21;text-decoration:none;font-family:system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"}.corp-site-link.svelte-1m4f76r.svelte-1m4f76r:hover{color:#5468ff}.corp-site-link.svelte-1m4f76r:hover img.svelte-1m4f76r{transform:translateX(-2px) translateY(2px) scale(110%)}.corp-site-link.svelte-1m4f76r img.svelte-1m4f76r{height:100%;margin-right:0.25rem;transition:transform 125ms ease-in-out}',
  map: null
};
const PipelineHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pipeline } = $$props;
  if ($$props.pipeline === void 0 && $$bindings.pipeline && pipeline !== void 0)
    $$bindings.pipeline(pipeline);
  $$result.css.add(css$1);
  return `<ion-header${add_attribute("translucent", true, 0)} class="${"svelte-1m4f76r"}"><ion-toolbar class="${"svelte-1m4f76r"}"><div class="${"title-container svelte-1m4f76r"}">${validate_component(StatusIcon, "StatusIcon").$$render($$result, { status: pipeline.status, size: "large" }, {}, {})}

			<h1 class="${"svelte-1m4f76r"}">${escape(pipeline.title)}</h1></div>

		<div class="${"subtitle svelte-1m4f76r"}">${validate_component(ChunkyLabel, "ChunkyLabel").$$render($$result, {}, {}, {
    default: () => {
      return `${escape(pipeline.status === "success" ? "succeed" : "fail")}ed ${validate_component(Ago, "Ago").$$render($$result, { date: pipeline.endedAt }, {}, {})} <span title="${escape(pipeline.elapsedSeconds, true) + " seconds"}">in ${escape(parseLapsed(pipeline.elapsedSeconds * 1e3))}</span>`;
    }
  })}</div>

		<a slot="${"end"}" class="${"corp-site-link svelte-1m4f76r"}" href="${"https://codecomet.io/"}" itemtype="${"http://schema.org/Corporation"}" itemscope><img src="${"/CodeComet-logo.svg"}" alt="${"CodeComet logo showing an illustrated comet entering the atmosphere"}" itemprop="${"image"}" class="${"svelte-1m4f76r"}">

			<strong itemprop="${"name"}">CodeComet</strong></a></ion-toolbar></ion-header>`;
});
const ActionsListItem_svelte_svelte_type_style_lang = "";
const css = {
  code: "[slot=header].svelte-seheoj ion-label.svelte-seheoj{margin-left:0.25em}article.svelte-seheoj.svelte-seheoj{display:flex;flex-wrap:wrap;gap:1em}.column-container.svelte-seheoj.svelte-seheoj{flex:1;min-width:100px}.column-container.svelte-seheoj .key.svelte-seheoj,.column-container.svelte-seheoj .value.svelte-seheoj{white-space:nowrap}.column-container.svelte-seheoj .key.svelte-seheoj{margin-bottom:4px;color:#57606a;font-size:12px}.column-container.svelte-seheoj .value.svelte-seheoj{color:#24292f;font-size:16px;font-weight:600}",
  map: null
};
const ActionsListItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { action } = $$props;
  let { highlight } = $$props;
  createEventDispatcher();
  if ($$props.action === void 0 && $$bindings.action && action !== void 0)
    $$bindings.action(action);
  if ($$props.highlight === void 0 && $$bindings.highlight && highlight !== void 0)
    $$bindings.highlight(highlight);
  $$result.css.add(css);
  return `<ion-accordion${add_attribute("value", action.id, 0)} toggle-icon-slot="${"start"}"><ion-item slot="${"header"}" color="${"light"}" class="${["svelte-seheoj", highlight ? "ion-focused" : ""].join(" ").trim()}">${validate_component(StatusIcon, "StatusIcon").$$render($$result, { status: action.status }, {}, {})}

		<ion-label class="${"svelte-seheoj"}">${escape(action.title)}</ion-label>

		${validate_component(ChunkyLabel, "ChunkyLabel").$$render($$result, { allcaps: false, slot: "end" }, {}, {
    default: () => {
      return `${escape(action.elapsedSeconds)}s
		`;
    }
  })}</ion-item>

	<article class="${"ion-padding svelte-seheoj"}" slot="${"content"}"><div class="${"column-container svelte-seheoj"}"><header class="${"key svelte-seheoj"}">started at</header>

			<div class="${"value svelte-seheoj"}"${add_attribute("title", parseDate(action.startedAt), 0)}>${escape(parseTime(action.startedAt))}</div></div>

		<div class="${"column-container svelte-seheoj"}"><header class="${"key svelte-seheoj"}">ended at</header>

			<div class="${"value svelte-seheoj"}"${add_attribute("title", parseDate(action.endedAt), 0)}>${escape(parseTime(action.endedAt))}</div></div>

		<div class="${"column-container svelte-seheoj"}"><header class="${"key svelte-seheoj"}">status</header>

			<div class="${"value svelte-seheoj"}">${escape(action.status)}</div></div>

		<div class="${"column-container svelte-seheoj"}">${action.spawnedBy && action.spawnedByTitle ? `<header class="${"key svelte-seheoj"}">invoked by</header>

				<a class="${"value svelte-seheoj"}" href="${"#" + escape(action.spawnedBy, true)}">${escape(action.spawnedByTitle)}</a>` : ``}</div></article></ion-accordion>`;
});
const ActionsList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { actions: actions2 } = $$props;
  let highlightActive;
  if ($$props.actions === void 0 && $$bindings.actions && actions2 !== void 0)
    $$bindings.actions(actions2);
  return `<ion-accordion-group expand="${"inset"}">${each(actions2, (action) => {
    return `${validate_component(ActionsListItem, "ActionsListItem").$$render(
      $$result,
      {
        action,
        highlight: highlightActive
      },
      {},
      {}
    )}`;
  })}</ion-accordion-group>`;
});
const id = "n540Mrgydc";
const title = "Pantry Build & Deploy";
const startedAt = "2023-03-02T00:53:11.606Z";
const endedAt = "2023-03-02T01:23:10.302Z";
const elapsedSeconds = 523;
const status = "error";
const actions = [
  {
    id: "ZG5wtVoiAo",
    title: "Build",
    type: "custom",
    startedAt: "2023-03-02T00:53:11.606Z",
    endedAt: "2023-03-02T01:23:10.302Z",
    elapsedSeconds: 33,
    status: "completed"
  },
  {
    id: "wbgRQlCurX",
    title: "Build Child 1",
    type: "custom",
    startedAt: "2023-03-02T00:53:11.606Z",
    endedAt: "2023-03-02T01:23:10.302Z",
    elapsedSeconds: 44,
    status: "completed",
    spawnedBy: {
      id: "ZG5wtVoiAo",
      title: "Build"
    }
  },
  {
    id: "G875vPPoIU",
    title: "Build Child 2",
    type: "custom",
    startedAt: "2023-03-02T00:53:11.606Z",
    endedAt: "2023-03-02T01:23:10.302Z",
    elapsedSeconds: 13,
    status: "error",
    spawnedBy: {
      id: "ZG5wtVoiAo",
      title: "Build"
    }
  },
  {
    id: "K4VgTz0DHF",
    title: "Deploy",
    type: "custom",
    startedAt: "2023-03-02T00:53:11.606Z",
    endedAt: "2023-03-02T01:23:10.302Z",
    elapsedSeconds: 11,
    status: "canceled",
    spawnedBy: {
      id: "wbgRQlCurX",
      title: "Build Child 1"
    }
  }
];
const results = {
  id,
  title,
  startedAt,
  endedAt,
  elapsedSeconds,
  status,
  actions
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const typedResults = results;
  return `${validate_component(PipelineHeader, "PipelineHeader").$$render($$result, { pipeline: typedResults }, {}, {})}

<ion-content${add_attribute("fullscreen", true, 0)}>${validate_component(ActionsList, "ActionsList").$$render($$result, { actions: typedResults.actions }, {}, {})}</ion-content>`;
});
export {
  Page as default
};
