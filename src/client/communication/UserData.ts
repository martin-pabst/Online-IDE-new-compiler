import { SecureJSON } from "../../tools/SecureJSON";
import type { NonFunctionProperties } from "../../tools/TypeConversions";
import type { SettingValues } from "../settings/SettingsMetadata";
import type { GuiState, UserData } from "./Data";

export class User {

    userdata: UserData;

    constructor(userdata: UserData) {
        this.userdata = userdata;
    }

    toJSON(): any {
        return Object.assign({}, this.userdata, {
            gui_state: SecureJSON.stringify(this.userdata.gui_state),
            settings: SecureJSON.stringify(this.userdata.settings)
        });
    }

};
