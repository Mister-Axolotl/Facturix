import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFacturesStore = defineStore('factures', () => {
    // State
    const factures = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Actions
    const fetchFactures = async () => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(import.meta.env.VITE_API_URL + '/factures')

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()
            factures.value = data
        } catch (err) {
            error.value = err.message
            console.error('Erreur lors de la récupération des factures:', err)
        } finally {
            loading.value = false
        }
    }

    const createFacture = async (factureData) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch('http://localhost:3000/factures', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(factureData),
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()
            factures.value.push(data.facture)
            return data
        } catch (err) {
            error.value = err.message
            console.error('Erreur lors de la création de la facture:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteFacture = async (id) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`http://localhost:3000/factures/${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            // Retirer la facture de la liste locale
            factures.value = factures.value.filter((facture) => facture.id !== id)

            return await response.json()
        } catch (err) {
            error.value = err.message
            console.error('Erreur lors de la suppression de la facture:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Getters
    const getFactureById = (id) => {
        return factures.value.find((facture) => facture.id === id)
    }

    const totalFactures = () => {
        return factures.value.length
    }

    const totalMontant = () => {
        return factures.value.reduce((total, facture) => total + facture.totalTTC, 0)
    }

    const getPrestationsByFactureId = (factureId) => {
        const facture = getFactureById(factureId)
        return facture?.prestations || []
    }

    return {
        // State
        factures,
        loading,
        error,
        // Actions
        fetchFactures,
        createFacture,
        deleteFacture,
        // Getters
        getFactureById,
        totalFactures,
        totalMontant,
        getPrestationsByFactureId,
    }
})
