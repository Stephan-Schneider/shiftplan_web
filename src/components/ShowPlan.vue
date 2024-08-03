<script>
import {putData} from "@/assets/js/requests.js";

export default {
    name: "ShowPlan",
    data() {
        return {
            showLink: false,
            link: "",
            format: "html",
            error: ""
        }
    },
    methods: {
        async activateShiftplan() {
            let result = await putData("/publish/" + this.format);
            result = result ?? {};
            if (result.errorMessage) {
                this.error = result.errorMessage;
            } else if (result.link) {
                this.link = result.link;
                console.log(`Vom Webserver zurückgelieferte URL: ${this.link}`)
                this.showLink = true;
            } else {
                this.error = "Keine Daten vom Server erhalten";
            }
        },
        openShiftplan() {
            window.open(this.link, "_blank");
            this.showLink = false;
        }
    }
}
</script>

<template>
    <div class="row mt-4">
        <div class="col-2">
            <button
                type="button"
                class="btn btn-primary btn-sm ml-2"
                @click="activateShiftplan"
            >Schichtplan aktivieren</button>
        </div>
        <div class="col-1 form-check form-check-inline">
            <input
                type="radio"
                name="format"
                id="format-html"
                class="form-check-input"
                value="html"
                v-model="format" />
            <label for="format-html" class="form-check-label">HTML</label>
        </div>
        <div class="col-1 form-check form-check-inline">
            <input
                type="radio"
                name="format"
                id="format-pdf"
                class="form-check-input"
                value="pdf"
                v-model="format" />
            <label for="format-pdf" class="form-check-label">PDF</label>
        </div>
    </div>
    <div class="row mt-4">
        <a href="#" v-if="showLink" @click.prevent="openShiftplan">Schichtplan</a>
    </div>
    <div class="row mt-4">
        <p class="feedback" v-if="error">{{error}}</p>
    </div>
</template>

<style scoped>
a {
    color: darkblue;
    text-decoration: none;
    font-weight: bolder;
}

a:hover {
    text-decoration: underline;
}

p.feedback {
    font-size: 0.9em;
    color: darkred;
}
</style>