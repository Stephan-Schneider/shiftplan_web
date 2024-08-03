<script>
import {mapActions, mapState, mapWritableState} from "pinia";
import {usePolicyStore} from "@/assets/stores/policy.js";

export default {
    name: "Policy",
    emits: ["updateConfig"],
    methods: {
        ...mapActions(usePolicyStore, {loadPolicyConfig: "loadPolicyConfig"}),
        updateConfig() {
            this.$emit("updateConfig", {
                section: "Policy",
                lateshiftPeriod: this.lateshiftPeriod,
                maxHoDaysPerMonth: this.maxHoPerMonth,
                weeklyHoCreditsPerEmployee: this.maxHoPerWeekEmployee,
                maxHoSlotsPerDay: this.maxHoSlots,
                maxSuccessiveHoDays: this.maxSuccessiveHoDays,
                minDistanceBetweenHoBlocks: this.minDistanceBetweenHoBlocks,
                noLateshiftOn: this.noLateshiftOn
            });
        }
    },
    computed: {
        ...mapState(usePolicyStore,
            ["lateshiftPeriod", "maxHoPerMonth", "maxHoPerWeekEmployee", "maxHoSlots", "maxSuccessiveHoDays",
                "minDistanceBetweenHoBlocks", "noLateshiftOn", "error"]),
        ...mapWritableState(usePolicyStore,
            ["lateshiftPeriod", "maxHoPerMonth", "maxHoPerWeekEmployee", "maxHoSlots", "maxSuccessiveHoDays",
                "minDistanceBetweenHoBlocks", "noLateshiftOn", "error"]
        )
    },
    created() {
        this.loadPolicyConfig();
    }
}
</script>

<template>
    <div class="row">
        <div class="col-8">
            <div class="row mt-2 border border-dark">
                <p class="header">Spätschicht</p>
                <div class="row">
                    <div class="col-6">
                        <label for="ls-period" class="col-form-label">Anzahl fortlaufender Spätschichttage:</label>
                    </div>
                    <div class="col-2">
                        <input
                            type="number"
                            id="ls-period"
                            class="form-control form-control-sm"
                            v-model="lateshiftPeriod"
                        >
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                        <label for="no-ls-on" class="col-form-label">Keine Spätschicht an folgenden Tagen:</label>
                    </div>
                    <div class="col-2">
                        <select
                            id="no-ls-on"
                            class="form-select form-select-sm"
                            size="1"
                            multiple
                            v-model="noLateshiftOn">
                            <option value="">Keine Auswahl</option>
                            <option value="MONDAY">Montag</option>
                            <option value="TUESDAY">Dienstag</option>
                            <option value="WEDNESDAY">Mittwoch</option>
                            <option value="THURSDAY">Donnerstag</option>
                            <option value="FRIDAY">Freitag</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row mt-2 border border-dark">
                <p class="header">Home-Office</p>
                <div class="row">
                    <div class="col-6">
                        <label for="max-ho-slots" class="col-form-label">Maximale Anzahl von MA's im Home-Office:</label>
                    </div>
                    <div class="col-2">
                        <input
                            type="number"
                            id="max-ho-slots"
                            class="form-control form-control-sm"
                            v-model="maxHoSlots"
                        >
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                        <label for="max-ho-per-month" class="col-form-label">Maximale Anzahl von HO-Tagen pro Monat / MA:</label>
                    </div>
                    <div class="col-2">
                        <input
                            type="number"
                            id="max-ho-per-month"
                            class="form-control form-control-sm"
                            v-model="maxHoPerMonth"
                        >
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                        <label for="max-ho-per-week--employee" class="col-form-label">Max. Anzahl HO-Tage pro MA / Woche:</label>
                    </div>
                    <div class="col-2">
                        <input
                            type="number"
                            id="max-ho-per-week--employee"
                            class="form-control form-control-sm"
                            v-model="maxHoPerWeekEmployee"
                        >
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                        <label for="max-successive-ho-days" class="col-form-label">Max. Anzahl aufeinanderfolgender HO-Tage:</label>
                    </div>
                    <div class="col-2">
                        <input
                            type="number"
                            id="max-successive-ho-days"
                            class="form-control form-control-sm"
                            v-model="maxSuccessiveHoDays"
                        >
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                        <label for="min-distance-between-ho-blocks" class="col-form-label">Mindestunterbrechung zwischen 2 HO-Blöcken:</label>
                    </div>
                    <div class="col-2">
                        <input
                            type="number"
                            id="min-distance-between-ho-blocks"
                            class="form-control form-control-sm"
                            v-model="minDistanceBetweenHoBlocks"
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-2">
        <div class="col-8">
            <div class="row">
                <p class="error" v-if="error">{{error.errorMessage}}</p>
            </div>
            <div class="row bg-light">
                <div class="col-12 btn-center">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-success"
                        @click="updateConfig"
                    >Änderungen bestätigen</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
p.header {
    font-weight: bold;
    font-variant-caps: all-small-caps;
    border-bottom: 1px solid black;
    margin-bottom: 3px;
    text-align: center;
}
div.btn-center {
    text-align: center;
}
.error {
    color: darkred;
    font-size: smaller;
    font-weight: bold;
}
</style>