<script>
import CreatePlan from "@/components/CreatePlan.vue";
import ShowPlan from "@/components/ShowPlan.vue";

const routes = {
    "/create_plan": CreatePlan,
    "/show_plan": ShowPlan
}

export default {
    name: "shiftplanApp",
    components: {ShowPlan, CreatePlan},

    data() {
        return {
            currentPath: window.location.hash
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
    <nav class="bg-light shadow-sm">
        <ul class="nav">
            <li class="nav-item">
                <a class="nav-link" href="#/create_plan">Schichtplan erstellen</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#">Schichtplan ändern</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#/show_plan">Schichtplan aufrufen</a>
            </li>
        </ul>
    </nav>
    <component :is="currentView" />
</template>

<style scoped>
h1 {
    text-align: center;
    font-size: x-large;
    font-variant-caps: all-small-caps;
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
