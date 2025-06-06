<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="h1">Factures</h1>
                    <button class="btn btn-primary" @click="handleCreateFacture">
                        <i class="fas fa-plus"></i> Nouvelle facture
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
                <div v-else-if="factures.length === 0" class="text-center py-5">
                    <i class="fas fa-file-invoice fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Aucune facture trouvée</p>
                    <button class="btn btn-primary" @click="handleCreateFacture">
                        Créer votre première facture
                    </button>
                </div>

                <!-- Factures list -->
                <div v-else class="row">
                    <div class="col-12 p-5 pt-0">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    Liste des factures ({{ totalFactures }})
                                    <small class="text-muted">
                                        - Total: {{ formatCurrency(totalMontantCalculated) }}
                                    </small>
                                </h5>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0">
                                        <thead class="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Description</th>
                                                <th>Date</th>
                                                <th>Nb Prestations</th>
                                                <th>Total HT</th>
                                                <th>Total TTC</th>
                                                <th>Statut</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="facture in factures" :key="facture.id">
                                                <td>
                                                    <span class="badge bg-secondary">#{{ facture.id }}</span>
                                                </td>
                                                <td>{{ facture.description }}</td>
                                                <td>{{ formatDate(facture.date) }}</td>
                                                <td>
                                                    <span class="badge bg-info">{{ getPrestationsCount(facture)
                                                        }}</span>
                                                </td>
                                                <td>{{ formatCurrency(calculateTotalHT(facture)) }}</td>
                                                <td>
                                                    <strong>{{ formatCurrency(calculateTotalTTC(facture)) }}</strong>
                                                </td>
                                                <td>
                                                    <span :class="['badge', getPaymentBadge(facture).class]">
                                                        {{ getPaymentBadge(facture).text }}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div class="btn-group btn-group-sm">
                                                        <button class="btn btn-outline-info"
                                                            @click="handleViewFacture(facture.id)" title="Voir">
                                                            <i class="fas fa-eye"></i>
                                                        </button>
                                                        <button class="btn btn-outline-primary"
                                                            @click="handleEditFacture(facture.id)" title="Modifier">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="btn btn-outline-danger"
                                                            @click="handleDeleteFacture(facture)" title="Supprimer">
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
import { onMounted, computed } from 'vue'
import { useFacturesStore } from '@/stores/factures'
import { useRouter } from 'vue-router'

const facturesStore = useFacturesStore()
const router = useRouter()

// Computed properties
const factures = computed(() => facturesStore.factures)
const loading = computed(() => facturesStore.loading)
const error = computed(() => facturesStore.error)
const totalFactures = computed(() => facturesStore.totalFactures())

// Fonctions de calcul des totaux
const calculateTotalHT = (facture) => {
    if (!facture.prestations || facture.prestations.length === 0) return 0

    return facture.prestations.reduce((total, prestation) => {
        const quantity = parseFloat(prestation.quantity) || 0
        const prixUnitaire = parseFloat(prestation.prixUnitaire) || 0
        let subtotal = quantity * prixUnitaire

        // Appliquer la remise si elle existe
        if (prestation.remise && prestation.remise > 0) {
            if (prestation.typeRemise === 'percentage') {
                subtotal = subtotal * (1 - prestation.remise / 100)
            } else {
                subtotal = Math.max(0, subtotal - prestation.remise)
            }
        }

        return total + subtotal
    }, 0)
}

const calculateTotalTTC = (facture) => {
    const totalHT = calculateTotalHT(facture)
    const tva = facture.tva || 20 // TVA par défaut 20%
    return totalHT * (1 + tva / 100)
}

const getPrestationsCount = (facture) => {
    return facture.prestations ? facture.prestations.length : 0
}

const calculateTotalPaye = (facture) => {
    if (!facture.prestations || facture.prestations.length === 0) return 0

    return facture.prestations.reduce((total, prestation) => {
        return total + (prestation.montantPaye || 0)
    }, 0)
}

const getPaymentStatus = (facture) => {
    const totalHT = calculateTotalHT(facture)
    const totalPaye = calculateTotalPaye(facture)

    if (totalHT === 0) return 'empty'
    if (totalPaye >= totalHT) return 'paid'
    if (totalPaye > 0) return 'partial'
    return 'unpaid'
}

const getPaymentBadge = (facture) => {
    const status = getPaymentStatus(facture)
    switch (status) {
        case 'paid': return { class: 'bg-success', text: 'Payée' }
        case 'partial': return { class: 'bg-warning', text: 'Partielle' }
        case 'empty': return { class: 'bg-secondary', text: 'Vide' }
        default: return { class: 'bg-danger', text: 'Non payée' }
    }
}

// Total calculé de toutes les factures
const totalMontantCalculated = computed(() => {
    return factures.value.reduce((total, facture) => {
        return total + calculateTotalTTC(facture)
    }, 0)
})

// Methods
const handleRefresh = async () => {
    await facturesStore.fetchFactures()
}

const handleCreateFacture = () => {
    router.push('/factures/create')
}

const handleEditFacture = (id) => {
    router.push(`/factures/edit/${id}`)
}

const handleViewFacture = (id) => {
    router.push(`/factures/${id}`)
}

const handleDeleteFacture = async (facture) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la facture "${facture.description}" ?`)) {
        try {
            await facturesStore.deleteFacture(facture.id)
            console.log('Facture supprimée avec succès')
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
        }
    }
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount)
}

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
}

// Lifecycle
onMounted(async () => {
    await facturesStore.fetchFactures()
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
</style>
