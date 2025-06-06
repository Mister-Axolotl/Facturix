<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="h1">Clients</h1>
                    <button class="btn btn-primary" @click="handleCreateUser">
                        <i class="fas fa-user-plus"></i> Nouveau client
                    </button>
                </div>

                <!-- Loading state -->
                <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                </div>

                <!-- Error state -->
                <div v-else-if="error" class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                    <button class="btn btn-sm btn-outline-danger ms-2" @click="handleRefresh">
                        Réessayer
                    </button>
                </div>

                <!-- Empty state -->
                <div v-else-if="users.length === 0" class="text-center py-5">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Aucun utilisateur trouvé</p>
                    <button class="btn btn-primary" @click="handleCreateUser">
                        Créer votre premier utilisateur
                    </button>
                </div>

                <!-- Users list -->
                <div v-else class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    Liste des clients ({{ totalUsers }})
                                </h5>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0">
                                        <thead class="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Nom complet</th>
                                                <th>Email</th>
                                                <th>Téléphone</th>
                                                <th>Date création</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="user in users" :key="user.id">
                                                <td>
                                                    <span class="badge bg-secondary">#{{ user.id }}</span>
                                                </td>
                                                <td>
                                                    <div>
                                                        <strong>{{ user.nom }} {{ user.prenom }}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <a :href="`mailto:${user.email}`" class="text-decoration-none">
                                                        {{ user.email }}
                                                    </a>
                                                </td>
                                                <td>
                                                    <a v-if="user.telephone" :href="`tel:${user.telephone}`"
                                                        class="text-decoration-none">
                                                        {{ user.telephone }}
                                                    </a>
                                                    <span v-else class="text-muted">-</span>
                                                </td>
                                                <td>{{ formatDate(user.dateCreation) }}</td>
                                                <td>
                                                    <div class="btn-group btn-group-sm">
                                                        <button class="btn btn-outline-primary"
                                                            @click="handleEditUser(user.id)" title="Modifier">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="btn btn-outline-danger"
                                                            @click="handleDeleteUser(user)" title="Supprimer">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// États
const users = ref([])
const loading = ref(false)
const error = ref(null)

// Computed properties
const totalUsers = computed(() => users.value.length)

// Méthodes API
const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
        const response = await fetch('http://localhost:3000/users')
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des clients')
        }
        users.value = await response.json()
    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
    }
}

const deleteUser = async (id) => {
    try {
        const response = await fetch(`http://localhost:3000/users/${id}`, {
            method: 'DELETE'
        })
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression')
        }
        // Recharger la liste
        await fetchUsers()
    } catch (err) {
        error.value = err.message
    }
}

// Handlers
const handleRefresh = async () => {
    await fetchUsers()
}

const handleCreateUser = () => {
    router.push('/users/create')
}

const handleEditUser = (id) => {
    router.push(`/users/edit/${id}`)
}

const handleDeleteUser = async (user) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.nom} ${user.prenom}" ?`)) {
        try {
            await deleteUser(user.id)
            console.log('Utilisateur supprimé avec succès')
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
        }
    }
}

// Utilitaires

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
}

// Lifecycle
onMounted(async () => {
    await fetchUsers()
})
</script>

<style scoped>
.table th {
    border-top: none;
    font-weight: 600;
}

.btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
}

.spinner-border {
    color: var(--bs-primary);
}

.user-avatar {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e9ecef;
}

.avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.8rem;
}

.card:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease;
}

a.text-decoration-none:hover {
    text-decoration: underline !important;
}
</style>
