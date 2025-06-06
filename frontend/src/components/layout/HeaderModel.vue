<template>
    <header>
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <RouterLink to="/" class="navbar-brand">Facturix</RouterLink>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <RouterLink to="/" active-class="active" class="nav-link">Accueil</RouterLink>
                        </li>
                        <li class="nav-item">
                            <RouterLink to="/factures" :class="['nav-link', { active: isFacturesSection }]">
                                Factures
                            </RouterLink>
                        </li>
                        <li class="nav-item">
                            <RouterLink to="/users" :class="['nav-link', { active: isUsersSection }]">
                                Clients
                            </RouterLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Computed pour déterminer si on est dans la section factures
const isFacturesSection = computed(() => {
    return route.path.startsWith('/factures')
})

// Computed pour déterminer si on est dans la section users/clients
const isUsersSection = computed(() => {
    return route.path.startsWith('/users')
})
</script>

<style>
.active {
    color: var(--bs-primary) !important;
}
</style>
