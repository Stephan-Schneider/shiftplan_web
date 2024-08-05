<script>
import {authenticate} from "@/assets/js/requests.js";
import CreatePlan from "@/components/CreatePlan.vue";
import ShowPlan from "@/components/ShowPlan.vue";
import ModifyPlan from "@/components/ModifyPlan.vue";

const routes = {
    "/create_plan": CreatePlan,
    "/modify_plan": ModifyPlan,
    "/show_plan": ShowPlan
}

export default {
    name: "shiftplanApp",
    components: {ShowPlan, ModifyPlan, CreatePlan},

    data() {
        return {
            currentPath: window.location.hash,
            username: "",
            password: "",
            showApp: false,
            failedLoginMsg: ""
        }
    },
    methods: {
        async login() {
            this.failedLoginMsg = "";
            const auth = {username: this.username, password: this.password};
            this.showApp = await authenticate("/authenticate", auth);
            this.username = "";
            this.password = "";
            if (this.showApp === false) {
                this.failedLoginMsg = "Falscher Benutzername oder Passwort";
            }
        },
        logout() {
            this.showApp = false;
        }
    },
    computed: {
        currentView() {
            return routes[this.currentPath.slice(1) || "/"]
        }
    },
    mounted() {
        window.addEventListener("hashchange", () => {
            this.currentPath = window.location.hash
        })
    }
}
</script>

<template>
    <h1 class="my-3">Schichtplan - App</h1>
    <div v-if="showApp" id="sign-out-line" class="row">
        <a
            href="#"
            @click.prevent="logout"
        >Sign out</a>
    </div>
    <section v-if="showApp === true" >
        <nav class="bg-light shadow-sm">
            <ul class="nav">
                <li class="nav-item">
                    <a class="nav-link" href="#/create_plan">Schichtplan erstellen</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#/modify_plan">Schichtplan ändern</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#/show_plan">Schichtplan aufrufen</a>
                </li>
            </ul>
        </nav>
        <component :is="currentView" />
    </section>
    <section id="login-section" v-if="showApp === false">
        <div class="row">
            <div class="col-6 mb-3">
                <label for="username" class="form-label">Benutzer-Name</label>
                <input
                    type="text"
                    id="username"
                    class="form-control form-control-sm"
                    v-model="username"
                >
            </div>
            <div class="col-6 mb-3">
                <label for="passwd" class="form-label">Passwort</label>
                <input
                    type="password"
                    id="passwd"
                    class="form-control form-control-sm"
                    autocomplete="off"
                    v-model="password"
                >
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <button
                    type="button"
                    id="login"
                    class="btn btn-sm btn-primary"
                    @click="login"
                >Bei Schichtplan-App anmelden</button>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <p>{{ failedLoginMsg }}</p>
            </div>
        </div>
    </section>


</template>

<style scoped>
h1 {
    text-align: center;
    font-size: x-large;
    font-variant-caps: all-small-caps;
    margin-bottom: 0;
}
#sign-out-line {
    text-align: end;
    margin-top: 0;
}
#sign-out-line > a {
    font-size: small;
    color: #0a58ca;

}
#login-section {
    width: 500px;
    margin: 15px auto 5px auto;
    text-align: center;
}
a {
    color: black;
    text-decoration: None;
}
a:hover {
    color: #2c3e50;
    text-decoration: underline;
}
a:visited {
    color: black;
    text-decoration: None;
}
</style>
