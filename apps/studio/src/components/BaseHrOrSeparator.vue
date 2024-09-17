<template>
    <hr class="or-separator" />
</template>
<style scoped>
.or-separator {
    border: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
    margin: 2rem 0 1.5rem;
}
.or-separator:after {
    display: block;
    content: 'OR';
    background-color: #fff !important;
    color: gray;
    width: 40px;
    font-size: 0.8rem;
    margin-top: -0.7rem;
    margin-left: -20px;
    left: 50%;
    text-align: center;
    position: absolute;
}
</style>
