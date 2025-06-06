<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <!-- Header -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 class="h3">Détail de la facture #{{ facture?.id }}</h1>
                        <p class="text-muted mb-0">{{ formatDate(facture?.date) }}</p>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-outline-secondary" @click="goBack">
                            <i class="fas fa-arrow-left"></i> Retour
                        </button>
                        <button class="btn btn-outline-primary" @click="editFacture">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn btn-outline-danger" @click="deleteFacture">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>

                <!-- Loading -->
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border"></div>
                </div>

                <!-- Error -->
                <div v-else-if="error" class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> {{ error }}
                </div>

                <!-- Facture Details -->
                <div v-else-if="facture" class="row">
                    <!-- Informations générales -->
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-file-alt me-2"></i>
                                    Informations générales
                                </h5>
                            </div>
                            <div class="card-body">
                                <dl class="row">
                                    <dt class="col-sm-4">Numéro:</dt>
                                    <dd class="col-sm-8">
                                        <span class="badge bg-secondary">#{{ facture.id }}</span>
                                    </dd>

                                    <dt class="col-sm-4">Client:</dt>
                                    <dd class="col-sm-8">{{ client?.nom }} {{ client?.prenom }}</dd>

                                    <dt class="col-sm-4">Email:</dt>
                                    <dd class="col-sm-8">{{ client?.email }}</dd>

                                    <dt class="col-sm-4">Date:</dt>
                                    <dd class="col-sm-8">{{ formatDate(facture.date) }}</dd>

                                    <dt class="col-sm-4">Description:</dt>
                                    <dd class="col-sm-8">{{ facture.description }}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <!-- Totaux calculés -->
                    <div class="col-md-6 mb-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-calculator me-2"></i>
                                    Totaux calculés
                                </h5>
                            </div>
                            <div class="card-body" style="height: 208px;">
                                <dl class="row">
                                    <dt class="col-sm-6">Total HT:</dt>
                                    <dd class="col-sm-6">{{ formatCurrency(totalPrestationsHT) }}</dd>

                                    <dt class="col-sm-6">TVA ({{ facture.tva || 20 }}%):</dt>
                                    <dd class="col-sm-6">{{ formatCurrency(totalTVA) }}</dd>

                                    <dt class="col-sm-6"><strong>Total TTC:</strong></dt>
                                    <dd class="col-sm-6">
                                        <strong class="text-primary fs-5">
                                            {{ formatCurrency(totalTTC) }}
                                        </strong>
                                    </dd>
                                </dl>

                                <div class="mt-3 p-2 bg-light rounded">
                                    <small class="text-muted">
                                        <i class="fas fa-info-circle me-1"></i>
                                        Totaux calculés automatiquement à partir des prestations
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Prestations -->
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-list me-2"></i>
                                    Prestations ({{ prestations.length }})
                                </h5>
                                <button class="btn btn-sm btn-outline-primary" @click="addPrestation">
                                    <i class="fas fa-plus"></i> Ajouter
                                </button>
                            </div>
                            <div class="card-body p-0">
                                <!-- Prestations vides -->
                                <div v-if="prestations.length === 0" class="text-center py-4">
                                    <i class="fas fa-inbox fa-2x text-muted mb-3"></i>
                                    <p class="text-muted">Aucune prestation ajoutée</p>
                                    <button class="btn btn-primary" @click="addPrestation">
                                        Ajouter la première prestation
                                    </button>
                                </div>

                                <!-- Liste des prestations -->
                                <div v-else class="table-responsive">
                                    <table class="table table-hover mb-0">
                                        <thead class="table-light">
                                            <tr>
                                                <th width="25%">Description</th>
                                                <th width="10%">Qté</th>
                                                <th width="12%">Prix unit.</th>
                                                <th width="12%">Remise</th>
                                                <th width="12%">Total HT</th>
                                                <th width="12%">Payé</th>
                                                <th width="12%">Reste</th>
                                                <th width="15%">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(prestation, index) in prestations"
                                                :key="prestation.id || index">
                                                <td>
                                                    <div>
                                                        <strong>{{ prestation.description }}</strong>
                                                    </div>
                                                </td>
                                                <td>{{ prestation.quantity }}</td>
                                                <td>{{ formatCurrency(prestation.prixUnitaire) }}</td>
                                                <td>
                                                    <span v-if="prestation.remise > 0" class="text-success">
                                                        {{ prestation.typeRemise === 'percentage' ?
                                                            `-${prestation.remise}%` :
                                                            formatCurrency(-prestation.remise) }}
                                                    </span>
                                                    <span v-else class="text-muted">-</span>
                                                </td>
                                                <td>
                                                    <strong>{{ formatCurrency(calculateSubtotalWithRemise(prestation))
                                                    }}</strong>
                                                    <small v-if="prestation.remise > 0" class="d-block text-muted">
                                                        <del>{{ formatCurrency(calculateSubtotal(prestation)) }}</del>
                                                    </small>
                                                </td>
                                                <td>
                                                    <span :class="getPaymentStatusClass(prestation)">
                                                        {{ formatCurrency(prestation.montantPaye || 0) }}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span :class="getRemainingStatusClass(prestation)">
                                                        {{ formatCurrency(calculateRemaining(prestation)) }}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div class="btn-group btn-group-sm">
                                                        <button class="btn btn-outline-success"
                                                            @click="editPayment(index)" title="Modifier paiement">
                                                            <i class="fas fa-euro-sign"></i>
                                                        </button>
                                                        <button class="btn btn-outline-primary"
                                                            @click="editPrestation(index)" title="Modifier">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button class="btn btn-outline-danger"
                                                            @click="deletePrestation(index)" title="Supprimer">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tfoot class="table-light">
                                            <tr>
                                                <th colspan="4" class="text-end">Total général HT:</th>
                                                <th>{{ formatCurrency(totalPrestationsHT) }}</th>
                                                <th>{{ formatCurrency(totalPrestationsPaye) }}</th>
                                                <th>{{ formatCurrency(totalPrestationsRestant) }}</th>
                                                <th></th>
                                            </tr>
                                        </tfoot>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// États
const facture = ref(null)
const client = ref(null)
const loading = ref(false)
const error = ref(null)

// Computed pour les prestations
const prestations = computed(() => {
    return facture.value?.prestations || []
})

// Fonction utilitaire pour calculer le sous-total d'une prestation (sans remise)
const calculateSubtotal = (prestation) => {
    const quantity = parseFloat(prestation.quantity) || 0
    const prixUnitaire = parseFloat(prestation.prixUnitaire) || 0
    return quantity * prixUnitaire
}

// Fonction pour calculer le sous-total avec remise
const calculateSubtotalWithRemise = (prestation) => {
    const subtotal = calculateSubtotal(prestation)
    if (!prestation.remise || prestation.remise <= 0) return subtotal

    if (prestation.typeRemise === 'percentage') {
        return subtotal * (1 - prestation.remise / 100)
    } else {
        return Math.max(0, subtotal - prestation.remise)
    }
}

// Fonction pour calculer le montant restant à payer
const calculateRemaining = (prestation) => {
    const total = calculateSubtotalWithRemise(prestation)
    const paye = prestation.montantPaye || 0
    return Math.max(0, total - paye)
}

// Fonction pour déterminer la classe CSS du statut de paiement
const getPaymentStatusClass = (prestation) => {
    const total = calculateSubtotalWithRemise(prestation)
    const paye = prestation.montantPaye || 0

    if (paye >= total) return 'text-success fw-bold'
    if (paye > 0) return 'text-warning fw-bold'
    return 'text-muted'
}

// Fonction pour déterminer la classe CSS du montant restant
const getRemainingStatusClass = (prestation) => {
    const remaining = calculateRemaining(prestation)
    return remaining > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'
}

// Computed pour les totaux calculés à partir des prestations
const totalPrestationsHT = computed(() => {
    if (!prestations.value || prestations.value.length === 0) return 0

    return prestations.value.reduce((total, prestation) => {
        return total + calculateSubtotalWithRemise(prestation)
    }, 0)
})

const totalPrestationsPaye = computed(() => {
    return prestations.value.reduce((total, prestation) => {
        return total + (prestation.montantPaye || 0)
    }, 0)
})

const totalPrestationsRestant = computed(() => {
    return prestations.value.reduce((total, prestation) => {
        return total + calculateRemaining(prestation)
    }, 0)
})

const totalTVA = computed(() => {
    const tvaRate = facture.value?.tva || 20
    return totalPrestationsHT.value * (tvaRate / 100)
})

const totalTTC = computed(() => {
    return totalPrestationsHT.value + totalTVA.value
})

// Méthodes API
const loadFacture = async () => {
    const factureId = route.params.id
    loading.value = true
    error.value = null

    try {
        // Charger la facture avec ses prestations
        const factureResponse = await fetch(`http://localhost:3000/factures/${factureId}`)
        if (!factureResponse.ok) {
            throw new Error('Facture non trouvée')
        }
        facture.value = await factureResponse.json()

        // Charger le client
        if (facture.value.userId) {
            const clientResponse = await fetch(`http://localhost:3000/users/${facture.value.userId}`)
            if (clientResponse.ok) {
                client.value = await clientResponse.json()
            }
        }

    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
    }
}

// Actions
const goBack = () => {
    router.push('/factures')
}

const editFacture = () => {
    router.push(`/factures/edit/${route.params.id}`)
}

const deleteFacture = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return

    try {
        const response = await fetch(`http://localhost:3000/factures/${route.params.id}`, {
            method: 'DELETE'
        })

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression')
        }

        router.push('/factures')
    } catch (err) {
        error.value = err.message
    }
}

// Méthodes pour les prestations
const deletePrestation = async (index) => {
    const prestation = prestations.value[index]
    if (!confirm(`Supprimer la prestation "${prestation.description}" ?`)) return

    try {
        const response = await fetch(`http://localhost:3000/prestations/${prestation.id}`, {
            method: 'DELETE'
        })

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression')
        }

        // Recharger la facture pour mettre à jour les prestations
        await loadFacture()
        console.log('Prestation supprimée avec succès')
    } catch (err) {
        error.value = err.message
        console.error('Erreur:', err)
    }
}

const addPrestation = () => {
    const description = prompt('Description de la prestation:')
    if (!description) return

    const quantity = prompt('Quantité:')
    if (!quantity || isNaN(quantity)) return

    const prixUnitaire = prompt('Prix unitaire:')
    if (!prixUnitaire || isNaN(prixUnitaire)) return

    const remise = prompt('Remise (% ou montant fixe, 0 si aucune):')
    const remiseValue = parseFloat(remise) || 0

    let typeRemise = 'percentage'
    if (remiseValue > 0) {
        typeRemise = confirm('La remise est-elle en pourcentage ?\nOK = Pourcentage, Annuler = Montant fixe')
            ? 'percentage' : 'fixed'
    }

    const montantPaye = prompt('Montant déjà payé (0 si aucun):')
    const montantPayeValue = parseFloat(montantPaye) || 0

    createPrestation({
        factureId: facture.value.id,
        description,
        quantity: parseFloat(quantity),
        prixUnitaire: parseFloat(prixUnitaire),
        remise: remiseValue,
        typeRemise,
        montantPaye: montantPayeValue
    })
}

const createPrestation = async (prestationData) => {
    try {
        const response = await fetch('http://localhost:3000/prestations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prestationData)
        })

        if (!response.ok) {
            throw new Error('Erreur lors de la création')
        }

        // Recharger la facture pour mettre à jour les prestations
        await loadFacture()
        console.log('Prestation créée avec succès')
    } catch (err) {
        error.value = err.message
        console.error('Erreur:', err)
    }
}

const editPrestation = (index) => {
    const prestation = prestations.value[index]

    console.log('Modification de la prestation:', prestation);

    const description = prompt('Description:', prestation.description)
    if (!description) return

    const quantity = prompt('Quantité:', prestation.quantity)
    if (!quantity || isNaN(quantity)) return

    const prixUnitaire = prompt('Prix unitaire:', prestation.prixUnitaire)
    if (!prixUnitaire || isNaN(prixUnitaire)) return

    const remise = prompt('Remise:', prestation.remise || 0)
    const remiseValue = parseFloat(remise) || 0

    let typeRemise = prestation.typeRemise || 'percentage'
    if (remiseValue > 0) {
        typeRemise = confirm('La remise est-elle en pourcentage ?\nOK = Pourcentage, Annuler = Montant fixe')
            ? 'percentage' : 'fixed'
    }

    const montantPaye = prompt('Montant payé:', prestation.montantPaye || 0)
    const montantPayeValue = parseFloat(montantPaye) || 0

    const prestationData = {
        description,
        quantity: parseFloat(quantity),
        prixUnitaire: parseFloat(prixUnitaire),
        remise: remiseValue,
        typeRemise,
        montantPaye: montantPayeValue,
        tva: prestation.tva || 20
    };

    console.log('Données de la prestation à modifier:', prestationData);

    updatePrestation(prestation.id, prestationData)
}

const editPayment = (index) => {
    const prestation = prestations.value[index]
    const total = calculateSubtotalWithRemise(prestation)
    const currentPaye = prestation.montantPaye || 0

    const newMontantPaye = prompt(
        `Montant payé pour "${prestation.description}":\n` +
        `Total: ${formatCurrency(total)}\n` +
        `Actuellement payé: ${formatCurrency(currentPaye)}\n` +
        `Reste à payer: ${formatCurrency(total - currentPaye)}`,
        currentPaye
    )

    if (newMontantPaye === null) return

    const montantPaye = parseFloat(newMontantPaye) || 0

    if (montantPaye < 0) {
        alert('Le montant payé ne peut pas être négatif')
        return
    }

    updatePrestation(prestation.id, {
        description: prestation.description,
        quantity: prestation.quantity,
        prixUnitaire: prestation.prixUnitaire,
        remise: prestation.remise || 0,
        typeRemise: prestation.typeRemise || 'percentage',
        montantPaye
    })
}

const updatePrestation = async (prestationId, prestationData) => {
    try {
        console.log('Envoi de la modification pour prestation ID:', prestationId);
        console.log('Données à envoyer:', prestationData);

        const response = await fetch(`http://localhost:3000/prestations/${prestationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prestationData)
        })

        console.log('Réponse du serveur:', response.status);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Erreur serveur:', errorData);
            throw new Error(`Erreur lors de la modification: ${response.status}`);
        }

        const result = await response.json();
        console.log('Résultat:', result);

        // Recharger la facture pour mettre à jour les prestations
        await loadFacture()
        console.log('Prestation modifiée avec succès')
    } catch (err) {
        error.value = err.message
        console.error('Erreur complète:', err)
    }
}

// Utilitaires
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount)
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Lifecycle
onMounted(() => {
    loadFacture()
})
</script>

<style scoped>
.card {
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.btn-group-sm .btn {
    padding: 0.25rem 0.5rem;
}

.table th {
    border-top: none;
    font-weight: 600;
}

dl.row dt {
    font-weight: 600;
    color: #495057;
}

dl.row dd {
    color: #6c757d;
}

.text-primary {
    color: #0d6efd !important;
}

.badge {
    font-size: 0.875em;
}

.bg-light {
    background-color: #f8f9fa !important;
}

/* Nouveaux styles pour les statuts de paiement */
.text-success {
    color: #198754 !important;
}

.text-warning {
    color: #ffc107 !important;
}

.text-danger {
    color: #dc3545 !important;
}

.fw-bold {
    font-weight: bold !important;
}

/* Style pour les prix barrés */
del {
    color: #6c757d;
    font-size: 0.875em;
}
</style>
