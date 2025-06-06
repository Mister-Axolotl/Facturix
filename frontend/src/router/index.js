import { createRouter, createWebHistory } from 'vue-router'
import AccueilView from '../views/AccueilView.vue'
import FacturesView from '../views/FacturesView.vue'
import FactureCreateView from '../views/FactureCreateView.vue'
import FactureEditView from '../views/FactureEditView.vue'
import FactureDetailView from '../views/FactureDetailView.vue'
import UsersView from '../views/UsersView.vue'
import UserCreateView from '../views/UserCreateView.vue'
import UserEditView from '../views/UserEditView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'accueil',
            component: AccueilView,
        },
        {
            path: '/factures',
            name: 'factures',
            component: FacturesView,
        },
        // Routes spécifiques AVANT les routes avec paramètres
        {
            path: '/factures/create',
            name: 'facture-create',
            component: FactureCreateView,
        },
        {
            path: '/factures/edit/:id',
            name: 'facture-edit',
            component: FactureEditView,
        },
        // Route avec paramètre APRÈS les routes spécifiques
        {
            path: '/factures/:id',
            name: 'facture-detail',
            component: FactureDetailView,
        },
        {
            path: '/users',
            name: 'users',
            component: UsersView,
        },
        {
            path: '/users/create',
            name: 'user-create',
            component: UserCreateView,
        },
        {
            path: '/users/edit/:id',
            name: 'user-edit',
            component: UserEditView,
        },
    ],
})

export default router
