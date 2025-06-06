<template>
    <form @submit.prevent="handleSubmit">
        <div class="row">
            <!-- Client/UserID -->
            <div class="col-md-6 mb-3">
                <label for="userId" class="form-label">Client <span class="text-danger">*</span></label>
                <select class="form-select" id="userId" v-model="form.userId" :class="{ 'is-invalid': errors.userId }"
                    required>
                    <option value="">-- Sélectionnez un client --</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                        {{ user.nom }} {{ user.prenom }} ({{ user.email }})
                    </option>
                </select>
                <div v-if="errors.userId" class="invalid-feedback">
                    {{ errors.userId }}
                </div>
                <!-- Bouton pour créer un nouveau client -->
                <div class="mt-2">
                    <button type="button" class="btn btn-sm btn-outline-secondary" @click="createNewClient">
                        <i class="fas fa-plus"></i> Nouveau client
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-info ms-2" @click="refreshUsers">
                        <i class="fas fa-sync-alt"></i> Actualiser
                    </button>
                </div>
            </div>

            <!-- Date -->
            <div class="col-md-6 mb-3">
                <label for="date" class="form-label">Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" id="date" v-model="form.date"
                    :class="{ 'is-invalid': errors.date }" required>
                <div v-if="errors.date" class="invalid-feedback">
                    {{ errors.date }}
                </div>
            </div>
        </div>

        <!-- Description -->
        <div class="mb-3">
            <label for="description" class="form-label">Description <span class="text-danger">*</span></label>
            <textarea class="form-control" id="description" rows="3" v-model="form.description"
                :class="{ 'is-invalid': errors.description }" placeholder="Description de la facture"
                required></textarea>
            <div v-if="errors.description" class="invalid-feedback">
                {{ errors.description }}
            </div>
        </div>

        <div class="row">
            <!-- Total HT -->
            <div class="col-md-6 mb-3">
                <label for="totalHT" class="form-label">Total HT (€) <span class="text-danger">*</span></label>
                <div class="input-group">
                    <input type="number" class="form-control" id="totalHT" v-model.number="form.totalHT"
                        :class="{ 'is-invalid': errors.totalHT }" placeholder="0.00" step="0.01" min="0" required
                        @input="calculateTTC">
                    <span class="input-group-text">€</span>
                    <div v-if="errors.totalHT" class="invalid-feedback">
                        {{ errors.totalHT }}
                    </div>
                </div>
            </div>

            <!-- TVA -->
            <div class="col-md-6 mb-3">
                <label for="tva" class="form-label">TVA (%)</label>
                <div class="input-group">
                    <input type="number" class="form-control" id="tva" v-model.number="tvaRate" placeholder="20"
                        step="0.01" min="0" max="100" @input="calculateTTC">
                    <span class="input-group-text">%</span>
                </div>
            </div>
        </div>

        <!-- Total TTC -->
        <div class="mb-4">
            <label for="totalTTC" class="form-label">Total TTC (€) <span class="text-danger">*</span></label>
            <div class="input-group">
                <input type="number" class="form-control" id="totalTTC" v-model.number="form.totalTTC"
                    :class="{ 'is-invalid': errors.totalTTC }" placeholder="0.00" step="0.01" min="0" required>
                <span class="input-group-text">€</span>
                <div v-if="errors.totalTTC" class="invalid-feedback">
                    {{ errors.totalTTC }}
                </div>
            </div>
        </div>

        <!-- Loading users indicator -->
        <div v-if="loadingUsers" class="alert alert-info">
            <i class="fas fa-spinner fa-spin"></i> Chargement des clients...
        </div>

        <!-- Boutons -->
        <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="handleCancel">
                <i class="fas fa-times"></i> Annuler
            </button>

            <button type="submit" class="btn btn-primary" :disabled="loading || loadingUsers">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-save me-2"></i>
                {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
        </div>
    </form>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
    factureId: {
        type: [String, Number],
        default: null
    }
})

// Form data
const form = reactive({
    userId: null,
    description: '',
    date: new Date().toISOString().split('T')[0], // Date du jour par défaut
    totalHT: null,
    totalTTC: null
})

// États
const loading = ref(false)
const loadingUsers = ref(false)
const tvaRate = ref(20) // TVA par défaut à 20%
const errors = reactive({})
const users = ref([])

// Computed
const isEditMode = computed(() => !!props.factureId)

// Méthodes pour les utilisateurs
const fetchUsers = async () => {
    loadingUsers.value = true
    try {
        const response = await fetch('http://localhost:3000/users')
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des clients')
        }
        users.value = await response.json()
    } catch (error) {
        console.error('Erreur lors du chargement des clients:', error)
        // Vous pouvez ajouter une notification d'erreur ici
    } finally {
        loadingUsers.value = false
    }
}

const refreshUsers = async () => {
    await fetchUsers()
}

const createNewClient = () => {
    // Ouvrir dans un nouvel onglet pour ne pas perdre les données du formulaire
    window.open('/users/create', '_blank')
}

// Méthodes
const calculateTTC = () => {
    if (form.totalHT && tvaRate.value >= 0) {
        form.totalTTC = parseFloat((form.totalHT * (1 + tvaRate.value / 100)).toFixed(2))
    }
}

const validateForm = () => {
    // Reset errors
    Object.keys(errors).forEach(key => delete errors[key])

    let isValid = true

    if (!form.userId) {
        errors.userId = 'Vous devez sélectionner un client'
        isValid = false
    }

    if (!form.description || form.description.trim() === '') {
        errors.description = 'La description est requise'
        isValid = false
    }

    if (!form.date) {
        errors.date = 'La date est requise'
        isValid = false
    }

    if (!form.totalHT || form.totalHT < 0) {
        errors.totalHT = 'Le total HT est requis et doit être positif'
        isValid = false
    }

    if (!form.totalTTC || form.totalTTC < 0) {
        errors.totalTTC = 'Le total TTC est requis et doit être positif'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) return

    loading.value = true

    try {
        const factureData = {
            userId: form.userId,
            description: form.description.trim(),
            date: form.date,
            totalHT: form.totalHT,
            totalTTC: form.totalTTC,
            tva: tvaRate.value
        }

        const url = isEditMode.value
            ? `http://localhost:3000/factures/${props.factureId}`
            : 'http://localhost:3000/factures'

        const method = isEditMode.value ? 'PUT' : 'POST'

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(factureData)
        })

        if (!response.ok) {
            throw new Error('Erreur lors de la sauvegarde')
        }

        router.push('/factures')
    } catch (error) {
        console.error('Erreur:', error)
        // Vous pouvez ajouter une notification d'erreur ici
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    router.push('/factures')
}

const loadFacture = async () => {
    if (!isEditMode.value) return

    loading.value = true
    try {
        const response = await fetch(`http://localhost:3000/factures/${props.factureId}`)
        if (!response.ok) {
            throw new Error('Facture non trouvée')
        }
        const facture = await response.json()

        // Remplir le formulaire
        Object.assign(form, {
            userId: facture.userId,
            description: facture.description,
            date: facture.date,
            totalHT: facture.totalHT,
            totalTTC: facture.totalTTC
        })

        tvaRate.value = facture.tva || 20
    } catch (error) {
        console.error('Erreur:', error)
    } finally {
        loading.value = false
    }
}

// Calculer automatiquement le TTC quand le HT change
watch(() => form.totalHT, () => {
    calculateTTC()
})

// Lifecycle
onMounted(async () => {
    // Charger les utilisateurs en premier
    await fetchUsers()

    // Puis charger la facture si on est en mode édition
    if (isEditMode.value) {
        await loadFacture()
    }
})
</script>

<style scoped>
.form-label {
    font-weight: 600;
}

.text-danger {
    color: #dc3545 !important;
}

.is-invalid {
    border-color: #dc3545;
}

.invalid-feedback {
    display: block;
}

.form-select {
    border-radius: 0.375rem;
}

.btn-sm {
    font-size: 0.875rem;
}
</style>
