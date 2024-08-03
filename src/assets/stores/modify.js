import {defineStore} from "pinia";
import {getStafflist, putData} from "@/assets/js/requests.js";

export const useModifyStore = defineStore("modify", {
    state: () => {
        return {
            staffList: [],
            idMap: new Map(),
            employeeA: "",
            employeeACW: 0,
            employeeB: "",
            employeeBCW: 0,
            mode: "SWAP",
            swapHo: true,
            error: "",
            serverMsg: ""
        }
    },
    actions: {
        async loadStafflist() {
            const result = await getStafflist("/stafflist");
            if (result.errorMessage) {
                this.error = result.errorMessage;
            } else {
                this.staffList = result ?? [];
                // noinspection JSUnresolvedVariable
                if (Array.isArray(this.staffList) && this.staffList.length > 0) {
                    // noinspection JSUnresolvedVariable
                    this.staffList.forEach(staff => this.idMap.set(staff.id, staff));
                }
            }
        },
        async modifyPlan() {
            // noinspection JSUnresolvedVariable
            if (!this.employeeA || !this.employeeACW || !this.employeeB || !this.employeeBCW) {
                console.log("Fehlende Parameter - Anfrage zur Schichtplanänderung nicht gesendet!");
                return;
            }
            // noinspection JSUnresolvedVariable
            let path = `/modify/${this.mode}/${this.swapHo}/${this.employeeA}/${this.employeeACW}/${this.employeeB}`;
            if (this.mode === "SWAP") {
                // noinspection JSUnresolvedVariable
                path += `/${this.employeeBCW}`;
            }
            const result = await putData(path);
            if (result.errorMessage) {
                this.error = result.errorMessage;
            } else {
                this.serverMsg = result ?? "";
                // noinspection JSUnresolvedVariable
                console.log(`Server-Message: ${this.serverMsg}`)
            }

            setTimeout(() => {
                this.serverMsg = "";
                this.error = "";
            }, 10000);
        }
    }
})