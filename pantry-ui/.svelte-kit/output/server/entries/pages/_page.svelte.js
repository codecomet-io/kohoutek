import { c as create_ssr_component, d as add_attribute, e as escape, f as null_to_empty, v as validate_component, h as each } from "../../chunks/index2.js";
import { checkmarkCircle, alertCircle } from "ionicons/icons";
function parseColor(success2, subtle) {
  return subtle ? "medium" : success2 ? "success" : "danger";
}
const SuccessFailIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let color;
  let { success: success2 } = $$props;
  let { subtle = void 0 } = $$props;
  let { size = void 0 } = $$props;
  if ($$props.success === void 0 && $$bindings.success && success2 !== void 0)
    $$bindings.success(success2);
  if ($$props.subtle === void 0 && $$bindings.subtle && subtle !== void 0)
    $$bindings.subtle(subtle);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0)
    $$bindings.size(size);
  color = parseColor(success2, subtle);
  return `<ion-icon${add_attribute("icon", success2 ? checkmarkCircle : alertCircle, 0)}${add_attribute("color", color, 0)}${add_attribute("size", size, 0)}></ion-icon>`;
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
const PipelineHeader_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "ion-header.svelte-q2rxm6 ion-toolbar.svelte-q2rxm6{padding:var(--ion-padding, 16px)}.title-container.svelte-q2rxm6.svelte-q2rxm6{display:flex;align-items:center}h1.svelte-q2rxm6.svelte-q2rxm6{margin-top:0;margin-bottom:0;margin-left:0.25em}.subtitle.svelte-q2rxm6.svelte-q2rxm6{margin-top:7px;margin-bottom:0}",
  map: null
};
const PipelineHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { pipeline } = $$props;
  if ($$props.pipeline === void 0 && $$bindings.pipeline && pipeline !== void 0)
    $$bindings.pipeline(pipeline);
  $$result.css.add(css$1);
  return `<ion-header${add_attribute("translucent", true, 0)} class="${"svelte-q2rxm6"}"><ion-toolbar class="${" svelte-q2rxm6"}"><div class="${"title-container svelte-q2rxm6"}">${validate_component(SuccessFailIcon, "SuccessFailIcon").$$render(
    $$result,
    {
      success: pipeline.success,
      subtle: pipeline.status === "canceled",
      size: "large"
    },
    {},
    {}
  )}

			<h1 class="${"svelte-q2rxm6"}">${escape(pipeline.title)}</h1></div>

		<div class="${"subtitle svelte-q2rxm6"}">${validate_component(ChunkyLabel, "ChunkyLabel").$$render($$result, {}, {}, {
    default: () => {
      return `${escape(pipeline.success ? "succeed" : "fail")}ed 5 days ago in ${escape(pipeline.elapsedSeconds)} seconds`;
    }
  })}</div></ion-toolbar></ion-header>`;
});
const ActionsListItem_svelte_svelte_type_style_lang = "";
const css = {
  code: "[slot=header].svelte-z1a0a ion-label.svelte-z1a0a{margin-left:0.25em}",
  map: null
};
const ActionsListItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { action } = $$props;
  if ($$props.action === void 0 && $$bindings.action && action !== void 0)
    $$bindings.action(action);
  $$result.css.add(css);
  return `<ion-accordion${add_attribute("value", action.id, 0)} toggle-icon-slot="${"start"}"><ion-item slot="${"header"}" color="${"light"}" class="${"svelte-z1a0a"}">${validate_component(SuccessFailIcon, "SuccessFailIcon").$$render(
    $$result,
    {
      success: action.success,
      subtle: action.status === "canceled"
    },
    {},
    {}
  )}

		<ion-label class="${"svelte-z1a0a"}">${escape(action.title)}</ion-label>

		${validate_component(ChunkyLabel, "ChunkyLabel").$$render($$result, { allcaps: false, slot: "end" }, {}, {
    default: () => {
      return `${escape(action.elapsedSeconds)}s
		`;
    }
  })}</ion-item>

	<article class="${"ion-padding"}" slot="${"content"}">${action.status ? `<div>${escape(action.status)}</div>` : ``}

		${action.spawnedBy ? `<div>invoked by ${escape(action.spawnedBy)}</div>` : ``}

		<div>started at ${escape(action.startedAt)}</div>
		<div>ended at ${escape(action.endedAt)}</div></article></ion-accordion>`;
});
const ActionsList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { actions: actions2 } = $$props;
  if ($$props.actions === void 0 && $$bindings.actions && actions2 !== void 0)
    $$bindings.actions(actions2);
  return `<ion-accordion-group>${each(actions2, (action) => {
    return `${validate_component(ActionsListItem, "ActionsListItem").$$render($$result, { action }, {}, {})}`;
  })}</ion-accordion-group>`;
});
const id = "n540Mrgydc";
const title = "Pantry Build & Deploy";
const startedAt = "2023-03-02T00:53:11.606Z";
const endedAt = "2023-03-02T01:23:10.302Z";
const elapsedSeconds = 523;
const success = false;
const status = "error";
const actions = [
  {
    id: "ZG5wtVoiAo",
    title: "Build",
    startedAt: "2023-03-02T00:53:11.606Z",
    endedAt: "2023-03-02T01:23:10.302Z",
    elapsedSeconds: 33,
    success: true
  },
  {
    id: "wbgRQlCurX",
    title: "Build Child 1",
    startedAt: "2023-03-02T00:53:11.606Z",
    endedAt: "2023-03-02T01:23:10.302Z",
    elapsedSeconds: 44,
    success: true,
    spawnedBy: "ZG5wtVoiAo"
  },
  {
    id: "G875vPPoIU",
    title: "Build Child 2",
    startedAt: "2023-03-02T00:53:11.606Z",
    endedAt: "2023-03-02T01:23:10.302Z",
    elapsedSeconds: 13,
    success: false,
    status: "error",
    spawnedBy: "ZG5wtVoiAo"
  },
  {
    id: "K4VgTz0DHF",
    title: "Deploy",
    startedAt: "2023-03-02T00:53:11.606Z",
    endedAt: "2023-03-02T01:23:10.302Z",
    elapsedSeconds: 11,
    success: false,
    status: "canceled",
    spawnedBy: "wbgRQlCurX"
  }
];
const results = {
  id,
  title,
  startedAt,
  endedAt,
  elapsedSeconds,
  success,
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
