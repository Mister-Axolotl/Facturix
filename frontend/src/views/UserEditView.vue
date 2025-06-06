<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1>Modifier un client</h1>
                <UserForm :userId="$route.params.id" />
            </div>

        </div>
    </div>
</template>

<script setup>
import UserForm from '../components/UserFormModel.vue';
defineProps({
    id: {
        type: String,
        required: true,
    }
})
</script>

<style></style>