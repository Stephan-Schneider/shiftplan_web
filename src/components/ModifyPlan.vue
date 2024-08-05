<script>
import {mapActions, mapState, mapWritableState} from "pinia";
import {useModifyStore} from "@/assets/stores/modify.js";

export default {
    name: "ModifyPlan",
    data() {
        return {
            lateShiftsOfA: [],
            lateShiftsOfB: []
        }
    },
    methods: {
        ...mapActions(useModifyStore, {
            loadStafflist: "loadStafflist",
            modifyPlan: "modifyPlan"
        }),
        getLateShiftsOfA(evt) {
            const staffId = evt.target.value;
            console.log(`Selected Staff-ID (A): ${staffId}`)
            // noinspection JSUnresolvedVariable
            this.lateShiftsOfA = this.idMap.get(staffId)?.cwIndices;
        },
        getLateShiftsOfB(evt) {
            const staffId = evt.target.value;
            console.log(`Selected Staff-ID (B): ${staffId}`)
            // noinspection JSUnresolvedVariable
            this.lateShiftsOfB = this.idMap.get(staffId)?.cwIndices;
        },
        async modifyShiftplan() {
            await this.modifyPlan();
            if (this.serverMsg && this.serverMsg !== "") {
                console.log("Spätschichtlisten werden aktualisiert")
                // Den nach dem Schichtwechsel veralteten Kalenderwochen-Index herausfiltern. Die neue
                // Kalenderwoche (nach Tausch) der Kalenderwochenliste hinzufügen. Anschließend die Liste
                // aufsteigend sortieren
                this.lateShiftsOfA = this.lateShiftsOfA.filter(cwIndex => cwIndex !== this.employeeACW);
                this.lateShiftsOfA.push(this.employeeBCW);
                this.lateShiftsOfA.sort((cwIndex1, cwIndex2) => cwIndex1 - cwIndex2);

                this.lateShiftsOfB = this.lateShiftsOfB.filter(cwIndex => cwIndex !== this.employeeBCW);
                this.lateShiftsOfB.push(this.employeeACW);
                this.lateShiftsOfB.sort((cwIndex1, cwIndex2) => cwIndex1 - cwIndex2);
            }
        }
    },
    computed: {
        ...mapState(useModifyStore, [
            "staffList",
            "idMap",
            "mode",
            "swapHo",
            "employeeA",
            "employeeACW",
            "employeeB",
            "employeeBCW",
            "error",
            "serverMsg"
        ]),
        ...mapWritableState(useModifyStore, [
            "mode",
            "swapHo",
            "employeeA",
            "employeeACW",
            "employeeB",
            "employeeBCW",
        ]),
    },
    async created() {
        await this.loadStafflist();
    }
}

</script>

<template>
    <div class="row mt-4">
        <section id="employeeA-section">
            <h2>Spätschichten Mitarbeiter/in A</h2>
            <div class="row">
                <div class="col-4">
                    <select
                        class="form-select form-select-sm"
                        v-model="employeeA"
                        v-on:change="getLateShiftsOfA"
                    >
                        <option value="">Mitarbeiter A auswählen</option>
                        <option
                            v-for="staff in staffList"
                            :key="staff.id"
                            :value="staff.id"
                        >{{ staff.displayName }}
                        </option>
                    </select>
                </div>
                <div class="col-4">
                    <select class="form-select form-select-sm" v-model="employeeACW">
                        <option value="">Spätschichten Mitarbeiter A</option>
                        <option
                            v-for="(lateShift, index) in lateShiftsOfA"
                            :key="index"
                            :value="lateShift"
                        >{{ lateShift }}
                        </option>
                    </select>
                </div>
            </div>
        </section>
    </div>
    <div class="row mt-4">
        <section id="employeeB-section">
            <h2>Spätschichten Mitarbeiter/in B</h2>
            <div class="row">
                <div class="col-4">
                    <select
                        class="form-select form-select-sm"
                        v-model="employeeB"
                        v-on:change="getLateShiftsOfB"
                    >
                        <option value="">Mitarbeiter B auswählen</option>
                        <option
                            v-for="staff in staffList"
                            :key="staff.id"
                            :value="staff.id"
                        >{{ staff.displayName }}
                        </option>
                    </select>
                </div>
                <div class="col-4">
                    <select class="form-select form-select-sm" v-model="employeeBCW">
                        <option value="">Spätschichten Mitarbeiter B</option>
                        <option
                            v-for="(lateshift, index) in lateShiftsOfB"
                            :key="index"
                            :value="lateshift"
                        >{{ lateshift }}
                        </option>
                    </select>
                </div>
            </div>
        </section>
    </div>
    <div class="row mt-4">
        <section>
            <div class="col-12">
                <div class="form-check form-check-inline">
                    <input
                        type="radio"
                        id="swap"
                        name="mode"
                        value="SWAP"
                        v-model="mode"
                        class="form-check-input">
                    <label for="swap" class="form-check-label">Spätschicht tauschen</label>
                </div>
                <div class="form-check form-check-inline">
                    <input
                        type="radio"
                        id="replace"
                        name="mode"
                        value="REPLACE"
                        v-model="mode"
                        class="form-check-input">
                    <label for="replace" class="form-check-label">Spätschicht ersetzen</label>
                </div>
                <div class="form-check form-check-inline">
                    <input
                        type="checkbox"
                        id="swap-ho"
                        value="swapHo"
                        v-model="swapHo"
                        class="form-check-input">
                    <label for="swap-ho" class="form-check-label">Homeoffice-Tage tauschen</label>
                </div>
            </div>
        </section>
    </div>
    <div class="row mt-4">
        <section>
            <div id="button-line" class="col-12">
                <button
                    type="button"
                    id="btn-send"
                    class="btn btn-sm btn-primary"
                    @click="modifyShiftplan"
                >Schichtplan ändern</button>
            </div>
            <div id="message-line" class="col-12">
                <p class="error" v-if="error">{{ error }}</p>
                <p class="feedback" v-if="serverMsg">{{ serverMsg }}</p>
            </div>
        </section>
    </div>
</template>

<style scoped>
    section {
        margin: 5px auto 5px auto;
        width: 70%;
        border: 1px solid black;
        padding: 10px;
    }
    h2 {
        font-size: 1.0em;
        font-weight: bold;
    }
    select {
        font-size: 0.9em;

        border: 1px solid black;
    }
    #button-line {
        text-align: center;
    }
    #message-line {
        text-align: center;
    }
    #message-line > p[class="error"] {
        color: darkred;
        font-weight: bold;
    }
    #message-line > p[class="feedback"] {
        color: black;
        font-weight: normal;
    }

</style>