var _a;
import { isArray } from "../../core/util/types";
import { sort_by, includes, intersection } from "../../core/util/array";
import { values, entries } from "../../core/util/object";
import { Tool } from "./tool";
import { GestureTool } from "./gestures/gesture_tool";
import { InspectTool } from "./inspectors/inspect_tool";
import { ToolbarBase, ToolbarBaseView } from "./toolbar_base";
export const Drag = Tool;
export const Inspection = Tool;
export const Scroll = Tool;
export const Tap = Tool;
function _get_active_attr(et) {
    switch (et) {
        case "tap": return "active_tap";
        case "pan": return "active_drag";
        case "pinch":
        case "scroll": return "active_scroll";
        case "multi": return "active_multi";
    }
    return null;
}
function _supports_auto(et) {
    return et == "tap" || et == "pan";
}
export class Toolbar extends ToolbarBase {
    constructor(attrs) {
        super(attrs);
    }
    connect_signals() {
        super.connect_signals();
        const { tools, active_drag, active_inspect, active_scroll, active_tap, active_multi } = this.properties;
        this.on_change([tools, active_drag, active_inspect, active_scroll, active_tap, active_multi], () => this._init_tools());
    }
    _init_tools() {
        super._init_tools();
        if (this.active_inspect == "auto") {
            // do nothing as all tools are active be default
        }
        else if (this.active_inspect instanceof InspectTool) {
            let found = false;
            for (const inspector of this.inspectors) {
                if (inspector != this.active_inspect)
                    inspector.active = false;
                else
                    found = true;
            }
            if (!found) {
                this.active_inspect = null;
            }
        }
        else if (isArray(this.active_inspect)) {
            const active_inspect = intersection(this.active_inspect, this.inspectors);
            if (active_inspect.length != this.active_inspect.length) {
                this.active_inspect = active_inspect;
            }
            for (const inspector of this.inspectors) {
                if (!includes(this.active_inspect, inspector))
                    inspector.active = false;
            }
        }
        else if (this.active_inspect == null) {
            for (const inspector of this.inspectors)
                inspector.active = false;
        }
        const _activate_gesture = (tool) => {
            if (tool.active) {
                // tool was activated by a proxy, but we need to finish configuration manually
                this._active_change(tool);
            }
            else
                tool.active = true;
        };
        // Connecting signals has to be done before changing the active state of the tools.
        for (const gesture of values(this.gestures)) {
            gesture.tools = sort_by(gesture.tools, (tool) => tool.default_order);
            for (const tool of gesture.tools) {
                this.connect(tool.properties.active.change, () => this._active_change(tool));
            }
        }
        for (const [et, gesture] of entries(this.gestures)) {
            const active_attr = _get_active_attr(et);
            if (active_attr) {
                const active_tool = this[active_attr];
                if (active_tool == "auto") {
                    if (gesture.tools.length != 0 && _supports_auto(et)) {
                        _activate_gesture(gesture.tools[0]);
                    }
                }
                else if (active_tool != null) {
                    if (includes(this.tools, active_tool)) {
                        _activate_gesture(active_tool);
                    }
                    else {
                        this[active_attr] = null;
                    }
                }
            }
        }
    }
}
_a = Toolbar;
Toolbar.__name__ = "Toolbar";
(() => {
    _a.prototype.default_view = ToolbarBaseView;
    _a.define(({ Or, Ref, Auto, Null }) => ({
        active_drag: [Or(Ref(Drag), Auto, Null), "auto"],
        active_inspect: [Or(Ref(Inspection), Auto, Null), "auto"],
        active_scroll: [Or(Ref(Scroll), Auto, Null), "auto"],
        active_tap: [Or(Ref(Tap), Auto, Null), "auto"],
        active_multi: [Or(Ref(GestureTool), Auto, Null), "auto"],
    }));
})();
//# sourceMappingURL=toolbar.js.map