$(document).ready(function () {
    new Vue({
        el: '#app',
        data: {
            scope: 'ec2'
        },
        methods: {
            // Events
            onChangeScope: function (scope) {
                this.scope = scope;
            },
            onRefreshRequest: function () {
                this.$refs.planning.refresh();
            },
            onEditItem: function (item) {
                this.$refs.parameters.edit(item);
            },
            // Methods
            addItem: function () {
                this.$refs.parameters.add();
            }
        }
    });
});

