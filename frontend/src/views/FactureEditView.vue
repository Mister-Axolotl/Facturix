<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1>Modifier une facture</h1>
                <FactureForm :factureId="$route.params.id" />
            </div>
        </div>
    </div>
</template>

<script setup>
import FactureForm from '../components/FactureFormModel.vue';
defineProps({
    id: {
        type: String,
        required: true,
    }
})
</script>

<style></style>