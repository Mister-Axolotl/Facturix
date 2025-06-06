<template>
    <form @submit.prevent="handleSubmit">
        <div class="row">
            <!-- Nom -->
            <div class="col-md-6 mb-3">
                <label for="nom" class="form-label">Nom <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="nom" v-model="form.nom"
                    :class="{ 'is-invalid': errors.nom }" placeholder="Nom de famille" required>
                <div v-if="errors.nom" class="invalid-feedback">
                    {{ errors.nom }}
                </div>
            </div>

            <!-- Prénom -->
            <div class="col-md-6 mb-3">
                <label for="prenom" class="form-label">Prénom <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="prenom" v-model="form.prenom"
                    :class="{ 'is-invalid': errors.prenom }" placeholder="Prénom" required>
                <div v-if="errors.prenom" class="invalid-feedback">
                    {{ errors.prenom }}
                </div>
            </div>
        </div>

        <!-- Email -->
        <div class="mb-3">
            <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
            <input type="email" class="form-control" id="email" v-model="form.email"
                :class="{ 'is-invalid': errors.email }" placeholder="exemple@email.com" required>
            <div v-if="errors.email" class="invalid-feedback">
                {{ errors.email }}
            </div>
        </div>

        <!-- Téléphone -->
        <div class="mb-3">
            <label for="telephone" class="form-label">Téléphone</label>
            <input type="tel" class="form-control" id="telephone" v-model="form.telephone"
                :class="{ 'is-invalid': errors.telephone }" placeholder="06 12 34 56 78">
            <div v-if="errors.telephone" class="invalid-feedback">
                {{ errors.telephone }}
            </div>
        </div>

        <!-- Date de création (affiché en lecture seule en mode édition) -->
        <div v-if="isEditMode" class="mb-3">
            <label for="dateCreation" class="form-label">Date de création</label>
            <input type="date" class="form-control" id="dateCreation" v-model="form.dateCreation" readonly disabled>
        </div>

        <!-- Boutons -->
        <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="handleCancel">
                <i class="fas fa-times"></i> Annuler
            </button>

            <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-save me-2"></i>
                {{ loading ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Enregistrer') }}
            </button>
        </div>
    </form>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Props pour le mode édition
const props = defineProps({
    userId: {
        type: [String, Number],
        default: null
    }
})

// Détecter le mode édition
const isEditMode = computed(() => !!props.userId || !!route.params.id)
const currentUserId = computed(() => props.userId || route.params.id)

// Form data
const form = reactive({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    entreprise: '',
    adresse: '',
    dateCreation: ''
})

// États
const loading = ref(false)
const errors = reactive({})

// Validation
const validateForm = () => {
    // Reset errors
    Object.keys(errors).forEach(key => delete errors[key])

    let isValid = true

    // Nom requis
    if (!form.nom || form.nom.trim() === '') {
        errors.nom = 'Le nom est requis'
        isValid = false
    }

    // Prénom requis
    if (!form.prenom || form.prenom.trim() === '') {
        errors.prenom = 'Le prénom est requis'
        isValid = false
    }

    // Email requis et format valide
    if (!form.email || form.email.trim() === '') {
        errors.email = 'L\'email est requis'
        isValid = false
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(form.email)) {
            errors.email = 'Format d\'email invalide'
            isValid = false
        }
    }

    // Téléphone optionnel mais format si renseigné
    if (form.telephone && form.telephone.trim() !== '') {
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
        if (!phoneRegex.test(form.telephone.replace(/\s/g, ''))) {
            errors.telephone = 'Format de téléphone invalide'
            isValid = false
        }
    }

    return isValid
}

// Charger les données utilisateur en mode édition
const loadUser = async () => {
    if (!isEditMode.value) return

    loading.value = true
    try {
        const response = await fetch(`http://localhost:3000/users/${currentUserId.value}`)
        if (!response.ok) {
            throw new Error('Utilisateur non trouvé')
        }
        const user = await response.json()

        // Remplir le formulaire avec les données existantes
        Object.assign(form, {
            nom: user.nom || '',
            prenom: user.prenom || '',
            email: user.email || '',
            telephone: user.telephone || '',
            entreprise: user.entreprise || '',
            adresse: user.adresse || '',
            dateCreation: user.dateCreation || ''
        })

    } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error)
        // Rediriger vers la liste si l'utilisateur n'existe pas
        router.push('/users')
    } finally {
        loading.value = false
    }
}

// Soumission du formulaire
const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    loading.value = true

    try {
        const userData = {
            nom: form.nom.trim(),
            prenom: form.prenom.trim(),
            email: form.email.trim().toLowerCase(),
            telephone: form.telephone.trim() || null,
            entreprise: form.entreprise.trim() || null,
            adresse: form.adresse.trim() || null
        }

        const url = isEditMode.value
            ? `http://localhost:3000/users/${currentUserId.value}`
            : 'http://localhost:3000/users'

        const method = isEditMode.value ? 'PUT' : 'POST'

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })

        const result = await response.json()

        if (!response.ok) {
            // Afficher l'erreur du serveur
            if (result.error) {
                if (result.error.includes('email existe déjà')) {
                    errors.email = result.error
                } else {
                    console.error('Erreur serveur:', result.error)
                }
                return
            }
            throw new Error('Erreur lors de la sauvegarde')
        }

        // Redirection vers la liste des utilisateurs
        router.push('/users')
    } catch (error) {
        console.error('Erreur:', error)
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    router.push('/users')
}

// Lifecycle
onMounted(() => {
    if (isEditMode.value) {
        loadUser()
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

input:disabled {
    background-color: #f8f9fa;
    opacity: 0.7;
}
</style>
