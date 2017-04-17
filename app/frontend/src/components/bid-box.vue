<template>

    <div>
        <h1>{{player.name}}</h1>
        <h4>{{bid}}</h4>
    </div>

</template>

<script>

    export default {
        props: ['player', 'turn'],
        computed: {
            bid() {
                if (this.player.bid === 0) {
                    return "--";
                } else if (this.player.bid === -1) {
                    return "Pass";
                } else {
                    return this.player.bid;
                }
            }
        }
    }

</script>